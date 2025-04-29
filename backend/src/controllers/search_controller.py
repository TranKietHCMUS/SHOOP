from flask import jsonify, request
from pydantic import ValidationError

from src.models.search_model import SearchRequestModel, StoreSearchRequestModel, NearbySearchRequestModel
from src.services.search_service import SearchService
from src.services.services import store_service

class SearchController:
    def __init__(self):
        self.search_service = SearchService(lambda_dist=0.1, preselect_k=3, top_k=3)
        self.store_service = store_service

    def get_plans(self, request):
        payload = request.get_json(force=True)
        # validate input
        try:
            req = SearchRequestModel(**payload)
        except ValidationError as e:
            return jsonify({"error": e.errors()}), 400

        # get top k plans
        try:
            plans = self.search_service.get_top_k_plans(
                stores=req.stores,
                groups=req.groups,
                user_loc=req.user_loc
            )
        except ValueError as ve:
            return jsonify({"error": str(ve)}), 400
        except RuntimeError as re:
            return jsonify({"error": str(re)}), 500

        return jsonify(plans), 200

    def search_nearby(self, request):
        payload = request.get_json(force=True)
        # Validate input
        try:
            req = NearbySearchRequestModel(**payload)
        except ValidationError as e:
            return jsonify({"error": e.errors()}), 400

        # Call service to fetch items grouped per store
        try:
            results = self.store_service.get_products_for_stores_within_radius(
                req.prompt, req.lat, req.lng, req.radius
            )
            return jsonify({"message": "Nearby search results", "data": {"stores": results}}), 200
        except Exception as e:
            return jsonify({"error": f"Internal server error: {str(e)}"}), 500
