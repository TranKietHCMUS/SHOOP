from flask import request, jsonify
from src.services.store_service import StoreService

store_service = StoreService()

def get_stores_within_radius_controller():
    data = request.get_json(force=True)
    try:
        lat = float(data["lat"])
        lng = float(data["lng"])
        radius = float(data["radius"])  # đơn vị km
    except (KeyError, ValueError, TypeError):
        return jsonify({"error": "lat, lng, radius (km) are required and must be float"}), 400

    stores = store_service.get_stores_within_radius(lat, lng, radius)
    return jsonify({"stores": stores}), 200 