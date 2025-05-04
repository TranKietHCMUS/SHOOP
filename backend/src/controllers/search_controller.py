from datetime import datetime
from flask import g, jsonify, request
from pydantic import ValidationError

from src.models.search_model import PlanRequestModel, StoreSearchRequestModel, NearbySearchRequestModel
from src.services.search_service import SearchService
from src.services.services import store_service, redis_service

class SearchController:
    def __init__(self):
        self.search_service = SearchService(lambda_dist=0.1, preselect_k=3, top_k=3)
        self.store_service = store_service
        self.redis_service = redis_service

    def get_plans(self, request):
        """
        Receives `/search/nearby` output unchanged and returns top-k plans.
        """
        payload = request.get_json(force=True)
        # validate input
        try:
            req = PlanRequestModel(**payload)
        except ValidationError as e:
            return jsonify({"error": e.errors()}), 400

        # pass stores list and user location directly to service
        stores_list = [store.dict() for store in req.stores]
        user_loc = tuple(req.user_loc)
        plans = self.search_service.get_plans_from_nearby(stores_list, user_loc)

        # cache in redis
        key = f"user:{g.user_id}:data"
        # redis_service.update_latest_plans(key, plans)
        
        return jsonify(plans), 200

    def search_nearby(self, request):
        payload = request.get_json(force=True)
        # Validate input
        try:
            req = NearbySearchRequestModel(
                prompt = payload["prompt"],
                lat = payload["user_location"]["lat"],
                lng = payload["user_location"]["lng"],
                radius = payload["expected_radius"]
            )
        except ValidationError as e:
            return jsonify({"error": e.errors()}), 400

        # Call service to fetch items grouped per store
        try:
            results = self.store_service.get_products_for_stores_within_radius(
                req.prompt, req.lat, req.lng, req.radius
            )
            # cache in redis
            key = f"user:{g.user_id}:data"
            value = {
                "prompt": payload["prompt"],
                "user_loc": [req.lat, req.lng],
                "address": payload["address"] if "address" in payload else None,
                "radius": payload["expected_radius"],
                "stores": results,
                "plans": {},
                "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            }
            redis_service.lpush_json(key, value)

            # Include user location and stores list
            return jsonify({"user_loc": [req.lat, req.lng], "stores": results}), 200
        except Exception as e:
            return jsonify({"error": f"Internal server error: {str(e)}"}), 500