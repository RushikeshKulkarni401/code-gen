import json
import torch
import numpy as np
from pathlib import Path
from transformers import AutoTokenizer, AutoModel

class EmbeddingService:
     
    _instance = None  # Singleton instance

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        """One-time initialization"""
        self.tokenizer = AutoTokenizer.from_pretrained("microsoft/codebert-base")
        self.model = AutoModel.from_pretrained("microsoft/codebert-base")
        self.snippet_embeddings = self._load_embeddings()

    def _load_embeddings(self):
        """Load snippets and precompute embeddings on startup"""
        snippets_path = Path(__file__).parent.parent / "snippets" / "code_base.json"
        with open(snippets_path, "r") as f:
            snippets = json.load(f)
        
        embeddings = {}
        for snippet in snippets:
            # Use title + summary as embedding text
            text = f"{snippet['title']}: {snippet['summary']}"
            print(f"Processing text: {text}")
            embeddings[snippet["title"]] = {
                "embedding": self._get_embedding(text),
                "body": snippet["body"],
                "tags": snippet.get("tags", [])
            }
        return embeddings

    def _get_embedding(self, text):
        """Generate CodeBERT embedding for a single text"""
        inputs = self.tokenizer(text, return_tensors="pt", 
                              truncation=True, padding=True, 
                              max_length=128)
        with torch.no_grad():
            outputs = self.model(**inputs)
        return outputs.last_hidden_state.mean(dim=1).squeeze().numpy()

    def find_best_match(self, query):
        """Compare query against all snippets"""
        query_embedding = self._get_embedding(query)
        best_match_title, max_score = None, -1
        
        for name, data in self.snippet_embeddings.items():
            score = np.dot(query_embedding, data["embedding"])
            print(f"Comparing with {name}: score = {score}")
            if score > max_score:
                best_match_title = name
                max_score = score
                
        return {
            "title": best_match_title,
            "score": float(max_score),
            "code": self.snippet_embeddings[best_match_title]["body"],
            "tags": self.snippet_embeddings[best_match_title]["tags"]
        }
        # return {
        #     "match": "best_match",
        #     "score": "float(max_score)",
        #     "code": "self.snippet_embeddings[best_match][\"body\"]",
        #     "tags": "self.snippet_embeddings[best_match][\"tags\"]"
        # }
        