from datetime import datetime
from typing import List, Dict, Optional
from bson.objectid import ObjectId

class Product:
    def __init__(
        self,
        name: str,
        price: float,
        unit: str,
        store_name: str,
        category: str,
        img_url: str,
        vector: Optional[List[float]] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
        id: str = None,
    ):
        self._id = ObjectId(id) if id else None
        self.name = name
        self.store_name = store_name
        self.price = price
        self.unit = unit
        self.category = category
        self.img_url = img_url
        self.vector = vector if vector else []
        self.created_at = created_at or datetime.now()
        self.updated_at = updated_at or datetime.now()

    def to_dict(self) -> Dict:
        result = {
            "name": self.name,
            "price": self.price,
            "unit": self.unit,
            "store_name": self.store_name,
            "category": self.category,
            "img_url": self.img_url,
            "vector": self.vector,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }
        if self._id:
            result["_id"] = self._id
        return result
