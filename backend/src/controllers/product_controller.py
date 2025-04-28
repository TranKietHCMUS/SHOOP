from src.services.services import product_service
from src.models.product_model import Product
from flask import jsonify
from datetime import datetime

class ProductController:
    def __init__(self):
        self.product_service = product_service

    def get_products(self) -> list[Product]:
        return self.product_service.get_all_products()

    def get_product_by_name(self, name: str) -> Product:
        return self.product_service.get_product_by_name(name)
    
    def get_product_by_id(self, id: str) -> Product:
        return self.product_service.get_product_by_id(id)
    
    def add_product(self, request) -> Product:
        try:
            data = request.get_json()
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
            return self.product_service.insert_one(product)
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    def add_products(self, request) -> list[Product]:
        try:
            data = request
            # print(data)
            if not data:
                return jsonify({"error": "No input data provided"}), 400
            products = []
            for product in data:
                curr = Product(**product)
                curr.created_at = datetime.now()
                curr.updated_at = datetime.now()
                products.append(curr)
            success, failed = self.product_service.insert_many(products)
            
            print(f"**{success}** products inserted successfully, **{len(failed)}** products failed")
            if len(failed) > 0:
                print(failed)
            return failed, 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    def delete_product(self, id: str) -> bool:
        return self.product_service.delete_by_id(id)


