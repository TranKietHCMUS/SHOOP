from src.services.ai_service import insert_products
from flask import jsonify

def handle_ai_insert(products):
    success = insert_products(products)
    return jsonify({"message": f"**{len(success)}** products vectors inserted successfully"}), 200


