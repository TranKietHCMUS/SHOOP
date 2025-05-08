from flask import Blueprint, request, jsonify, Response
from src.extensions import AI_MODELS
from src.controllers.ai_controller import AIController
from tqdm import tqdm
from src.utils import batched

ai_routes = Blueprint("ai", __name__, url_prefix="/ai")
ai_controller = AIController()
sbert = AI_MODELS["sbert"]