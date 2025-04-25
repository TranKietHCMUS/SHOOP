from src.services.services import ai_service
from flask import jsonify

class AIController:
    def __init__(self):
        self.ai_service = ai_service

    def insert_products(self, products):
        success = self.ai_service.insert_products(products)
        return jsonify({"message": f"**{len(success)}** products vectors inserted successfully"}), 200
