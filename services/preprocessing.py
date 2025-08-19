# preprocessing.py

import spacy
import re
import logging
from typing import List
import html

# Load spaCy model
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    logging.warning("spaCy model not found. Installing...")
    import subprocess
    subprocess.run(["python", "-m", "spacy", "download", "en_core_web_sm"])
    nlp = spacy.load("en_core_web_sm")

# Data Science specific keywords - MUCH more focused
DATA_SCIENCE_KEYWORDS = {
    # Core data science operations
    'data', 'analysis', 'analyze', 'clean', 'cleanse', 'preprocess', 
    'transform', 'feature', 'engineering', 'model', 'train', 'training',
    'predict', 'prediction', 'evaluate', 'evaluation', 'score', 'scoring',
    
    # Data structures and types
    'dataframe', 'series', 'array', 'matrix', 'tensor', 'dataset',
    'column', 'row', 'index', 'header', 'nan', 'null', 'missing',
    
    # Visualization
    'plot', 'chart', 'graph', 'visualize', 'visualization', 'histogram',
    'scatter', 'bar', 'line', 'heatmap', 'seaborn', 'matplotlib', 'plotly',
    
    # Common data science libraries
    'pandas', 'numpy', 'sklearn', 'scikit', 'tensorflow', 'pytorch', 'keras',
    'seaborn', 'matplotlib', 'plotly', 'statsmodels', 'scipy',
    
    # Jupyter specific
    'jupyter', 'notebook', 'cell', 'kernel', 'magic', 'ipython',
    
    # Statistical concepts
    'mean', 'median', 'mode', 'std', 'standard', 'deviation', 'variance',
    'correlation', 'regression', 'classification', 'cluster', 'clustering',
    'outlier', 'normalize', 'standardize', 'scale',
    
    # Machine learning terms
    'machine', 'learning', 'ml', 'ai', 'algorithm', 'supervised', 'unsupervised',
    'linear', 'logistic', 'random', 'forest', 'xgboost', 'lightgbm', 'catboost',
    'neural', 'network', 'nn', 'deep', 'learning', 'cnn', 'rnn',
    
    # Evaluation metrics
    'accuracy', 'precision', 'recall', 'f1', 'score', 'auc', 'roc', 'mse',
    'rmse', 'mae', 'r2', 'r squared',
    
    # Essential Python for DS
    'import', 'from', 'as', 'def', 'return', 'for', 'in', 'if', 'else'
}

def preprocess_query(query: str) -> str:
    """Preprocess user query for semantic search"""
    return preprocess_for_embedding(query)

def get_embedding_text_from_snippet(snippet: dict) -> str:
    """Extract title and summary for embedding"""
    title = snippet.get('title', '')
    summary = snippet.get('summary', '')
    return f"{title} : {summary}".strip()

def preprocess_snippet_for_embedding(snippet: dict) -> str:
    """Full preprocessing for snippet's embedding text"""
    embedding_text = get_embedding_text_from_snippet(snippet)
    return preprocess_for_embedding(embedding_text)

def preprocess_for_embedding(text: str) -> str:
    """
    Preprocess text for embedding generation
    """
    if not text or not isinstance(text, str):
        return ""
    
    # Step 1: Basic cleaning
    text = text.lower().strip()
    
    # Step 2: Handle HTML entities
    text = html.unescape(text)
    
    # Step 3: Remove URLs
    text = re.sub(r'http\S+|www\.\S+', '', text)
    
    # Step 4: Remove special characters but keep basic punctuation
    text = re.sub(r'[^\w\s\.\,\-\]]', ' ', text)
    
    # Step 5: Collapse multiple spaces
    text = re.sub(r'\s+', ' ', text)
    
    # Step 6: Process with spaCy
    doc = nlp(text)

    # Step 7: Proper lemmatization with data science focus
    tokens = []
    for token in doc:
        lemma = token.lemma_.lower().strip()
        
        # Skip empty lemmas
        if not lemma:
            continue
            
        # Check if we should keep this token using the lemma
        if _should_keep_lemma_datascience(token, lemma):
            tokens.append(lemma)
    
    # Step 8: Remove duplicates but maintain order
    seen = set()
    unique_tokens = []
    for token in tokens:
        if token not in seen:
            seen.add(token)
            unique_tokens.append(token)
    
    cleaned_text = " ".join(unique_tokens)
    
    logging.debug(f"Preprocessed: '{text}' -> '{cleaned_text}'")
    
    return cleaned_text

def _should_keep_lemma_datascience(token, lemma: str) -> bool:
    """Determine if a lemma should be kept for data science context"""
    # Keep data science keywords regardless of stopword status
    if lemma in DATA_SCIENCE_KEYWORDS:
        return True
    
    # Remove general stopwords (check both original and lemma)
    if token.is_stop or lemma in nlp.Defaults.stop_words:
        return False
    
    # Remove punctuation
    if token.is_punct:
        return False
    
    # Remove very short lemmas (except meaningful single letters)
    if len(lemma) < 2 and lemma not in {'x', 'y', 'z'}:
        return False
    
    # Remove standalone numbers
    if token.like_num and len(lemma) < 3:
        return False
    
    return True

