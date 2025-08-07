from flask import Blueprint, request, jsonify
from services.code_generation_service import generate_code_from_query

generate_bp = Blueprint("generate", __name__)

@generate_bp.route("/generate", methods=["POST"])
def generate():
    query = request.json.get("query", "")
    result = generate_code_from_query(query)
    return jsonify(result), 200
