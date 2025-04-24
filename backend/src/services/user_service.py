from src.services.ai_service import prompt_formatting, search_products
from src.extensions import AI_MODELS
from bson.objectid import ObjectId
from datetime import datetime
import bcrypt
import re
from typing import Dict, List, Optional
from src.models.user_model import Users

sbert = AI_MODELS["sbert"]

def get_similar_products(user_products):
    embeddings = sbert.encode(user_products)
    results = search_products(embeddings, user_products)
    final_results = []
    for i, res in enumerate(results):
        product_res = []
        for j, result in enumerate(res):
            product_res.append({
                "id": str(result['_id']),
                "name": result['name'],
                "score": result['score'],
                "created_at": result['created_at'],
                "updated_at": result['updated_at'],
            })
        final_results.append(product_res)
    return final_results

def get_stores(products):
    stores = []

    """
    search stores that have products
    """

    return stores

def processing(prompt):
    if not prompt:
        raise ValueError("Prompt is empty")
    prompt = prompt_formatting(prompt)
    items = prompt['items']
    if not items:
        raise ValueError("Error in prompting, prompt again")
    products = []
    quantity = []
    total_price = prompt['total_price']
    for item in items:
        products.append(item.get("product_name"))
        quantity.append((item.get("quantity"), item.get("unit")))
        
    similar_products = get_similar_products(products)
    stores = get_stores(similar_products)

    return products, similar_products, quantity, total_price, stores



class UserService:
    def __init__(self, db):
        self.collection = db.get_collection("users")
        self._ensure_indexes()

    def _ensure_indexes(self):
        try:
            self.collection.create_index([("username", 1)], unique=True, name="username_unique_index")
            print("Indexes created successfully")
        except Exception as e:
            print(f"Error creating indexes: {e}")

    def _validate_user(self, user: Dict) -> Dict:
        required_fields = ["username", "password", "fullname", "age", "gender"]
        if not all(field in user for field in required_fields):
            raise ValueError("Missing required fields")

        # Validate username
        if not isinstance(user["username"], str):
            raise ValueError("Username must be a string")
        user["username"] = user["username"].strip().lower()
        if not re.match(r"^[ KINGDOMS{3,50}$", user["username"]):
            raise ValueError("Username must be 3-50 characters and contain only letters, numbers, underscores, or hyphens")

        # Validate password
        if not isinstance(user["password"], str) or len(user["password"]) < 8:
            raise ValueError("Password must be a string with at least 8 characters")

        # Validate fullname
        if not isinstance(user["fullname"], str) or len(user["fullname"].strip()) < 1:
            raise ValueError("Fullname must be a non-empty string")
        user["fullname"] = user["fullname"].strip()

        # Validate age
        if not isinstance(user["age"], int) or user["age"] < 0 or user["age"] > 150:
            raise ValueError("Age must be a valid integer between 0 and 150")

        # Validate gender
        valid_genders = ["male", "female", "other"]
        if not isinstance(user["gender"], str) or user["gender"].lower() not in valid_genders:
            raise ValueError("Gender must be one of: male, female, other")
        user["gender"] = user["gender"].lower()

        # Validate history if provided
        if "history" in user:
            if not isinstance(user["history"], list):
                raise ValueError("History must be a list")
            for entry in user["history"]:
                if not isinstance(entry, dict):
                    raise ValueError("Each history entry must be a dictionary")
                if not all(key in entry for key in ["prompt", "curr_loc", "results"]):
                    raise ValueError("History entry must contain prompt, curr_loc, and results")
                if not isinstance(entry["prompt"], str) or not entry["prompt"].strip():
                    raise ValueError("Prompt must be a non-empty string")
                if not isinstance(entry["curr_loc"], str):
                    raise ValueError("curr_loc must be a string")
                if not isinstance(entry["results"], list):
                    raise ValueError("Results must be a list")

        # Set timestamps
        now = datetime.now()
        if "_id" not in user:
            user["created_at"] = now
        user["updated_at"] = now

        # Hash password
        if "password" in user:
            user["password"] = bcrypt.hashpw(user["password"].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        return user

    def _validate_history_entry(self, history_entry: Dict) -> Dict:
        if not isinstance(history_entry, dict):
            raise ValueError("History entry must be a dictionary")
        if not all(key in history_entry for key in ["prompt", "curr_loc", "results"]):
            raise ValueError("History entry must contain prompt, curr_loc, and results")
        if not isinstance(history_entry["prompt"], str) or not history_entry["prompt"].strip():
            raise ValueError("Prompt must be a non-empty string")
        if not isinstance(history_entry["curr_loc"], str):
            raise ValueError("curr_loc must be a string")
        if not isinstance(history_entry["results"], list):
            raise ValueError("Results must be a list")
        return history_entry

    def insert_one(self, user: Dict) -> ObjectId:
        try:
            user_data = self._validate_user(user)
            
            if self.collection.find_one({"username": user_data["username"]}):
                raise ValueError(f"Username '{user_data['username']}' already exists")
            
            result = self.collection.insert_one(user_data)
            return result.inserted_id
        except Exception as e:
            print(f"Error adding user: {e}")
            raise e

    def find_by_id(self, id: str) -> Optional[Dict]:
        try:
            user_data = self.collection.find_one({"_id": ObjectId(id)})
            if user_data:
                return user_data
            return None
        except Exception as e:
            print(f"Error finding user: {e}")
            return None

    def find_by_username(self, username: str) -> Optional[Dict]:
        try:
            user_data = self.collection.find_one({"username": username.lower()})
            if user_data:
                return user_data
            return None
        except Exception as e:
            print(f"Error finding user: {e}")
            return None

    def verify_password(self, username: str, password: str) -> bool:
        try:
            user = self.find_by_username(username)
            if not user:
                return False
            return bcrypt.checkpw(password.encode('utf-8'), user["password"].encode('utf-8'))
        except Exception as e:
            print(f"Error verifying password: {e}")
            return False

    def update_by_id(self, id: str, update_data: Dict) -> bool:
        try:
            current = self.find_by_id(id)
            if not current:
                raise ValueError(f"Not found user with id {id}")

            updated = {**current, **update_data}
            validated = self._validate_user(updated)
            
            if validated["username"] != current["username"]:
                existing = self.collection.find_one({
                    "username": validated["username"],
                    "_id": {"$ne": ObjectId(id)}
                })
                if existing:
                    raise ValueError(f"Username '{validated['username']}' already exists")

            result = self.collection.update_one(
                {"_id": ObjectId(id)},
                {"$set": validated}
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"Error updating user: {e}")
            raise e

    def delete_by_id(self, id: str) -> bool:
        try:
            result = self.collection.delete_one({"_id": ObjectId(id)})
            return result.deleted_count > 0
        except Exception as e:
            print(f"Error deleting user: {e}")
            return False

    def add_history(self, id: str, history_entry: Dict) -> bool:
        try:
            user = self.find_by_id(id)
            if not user:
                raise ValueError(f"Not found user with id {id}")

            validated_entry = self._validate_history_entry(history_entry)

            result = self.collection.update_one(
                {"_id": ObjectId(id)},
                {
                    "$push": {"history": validated_entry},
                    "$set": {"updated_at": datetime.now()}
                }
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"Error adding history: {e}")
            raise e