from services.preprocessing import preprocess_query
from services.embedding import EmbeddingService

embedding_service = EmbeddingService() 

def generate_code_from_query(query):
    print(f"Original query: {query}")
    cleaned = preprocess_query(query)
    print(f"Preprocessed query: {cleaned}")
    return embedding_service.find_best_match(cleaned)

