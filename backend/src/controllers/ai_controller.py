import logging
from flask import jsonify
from src.services.services import product_service, ai_service
from src.models.product_model import Product

class AIController:
    def __init__(self):
        self.product_service = product_service
        self.ai_service = ai_service
        self.logger = logging.getLogger(__name__)

    # Example endpoint: get product embeddings (expand as needed)
    def get_product_embeddings(self, req):
        try:
            data = req.get_json()
            if not data or "product_name" not in data:
                return jsonify({"error": "Missing product_name"}), 400
            embeddings = self.ai_service.get_embeddings(data["product_name"])
            return jsonify({"embeddings": embeddings.tolist()}), 200
        except Exception as e:
            self.logger.error(f"Error getting product embeddings: {e}")
            return jsonify({"error": str(e)}), 500