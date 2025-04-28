from datetime import datetime
from typing import List, Dict, Optional
from bson.objectid import ObjectId

class Store:
    def __init__(
        self,
        name: str,
        address: str,
        img_url: str,
        lat: float,
        lng: float,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
    ):
        self.name = name
        self.address = address
        self.img_url = img_url
        self.lat = lat
        self.lng = lng
        self.created_at = created_at or datetime.now()
        self.updated_at = updated_at or datetime.now()

    def to_dict(self) -> Dict:
        result = {
            "name": self.name,
            "address": self.address,
            "img_url": self.img_url,
            "lat": self.lat,
            "lng": self.lng,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }
        return result
    