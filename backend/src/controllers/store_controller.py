from src.services.services import store_service
from src.models.store_model import Store
from flask import jsonify
from datetime import datetime

class StoreController:
    def __init__(self):
        self.store_service = store_service

    def get_stores(self) -> list[Store]:
        return self.store_service.get_all_stores()
    
    def get_store_by_name(self, name: str) -> Store:
        return self.store_service.get_store_by_name(name)
    
    def get_store_by_id(self, id: str) -> Store:
        return self.store_service.get_store_by_id(id)
    
    def add_store(self, request) -> Store:
        try:
            data = request.get_json()
            store = Store(
                name=data["store_name"],
                address=data["address"],
                img_url=data["store_img"],
                lat=data["latitude"],
                lng=data["longitude"],
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
            return self.store_service.insert_one(store)
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    def add_stores(self, request) -> list[Store]:
        try:
            data = request
            stores = [Store(
                name=store["store_name"],
                address=store["address"],
                img_url=store["store_img"],
                lat=store["latitude"],
                lng=store["longitude"],
                created_at=datetime.now(),
                updated_at=datetime.now()
            ) for store in data]
            cnt, failed = self.store_service.insert_many(stores)
            return cnt, failed
        except Exception as e:
            print(e)
            return e, 500
