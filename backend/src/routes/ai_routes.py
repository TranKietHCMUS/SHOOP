from flask import Blueprint, request
from src.controllers.ai_controller import AIController

ai_routes = Blueprint("ai", __name__, url_prefix="/ai")
ai_controller = AIController()

@ai_routes.route("/embeddings", methods=["POST"])
def get_product_embeddings():
    return ai_controller.get_product_embeddings(request)