import logging
from datetime import datetime
from flask import g, jsonify, request
from pydantic import ValidationError

from src.models.search_model import PlanRequestModel, StoreSearchRequestModel, NearbySearchRequestModel
from src.services.search_service import SearchService
from src.services.services import store_service, redis_service

class SearchController:
    def __init__(self):
        self.search_service = SearchService()
        self.store_service = store_service
        self.redis_service = redis_service
        self.logger = logging.getLogger(__name__)

    def get_plans(self, req):
        try:
            payload = req.get_json(force=True)
            req_model = PlanRequestModel(**payload)
            stores_list = [store.dict() for store in req_model.stores]
            user_loc = tuple(req_model.user_loc)
            plans = self.search_service.get_plans_from_nearby(stores_list, user_loc)
            key = f"user:{g.user_id}:data"
            self.redis_service.update_latest_plans(key, plans)
            return jsonify(plans), 200
        except ValidationError as e:
            self.logger.warning(f"Validation error: {e}")
            return jsonify({"error": e.errors()}), 400
        except Exception as e:
            self.logger.error(f"Internal server error: {e}")
            return jsonify({"error": f"Internal server error: {str(e)}"}), 500

    def search_nearby(self, req):
        try:
            payload = req.get_json(force=True)
            req_model = NearbySearchRequestModel(
                prompt=payload["prompt"],
                lat=payload["user_location"]["lat"],
                lng=payload["user_location"]["lng"],
                radius=payload["expected_radius"]
            )
            results = self.store_service.get_products_for_stores_within_radius(
                req_model.prompt, req_model.lat, req_model.lng, req_model.radius
            )
            key = f"user:{g.user_id}:data"
            value = {
                "prompt": payload["prompt"],
                "user_loc": [req_model.lat, req_model.lng],
                "address": payload.get("address"),
                "radius": payload["expected_radius"],
                "stores": results,
                "plans": {},
                "time": str(datetime.now()),
            }
            self.redis_service.lpush_json(key, value)
            return jsonify({"user_loc": [req_model.lat, req_model.lng], "stores": results}), 200
        except ValidationError as e:
            self.logger.warning(f"Validation error: {e}")
            return jsonify({"error": e.errors()}), 400
        except Exception as e:
            self.logger.error(f"Internal server error: {e}")
            return jsonify({"error": f"Internal server error: {str(e)}"}), 500