import logging
from flask import jsonify, request
from src.services.services import product_service
from src.models.product_model import Product
from datetime import datetime

class ProductController:
    def __init__(self):
        self.product_service = product_service
        self.logger = logging.getLogger(__name__)

    def get_products(self):
        try:
            products = self.product_service.get_all_products()
            return jsonify([p.to_dict() for p in products]), 200
        except Exception as e:
            self.logger.error(f"Error getting products: {e}")
            return jsonify({"error": str(e)}), 500

    def get_product_by_name(self, name: str):
        try:
            product = self.product_service.get_product_by_name(name)
            if not product:
                return jsonify({"error": "Product not found"}), 404
            return jsonify(product.to_dict()), 200
        except Exception as e:
            self.logger.error(f"Error getting product by name: {e}")
            return jsonify({"error": str(e)}), 500
    
    def get_product_by_id(self, id: str):
        try:
            product = self.product_service.get_product_by_id(id)
            if not product:
                return jsonify({"error": "Product not found"}), 404
            return jsonify(product.to_dict()), 200
        except Exception as e:
            self.logger.error(f"Error getting product by id: {e}")
            return jsonify({"error": str(e)}), 500
    
    def add_product(self, req):
        try:
            data = req.get_json()
            if not data:
                return jsonify({"error": "No input data provided"}), 400
            product = Product(
                name=data.get("name"),
                price=data.get("price"),
                store_name=data.get("store_name"),
                img_url=data.get("img_url"),
                unit=data.get("unit"),
                category=data.get("category"),
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
            inserted = self.product_service.insert_one(product)
            return jsonify(inserted.to_dict()), 201
        except Exception as e:
            self.logger.error(f"Error adding product: {e}")
            return jsonify({"error": str(e)}), 500
    
    def add_products(self, products_data):
        try:
            if not products_data:
                return jsonify({"error": "No input data provided"}), 400
            products = []
            for product in products_data:
                curr = Product(**product)
                curr.created_at = datetime.now()
                curr.updated_at = datetime.now()
                products.append(curr)
            success, failed = self.product_service.insert_many(products)
            self.logger.info(f"{success} products inserted successfully, {len(failed)} products failed")
            return jsonify({"success": success, "failed": failed}), 200
        except Exception as e:
            self.logger.error(f"Error adding products: {e}")
            return jsonify({"error": str(e)}), 500

    def delete_product(self, id: str):
        try:
            result = self.product_service.delete_by_id(id)
            if not result:
                return jsonify({"error": "Product not found or could not be deleted"}), 404
            return jsonify({"message": "Product deleted successfully"}), 200
        except Exception as e:
            self.logger.error(f"Error deleting product: {e}")
            return jsonify({"error": str(e)}), 500

    def re_indexing(self):
        try:
            res = self.product_service.re_indexing()
            if res:
                return jsonify({"message": "Re-indexing products successfully"}), 200
            else:
                return jsonify({"error": "Re-indexing failed"}), 500
        except Exception as e:
            self.logger.error(f"Error re-indexing products: {e}")
            return jsonify({"error": str(e)}), 500
