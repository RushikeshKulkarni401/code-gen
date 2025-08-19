from flask import Blueprint, request, jsonify
from services.code_generation import generate_code_from_query
import logging

generate_bp = Blueprint("generate", __name__)

@generate_bp.route("/generate", methods=["POST"])
def generate():
    query = request.json.get("query", "")
    logging.info(f"Received query: {query}")
    result = generate_code_from_query(query)
    return jsonify(result), 200
