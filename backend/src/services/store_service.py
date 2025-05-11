from src.models.store_model import Store
from src.extensions import db
from src.services.ai_service import AIService
import re
from time import time
import json # Added import
from src.services.redis_service import RedisService # Added import
import logging

class StoreService:
    def __init__(self, ai_service=None, product_service=None, redis_service=None): # Added redis_service
        self.collection = db.get_collection("stores")
        self.product_collection = db.get_collection("products")
        self.ai_service = ai_service
        self.product_service = product_service
        self.redis_service = redis_service if redis_service else RedisService() # Initialize RedisService
        self.logger = logging.getLogger(__name__)
        self._ensure_indexes()
    def _ensure_indexes(self):
        try:
            self.collection.create_index([("name", 1)], unique=False, name="name_index")
            self.collection.create_index([("lat", 1), ("lng", 1)], unique=True, name="lat_lng_unique_index")
            self.logger.info("Indexes created successfully")
        except Exception as e:
            self.logger.error(f"Error creating indexes: {e}")

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
            self._validate_store(store)
            _id = self.collection.insert_one(store.to_dict()).inserted_id
            return _id
        except Exception as e:
            self.logger.error(f"Error inserting store: {e}")
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
                    self.logger.error(f"Error inserting store: {e}")
                    failed.append(store.to_dict())
            return cnt, failed
        except Exception as e:
            self.logger.error(f"Error inserting stores: {e}")
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
        try:
            prompt_model = self.ai_service.process_prompt(prompt)
            items = prompt_model.items
            stores = self.get_stores_within_radius(lat, lng, radius_km)
            if not stores:
                return []
            store_names = list({store.get("name") for store in stores if store.get("name")})
            product_items_with_units = self._prepare_product_items_with_units(items)
            similar_products_by_item, search_results_map = self._get_similar_products(product_items_with_units)
            all_product_names_for_db_query = self._collect_all_product_names(items, similar_products_by_item)
            query = {
                "store_name": {"$in": store_names},
                "name": {"$in": list(all_product_names_for_db_query)}
            }
            products_cursor = self.product_collection.find(query)
            products_in_stores = list(products_cursor)
            products_by_store_and_name = self._group_products_by_store_and_name(products_in_stores)
            product_details_for_output = self._build_product_details_for_output(items, search_results_map)
            results = self._build_results(stores, products_by_store_and_name, product_details_for_output)
            return results
        except Exception as e:
            self.logger.error(f"Error getting products for stores within radius: {e}")
            return []

    def _validate_store(self, store: Store) -> None:
        if not store.name or not isinstance(store.name, str):
            raise ValueError("Name must be a non-empty string")
        if not store.address or not isinstance(store.address, str):
            raise ValueError("Address must be a non-empty string")

    def _prepare_product_items_with_units(self, items):
        if not items:
            return []
        return sorted([
            (item.get("product_name"), item.get("unit"))
            for item in items if item.get("product_name")
        ])

    def _get_similar_products(self, product_items_with_units):
        similar_products_by_item = []
        search_results_map = {}
        if product_items_with_units:
            cache_key = self._generate_cache_key(product_items_with_units)
            cached_results = self.redis_service.get_json(cache_key)
            if cached_results is not None:
                self.logger.info(f"Cache HIT for key: {cache_key}")
                raw_search_results = cached_results
            else:
                self.logger.info(f"Cache MISS for key: {cache_key}")
                product_names_for_embedding = [item[0] for item in product_items_with_units]
                embeddings = self.ai_service.get_embeddings(product_names_for_embedding)
                raw_search_results = self.product_service.search_products(
                    embeddings=embeddings,
                    product_items_with_units=product_items_with_units,
                    top_k=10
                )
                if raw_search_results is not None:
                    try:
                        self.redis_service.set_json(cache_key, raw_search_results, ex=86400)
                        self.logger.info(f"Successfully cached results for key: {cache_key}")
                    except TypeError as e:
                        self.logger.error(f"Error serializing results for Redis: {e}.")
            if raw_search_results:
                for single_item_sim_prods in raw_search_results:
                    if isinstance(single_item_sim_prods, list):
                        sorted_sims = sorted(single_item_sim_prods, key=lambda x: x.get('score', 0), reverse=True)
                        similar_products_by_item.append(sorted_sims)
                    else:
                        similar_products_by_item.append([])
            else:
                similar_products_by_item = [[] for _ in product_items_with_units]
            if product_items_with_units and similar_products_by_item and len(product_items_with_units) == len(similar_products_by_item):
                for i, pu_tuple in enumerate(product_items_with_units):
                    search_results_map[pu_tuple] = similar_products_by_item[i]
        return similar_products_by_item, search_results_map

    def _generate_cache_key(self, product_items_with_units):
        cache_key_parts = [f"{name or ''} {unit or ''}" for name, unit in product_items_with_units]
        cache_key_string = "|".join(cache_key_parts)
        return f"product_search_cache_v3:{cache_key_string}"

    def _collect_all_product_names(self, items, similar_products_by_item):
        all_product_names_for_db_query = set()
        for i, item_data in enumerate(items):
            original_product_name = item_data.get("product_name")
            if original_product_name:
                all_product_names_for_db_query.add(original_product_name)
            if i < len(similar_products_by_item):
                sims_for_this_item = similar_products_by_item[i]
                all_product_names_for_db_query.update([res.get("name") for res in sims_for_this_item if res.get("name")])
        return all_product_names_for_db_query

    def _group_products_by_store_and_name(self, products_in_stores):
        products_by_store_and_name = {}
        for p in products_in_stores:
            sname = p.get("store_name")
            pname = p.get("name")
            if sname not in products_by_store_and_name:
                products_by_store_and_name[sname] = {}
            if pname not in products_by_store_and_name[sname]:
                products_by_store_and_name[sname][pname] = []
            products_by_store_and_name[sname][pname].append({
                "id": str(p["_id"]),
                "name": p["name"],
                "price": p.get("price"),
                "unit": p.get("unit"),
                "category": p.get("category"),
                "img_url": p.get("img_url")
            })
        return products_by_store_and_name

    def _build_product_details_for_output(self, items, search_results_map):
        product_details_for_output = []
        for item_from_prompt in items:
            pname = item_from_prompt.get("product_name")
            qty = item_from_prompt.get("quantity")
            unit = item_from_prompt.get("unit")
            current_item_similar_raw = []
            if pname:
                current_pu_tuple = (pname, unit)
                current_item_similar_raw = search_results_map.get(current_pu_tuple, [])
            combined_names_for_matching = []
            if pname:
                combined_names_for_matching.append(pname)
            combined_names_for_matching.extend([res.get("name") for res in current_item_similar_raw if res.get("name")])
            combined_names_for_matching = list(dict.fromkeys(combined_names_for_matching))
            product_details_for_output.append({
                "query_name": pname,
                "quantity": qty,
                "unit": unit,
                "names_to_match_in_store": combined_names_for_matching
            })
        return product_details_for_output

    def _build_results(self, stores, products_by_store_and_name, product_details_for_output):
        results = []
        for store_info in stores:
            store_name = store_info.get("name")
            items_list_for_store = []
            store_has_any_candidate_product = False
            products_available_in_this_store = products_by_store_and_name.get(store_name, {})
            for detail_info in product_details_for_output:
                product_candidates_in_store = []
                for name_to_check in detail_info["names_to_match_in_store"]:
                    product_candidates_in_store.extend(products_available_in_this_store.get(name_to_check, []))
                if product_candidates_in_store:
                    store_has_any_candidate_product = True
                items_list_for_store.append({
                    "product_name": detail_info["query_name"],
                    "quantity": detail_info["quantity"],
                    "unit": detail_info["unit"],
                    "candidates": product_candidates_in_store[:10]
                })
            if store_has_any_candidate_product:
                store_data_copy = dict(store_info)
                store_data_copy["items"] = items_list_for_store
                results.append(store_data_copy)
        return results
