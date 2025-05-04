from src.models.store_model import Store
from src.extensions import db
from src.services.ai_service import AIService
import re
from time import time

class StoreService:
    def __init__(self, ai_service=None, product_service=None):
        self.collection = db.get_collection("stores")
        self.product_collection = db.get_collection("products")
        self.ai_service = ai_service
        self.product_service = product_service
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
        print(product_names)
        stores = self.get_stores_within_radius(lat, lng, radius_km)
        if not stores:
            return []
        store_names = list({store.get("name") for store in stores if store.get("name")})
        # Obtain AI-based similar products per item (top 10 theo score)
        embeddings = self.ai_service.get_embeddings(product_names)
        similar_products = []
        for idx, item in enumerate(items):
            pname = item.get("product_name")
            unit = item.get("unit")
            print(unit)
            print(pname)
            sims = self.product_service.search_products([embeddings[idx]], [(pname, unit)])
            

            if sims and isinstance(sims[0], list):
                sims = sims[0]
            sims = sorted(sims, key=lambda x: x.get('score', 0), reverse=True)
            similar_products.append(sims)

        # Gom tất cả tên sản phẩm key từ similar_products (chỉ lấy tên, không mở rộng)
        print(similar_products)
        all_similar_names = set()
        for sims in similar_products:
            all_similar_names.update([res.get("name") for res in sims if res.get("name")])
        # Truy vấn database chỉ với các tên này (exact match)
        query = {
            "store_name": {"$in": store_names},
            "name": {"$in": list(all_similar_names)}
        }
        products_cursor = self.product_collection.find(query)
        products = list(products_cursor)

        print(product_names)
        print(similar_products)
        # Gom sản phẩm theo store_name và name
        products_by_store = {}
        for p in products:
            sname = p.get("store_name")
            pname = p.get("name")
            if sname not in products_by_store:
                products_by_store[sname] = {}
            if pname not in products_by_store[sname]:
                products_by_store[sname][pname] = []
            products_by_store[sname][pname].append({
                "id": str(p["_id"]),
                "name": p["name"],
                "price": p.get("price"),
                "unit": p.get("unit"),
                "category": p.get("category"),
                "img_url": p.get("img_url")
            })
        # Build per-item info
        product_items = []
        for idx, item in enumerate(items):
            pname = item.get("product_name")
            qty = item.get("quantity")
            unit = item.get("unit")
            sims = similar_products[idx] if idx < len(similar_products) else []
            sim_names = [pname] + [res.get("name") for res in sims if res.get("name")]
            product_items.append({"query_name": pname, "quantity": qty, "unit": unit, "similar_names": sim_names})
        # Ghép vào từng store
        results = []
        for store in stores:
            store_name = store.get("name")
            items_list = []
            has_candidate = False
            store_products = products_by_store.get(store_name, {})
            for info in product_items:
                sim_names = info["similar_names"]
                candidates = []
                for name in sim_names:
                    candidates.extend(store_products.get(name, []))
                if candidates:
                    has_candidate = True
                items_list.append({
                    "product_name": info["query_name"],
                    "quantity": info["quantity"],
                    "unit": info["unit"],
                    "candidates": candidates[:10] 
                })
            if has_candidate:
                store_copy = dict(store)
                store_copy["items"] = items_list
                results.append(store_copy)
        return results
