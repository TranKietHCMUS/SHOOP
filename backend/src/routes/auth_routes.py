from flask import Blueprint, request
from src.controllers.auth_controller import AuthController
from src.middlewares.verify_token import token_required

auth_routes = Blueprint("auth", __name__, url_prefix="/auth")
auth_controller = AuthController()

@auth_routes.route("/register", methods=["POST"])
def register():
    return auth_controller.register(request)

@auth_routes.route("/login", methods=["POST"])
def login():
    return auth_controller.login(request)

@auth_routes.route("/logout", methods=["POST"])
@token_required
def logout():
    return auth_controller.logout(request)