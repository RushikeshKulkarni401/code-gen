# preprocessing.py

import spacy
import re
import logging

nlp = spacy.load("en_core_web_sm")

def preprocess_query(query):
    # Lowercase
    query = query.lower()

    # Remove special characters
    query = re.sub(r"[^a-zA-Z0-9\s]", "", query)

    # Process with spaCy
    doc = nlp(query)

    # Remove stopwords and lemmatize
    tokens = [token.lemma_ for token in doc if not token.is_stop]

    # Join back to string
    cleaned_query = " ".join(tokens)

    logging.info("cleaned query", cleaned_query)

    return cleaned_query
