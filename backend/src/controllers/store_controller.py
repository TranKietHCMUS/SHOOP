import logging
from flask import jsonify, request
from src.services.services import store_service
from src.models.store_model import Store
from datetime import datetime

class StoreController:
    def __init__(self):
        self.store_service = store_service
        self.logger = logging.getLogger(__name__)

    def get_stores(self):
        try:
            stores = self.store_service.get_all_stores()
            return jsonify([s.to_dict() for s in stores]), 200
        except Exception as e:
            self.logger.error(f"Error getting stores: {e}")
            return jsonify({"error": str(e)}), 500
    
    def get_store_by_name(self, name: str):
        try:
            store = self.store_service.get_store_by_name(name)
            if not store:
                return jsonify({"error": "Store not found"}), 404
            return jsonify(store), 200
        except Exception as e:
            self.logger.error(f"Error getting store by name: {e}")
            return jsonify({"error": str(e)}), 500
    
    def get_store_by_id(self, id: str):
        try:
            store = self.store_service.get_store_by_id(id)
            if not store:
                return jsonify({"error": "Store not found"}), 404
            return jsonify(store), 200
        except Exception as e:
            self.logger.error(f"Error getting store by id: {e}")
            return jsonify({"error": str(e)}), 500
    
    def add_store(self, req):
        try:
            data = req.get_json()
            if not data:
                return jsonify({"error": "No input data provided"}), 400
            store = Store(
                name=data["store_name"],
                address=data["address"],
                img_url=data["store_img"],
                lat=data["latitude"],
                lng=data["longitude"],
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
            inserted = self.store_service.insert_one(store)
            return jsonify({"_id": str(inserted)}), 201
        except Exception as e:
            self.logger.error(f"Error adding store: {e}")
            return jsonify({"error": str(e)}), 500
    
    def add_stores(self, stores_data):
        try:
            if not stores_data:
                return jsonify({"error": "No input data provided"}), 400
            stores = [Store(
                name=store["store_name"],
                address=store["address"],
                img_url=store["store_img"],
                lat=store["latitude"],
                lng=store["longitude"],
                created_at=datetime.now(),
                updated_at=datetime.now()
            ) for store in stores_data]
            cnt, failed = self.store_service.insert_many(stores)
            return jsonify({"success": cnt, "failed": failed}), 200
        except Exception as e:
            self.logger.error(f"Error adding stores: {e}")
            return jsonify({"error": str(e)}), 500
