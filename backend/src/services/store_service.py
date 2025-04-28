from src.extensions import db
import math

class StoreService:
    def __init__(self):
        self.collection = db.get_collection("grab.stores")

    @staticmethod
    def haversine(lat1, lng1, lat2, lng2):
        R = 6371  # Earth radius in km
        phi1, phi2 = math.radians(lat1), math.radians(lat2)
        dphi = math.radians(lat2 - lat1)
        dlambda = math.radians(lng2 - lng1)
        a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
        return 2 * R * math.asin(math.sqrt(a))

    def get_stores_within_radius(self, lat, lng, radius_km):
        stores = list(self.collection.find({}))
        result = []
        for store in stores:
            store_lat = float(store.get("lat", 0))
            store_lng = float(store.get("lng", 0))
            distance = self.haversine(lat, lng, store_lat, store_lng)
            if distance <= radius_km:
                # Chuyển ObjectId về string và format lại cho đúng mẫu
                store["_id"] = {"$oid": str(store["_id"])}
                result.append(store)
        return result 