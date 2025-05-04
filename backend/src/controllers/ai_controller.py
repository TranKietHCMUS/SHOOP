from src.services.services import (product_service, 
                                   ai_service)
from flask import jsonify
from src.models.product_model import Product

class AIController:
    def __init__(self):
        self.product_service = product_service
        self.ai_service = ai_service