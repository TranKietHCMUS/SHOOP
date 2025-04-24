from datetime import datetime
from bson.objectid import ObjectId
import numpy as np

class ProductVec:
    def __init__(self, name: str, vector: list[float], created_at: datetime = None, updated_at: datetime = None, id: str = None):
        self.name = name
        self.vector = vector
        self.created_at = created_at or datetime.now()
        self.updated_at = updated_at or datetime.now()
        self._id = ObjectId(id) if id else None

    @staticmethod
    def validate_vector(vector: list) -> list:
        if not isinstance(vector, list):
            raise ValueError("Vector must be a list")
        if not all(isinstance(x, (int, float)) for x in vector):
            raise ValueError("Vector must contain only numbers")
            
        vector = np.array(vector, dtype=np.float32)
        norm = np.linalg.norm(vector)
        if norm == 0:
            raise ValueError("Vector must not contain only zeros")
        return (vector / norm).tolist()

    def to_dict(self) -> dict:
        result = {
            "name": self.name.strip(),
            "vector": self.vector,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }
        if self._id:
            result["_id"] = self._id
        return result

    @classmethod
    def from_dict(cls, data: dict) -> 'ProductVec':
        return cls(
            name=data["name"],
            vector=data["vector"],
            created_at=data.get("created_at"),
            updated_at=data.get("updated_at"),
            id=str(data["_id"]) if "_id" in data else None
        ) 