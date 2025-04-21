import requests
from flask import Flask, request, jsonify
from src.services.user_service import processing

def handle_user_search(prompt):
    if not prompt:
        return jsonify({"error": "Missing prompt"}), 400
    try:
        products, similar_products, quantity, total_price, stores = processing(prompt)
        return jsonify({"products": products, 
                        "similar_products": similar_products, 
                        "quantity": quantity, 
                        "total_price": total_price, 
                        "stores": stores}), 200
    except ValueError as e:
        return jsonify({"error": "Invalid prompt: " + str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Internal server error: " + str(e)}), 500

