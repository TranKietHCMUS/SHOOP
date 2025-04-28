from src.models.store_model import Store
from src.extensions import db
from src.services.ai_service import AIService

class StoreService:
    def __init__(self):
        self.collection = db.get_collection("stores")
        self._ensure_indexes()
    def _ensure_indexes(self):
        try:
            self.collection.create_index([("name", 1)], unique=False, name="name_index")
            self.collection.create_index([("lat", 1), ("lng", 1)], unique=True, name="lat_lng_unique_index")
            print("Indexes created successfully")
        except Exception as e:
            print(f"Error creating indexes: {e}")

    def validate_store(self, store: Store) -> None:
        if not store.name or not isinstance(store.name, str):
            raise ValueError("Name must be a non-empty string")
        # if store.lat < 0:
        #     raise ValueError("Latitude must be a positive number")
        # if store.lng < 0:
        #     raise ValueError("Longitude must be a positive number")
        if not store.address or not isinstance(store.address, str):
            raise ValueError("Address must be a non-empty string")
    
    def get_all_stores(self) -> list[Store]:
        return [Store(**store) for store in self.collection.find()]
    
    def get_store_by_name(self, name: str) -> Store:
        return self.collection.find_one({"name": name})

    def get_store_by_id(self, id: str) -> Store:
        return self.collection.find_one({"_id": id})

    def insert_one(self, store: Store) -> Store:
        # print(store.to_dict())
        try:
            self.validate_store(store)
            _id = self.collection.insert_one(store.to_dict()).inserted_id
            return _id
        except Exception as e:
            print(f"Error inserting store: {e}")
            raise e
    def insert_many(self, stores: list[Store]) -> list[Store]:
        cnt = 0
        failed = []
        try:
            for store in stores:
                try:
                    self.insert_one(store)
                    cnt += 1
                except Exception as e:
                    print(f"Error inserting store: {e}")
                    failed.append(store.to_dict())
            return cnt, failed
        except Exception as e:
            print(f"Error inserting stores: {e}")
            raise e
