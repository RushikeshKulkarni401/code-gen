from services.preprocessing import preprocess_query
from services.embedding import EmbeddingService

embedding_service = EmbeddingService() 

def generate_code_from_query(query):
    cleaned = preprocess_query(query)
    return embedding_service.find_best_match(cleaned)
    # return {
    #     "code": "df.dropna()",
    #     "matched_snippet_name": "drop duplicates",
    #     "confidence_score": "100"
    # }
