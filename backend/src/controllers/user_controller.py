import requests
from flask import Flask, request, jsonify
from src.services.services import user_service

class UserController:
    def __init__(self):
        self.user_service = user_service

    def handle_user_search(self, request):
        if not request:
            return jsonify({"error": "Missing request"}), 400
        try:
            products, similar_products, quantity, total_price, stores = self.user_service.processing(request=request)
            return jsonify({"products": products, 
                            "similar_products": similar_products, 
                            "quantity": quantity, 
                            "total_price": total_price, 
                            "stores": stores}), 200
        except ValueError as e:
            return jsonify({"error": "Invalid prompt: " + str(e)}), 400
        except Exception as e:
            return jsonify({"error": "Internal server error: " + str(e)}), 500

