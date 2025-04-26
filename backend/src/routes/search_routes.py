from flask import Blueprint
from src.controllers.search_controller import get_plans_controller

search_bp = Blueprint("search", __name__, url_prefix="/search")

# POST /search/plans
search_bp.route("/plans", methods=["POST"])(get_plans_controller)