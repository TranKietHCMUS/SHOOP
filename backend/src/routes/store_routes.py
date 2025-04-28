from flask import Blueprint
from src.controllers.store_controller import get_stores_within_radius_controller

store_bp = Blueprint("store", __name__, url_prefix="/store")

# POST /store/nearby
store_bp.route("/nearby", methods=["POST"])(get_stores_within_radius_controller) 