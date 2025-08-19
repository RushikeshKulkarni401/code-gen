# embeddings.py

import json
import logging
import numpy as np
from pathlib import Path
from sentence_transformers import SentenceTransformer
from services.preprocessing import preprocess_snippet_for_embedding

class EmbeddingService:
     
    _instance = None  # Singleton instance

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        """One-time initialization with Sentence Transformers"""
        print("Loading Sentence Transformer model...")
        # Using a lightweight model good for semantic similarity
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        print("Model loaded successfully!")
        self.snippet_embeddings = self._load_embeddings()

    def _load_embeddings(self):
        """Load snippets and precompute embeddings with enhanced preprocessing"""
        snippets_path = Path(__file__).parent.parent / "snippets" / "code_base.json"
        with open(snippets_path, "r") as f:
            snippets = json.load(f)
        
        embeddings = {}
        for snippet in snippets:
            # Use enhanced preprocessing for title + summary
            embedding_text = preprocess_snippet_for_embedding(snippet)
            print(f"Processing: {snippet['title']}")
            print(f"Preprocessed text: '{embedding_text}'")
            
            embeddings[snippet["title"]] = {
                "embedding": self._get_embedding(embedding_text),
                "body": snippet["body"],
                "tags": snippet.get("tags", []),
                "summary": snippet["summary"]  # Store summary for reference
            }
        return embeddings

    def _get_embedding(self, text):
        """Generate normalized embedding using Sentence Transformer"""
        return self.model.encode(text)  # Already normalized by the model
    
    def find_best_match(self, query, top_k=3, min_stars=2):
        """Return top-k matching snippets with minimum star rating filter"""
        
        query_embedding = self._get_embedding(query)
        
        # Calculate all scores
        scores = []
        for name, data in self.snippet_embeddings.items():
            similarity = np.dot(query_embedding, data["embedding"])
            star_rating = max(1, min(5, int(np.ceil(similarity * 5))))
            scores.append((name, similarity, star_rating))
        
        # Sort by similarity descending
        scores.sort(key=lambda x: x[1], reverse=True)
        
        # Apply minimum star rating filter
        filtered_results = []
        for title, similarity, star_rating in scores:
            if star_rating >= min_stars:
                result = {
                    "title": title,
                    "summary": self.snippet_embeddings[title]["summary"],
                    "code": self.snippet_embeddings[title]["body"],
                    "tags": self.snippet_embeddings[title]["tags"],
                    "score": star_rating
                }
                filtered_results.append(result)
        
        # Get top-k results from filtered list
        top_results = filtered_results[:top_k]
        
        # Print results
        print(f"\nTop-{top_k} matches (min {min_stars}+ stars):")
        for i, result in enumerate(top_results):
            print(f"#{i+1}: '{result['title']}' -  Stars: {result['score']}")
        
        return top_results