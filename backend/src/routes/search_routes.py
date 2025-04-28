from flask import Blueprint, request
from src.controllers.search_controller import SearchController

search_bp = Blueprint("search", __name__, url_prefix="/search")
search_controller = SearchController()

def get_plans_route():
    return search_controller.get_plans(request)

def get_stores_within_radius_route():
    return search_controller.get_stores_within_radius(request)

# POST /search/plans
search_bp.route("/plans", methods=["POST"])(get_plans_route)
# POST /search/nearby
search_bp.route("/nearby", methods=["POST"])(get_stores_within_radius_route)
