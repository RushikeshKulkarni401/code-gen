from services.preprocessing_service import preprocess_query


def generate_code_from_query(query):
    cleaned = preprocess_query(query)
    return {
        "code": "df.dropna()",
        "matched_snippet_name": "drop duplicates",
        "confidence_score": "100"
    }
