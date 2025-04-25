from typing import List, Dict, Any
import json

class PromptModel:
    def __init__(self, raw_text: str = None):
        self.raw_text = raw_text
        self.items: List[Dict[str, Any]] = []
        self.total_price: float = 0.0

    @classmethod
    def from_json(cls, json_str: str) -> 'PromptModel':
        try:
            data = json.loads(json_str)
            instance = cls()
            instance.items = data.get('items', [])
            instance.total_price = data.get('total_price', 0.0)
            return instance
        except json.JSONDecodeError:
            return cls()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "items": self.items,
            "total_price": self.total_price
        }

    @staticmethod
    def validate_product_items(items: List[Dict[str, Any]]) -> bool:
        for item in items:
            if not all(key in item for key in ['product_name', 'quantity', 'unit']):
                return False
            if not isinstance(item['product_name'], str):
                return False
            if not isinstance(item['quantity'], int):
                return False
            if not isinstance(item['unit'], str):
                return False
        return True 