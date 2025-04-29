from src.models.store_model import Store
from src.extensions import db
from src.services.ai_service import AIService
import re

class StoreService:
    def __init__(self, ai_service):
        self.collection = db.get_collection("stores")
        self.product_collection = db.get_collection("products")
        self.ai_service = ai_service
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

    @staticmethod
    def haversine(lat1, lng1, lat2, lng2):
        import math
        R = 6371  # Earth radius in km
        phi1, phi2 = math.radians(lat1), math.radians(lat2)
        dphi = math.radians(lat2 - lat1)
        dlambda = math.radians(lng2 - lng1)
        a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
        return 2 * R * math.asin(math.sqrt(a))

    def get_stores_within_radius(self, lat, lng, radius_km):
        stores = list(self.collection.find({}))
        result = []
        for store in stores:
            store_lat = store.get("lat")
            store_lng = store.get("lng")
            if store_lat is None or store_lng is None:
                continue
            try:
                store_lat = float(store_lat)
                store_lng = float(store_lng)
            except (ValueError, TypeError):
                continue
            distance = self.haversine(lat, lng, store_lat, store_lng)
            if distance <= radius_km:
                store["_id"] = {"$oid": str(store["_id"])}
                result.append(store)
        return result

    def get_products_for_stores_within_radius(self, prompt, lat, lng, radius_km):
        """
        Process the user prompt to extract product names, then find stores within radius and list matching products per store.
        """
        # Extract product names and quantities from the prompt
        prompt_model = self.ai_service.process_prompt(prompt)
        items = prompt_model.items
        product_names = [item.get("product_name") for item in items if item.get("product_name")]
        # Find stores within radius
        stores = self.get_stores_within_radius(lat, lng, radius_km)
        # Obtain AI-based similar products per item
        embeddings = self.ai_service.get_embeddings(product_names)
        similar_products = self.ai_service.search_products(embeddings, product_names)

        # Build per-item info with similar name sets
        product_items = []
        for idx, item in enumerate(items):
            pname = item.get("product_name")
            qty = item.get("quantity")
            unit = item.get("unit")
            sims = similar_products[idx] if idx < len(similar_products) else []
            sim_names = {pname} | {res.get("name") for res in sims if res.get("name")}
            product_items.append({"query_name": pname, "quantity": qty, "unit": unit, "similar_names": sim_names})

        # Query products per store and per item
        results = []
        for store in stores:
            store_name = store.get("name")
            address = store.get("address")
            items_list = []
            for info in product_items:
                sim_names = info["similar_names"]
                # regex filters for each similar name
                regex_filters = [
                    {"name": {"$regex": f".*{re.escape(name)}.*", "$options": "i"}}
                    for name in sim_names
                ]
                query = {"store_name": store_name}
                if regex_filters:
                    query["$or"] = regex_filters
                cursor = self.product_collection.find(query)
                candidates = [
                    {
                        "id": str(p["_id"]),
                        "name": p["name"],
                        "price": p.get("price"),
                        "unit": p.get("unit"),
                        "category": p.get("category"),
                        "img_url": p.get("img_url")
                    }
                    for p in cursor
                ]
                items_list.append({
                    "product_name": info["query_name"],
                    "quantity": info["quantity"],
                    "unit": info["unit"],
                    "candidates": candidates
                })
            results.append({"address": address, "items": items_list})
        return results
