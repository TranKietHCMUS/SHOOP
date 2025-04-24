from flask import Blueprint, request, Response, jsonify
from src.controllers.user_controller import handle_user_search, register

user_routes = Blueprint("user", __name__, url_prefix="/user")

# did not have authentication yet
# -> add later
@user_routes.route("/search", methods=["POST"])
def search():
    message, status_code = handle_user_search(request.json.get("prompt"))
    return message, status_code


user_routes.route("/register", methods=["POST"])(register)