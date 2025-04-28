from src.services.services import (product_vec_service, 
                                   ai_service)
from flask import jsonify
from src.models.product_vec import ProductVec

class AIController:
    def __init__(self):
        self.product_vec_service = product_vec_service
        self.ai_service = ai_service

    def insert_vec_products(self, request):
        try:
            data = request.get_json()
            if not data:
                return jsonify({"error": "No input data provided"}), 400
            
            success = self.product_vec_service.insert_many(data)
            return jsonify({"message": f"**{len(success)}** products vectors inserted successfully"}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500