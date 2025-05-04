import requests
from flask import Flask, g, make_response, request, jsonify
from src.services.services import user_service, redis_service
from src.models.user_model import Users
from datetime import datetime


class UserController:
    def __init__(self):
        self.user_service = user_service
        self.redis_service = redis_service

    def handle_user_search(self, request):
        if not request:
            return jsonify({"error": "Missing request"}), 400
        try:
            products, similar_products, quantity, total_price, stores = self.user_service.processing(request=request)
            return jsonify({"products": products, 
                            "similar_products": similar_products, 
                            "quantity": quantity, 
                            "total_price": total_price, 
                            "stores": stores}), 200
        except ValueError as e:
            return jsonify({"error": "Invalid prompt: " + str(e)}), 400
        except Exception as e:
            return jsonify({"error": "Internal server error: " + str(e)}), 500
    
    def get_search_history(self, request):
        try:
            user_id = g.user_id
            key = f"user:{user_id}:data"
            history = redis_service.lrange_json(key)

            return jsonify({
                "message": "Search history retrieved successfully",
                "data": {
                    "history": history
                }
            }), 200
        except Exception as e:
            return jsonify({"error": "Internal server error: " + str(e)}), 500
    
    def clear_all_history(self, request):
        try:
            user_id = g.user_id
            key = f"user:{user_id}:data"
            redis_service.delete(key)

            return jsonify({
                "message": "Search history cleared successfully",
                "data": {
                    "history": []
                }
            }), 200
        except Exception as e:
            return jsonify({"error": "Internal server error: " + str(e)}), 500
    
    def delete_history_by_index(self, request):
        try:
            user_id = g.user_id
            key = f"user:{user_id}:data"
            index = request.args.get("index")
            if not index:
                return jsonify({"error": "Missing index parameter"}), 400

            redis_service.delete_item_by_index(key, int(index))

            return jsonify({
                "message": "Search history item deleted successfully",
                "data": {
                    "history": redis_service.lrange_json(key)
                }
            }), 200
        except Exception as e:
            return jsonify({"error": "Internal server error: " + str(e)}), 500