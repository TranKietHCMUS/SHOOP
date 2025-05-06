from src.extensions import AI_MODELS
from bson.objectid import ObjectId
import datetime
import bcrypt
import re
from typing import List, Optional, Dict
from src.models.user_model import Users
import jwt
from src.config import Config


class UserService:  
    def __init__(self, db, ai_service=None, product_service=None):
        self.ai_service = ai_service
        self.product_service = product_service
        self.collection = db.get_collection("users")
        self._ensure_indexes()
        
    def get_similar_products(self, user_products_with_units, top_k=10):
        # Extract product names for embedding generation (first item in each tuple)
        product_names = [item[0] for item in user_products_with_units]
        print(f"user_products_with_units: {user_products_with_units}")
        # Generate embeddings for the product names only
        embeddings = self.ai_service.get_embeddings(product_names)
        
        # Search for products with both name and unit
        results = self.product_service.search_products(embeddings=embeddings, 
                                                       product_items_with_units=user_products_with_units,
                                                       top_k=top_k)
        # print(f"Results: {results}")
        final_results = []
        for i, res in enumerate(results):
            product_res = []
            for j, result in enumerate(res):
                product_res.append({
                    "id": str(result['_id']),
                    "name": result['name'],
                    "store_name": result['store_name'],
                    "price": result['price'],
                    "unit": result['unit'],
                    "category": result['category'],
                    "img_url": result['img_url'],
                    "vs_score": result['vs_score'],
                    "fts_score": result['fts_score'],
                    "unit_score": result.get('unit_score', 0),
                    "score": result['score'],
                    "created_at": result['created_at'],
                    "updated_at": result['updated_at'],
                })
            final_results.append(product_res)
        return final_results

    def processing(self, request):
        prompt = request.get("prompt")
        expected_radius = request.get("expected_radius")
        user_location = request.get("user_location")

        prompt_instance = self.ai_service.process_prompt(prompt)
        print(f"Prompt instance: {prompt_instance.__dict__}")
        items = prompt_instance.items
        if not items:
            raise ValueError("Error in prompting, prompt again")
        products = []
        quantity = []
        total_price = prompt_instance.total_price
        for item in items:
            products.append(item.get("product_name"))
            quantity.append((item.get("quantity"), item.get("unit")))
        product_with_unit = [(item.get("product_name"), item.get("unit")) for item in items]
        similar_products = self.get_similar_products(product_with_unit)

        return products, similar_products, quantity, total_price

    def _ensure_indexes(self):
        try:
            self.collection.create_index([("username", 1)], unique=True, name="username_unique_index")
            print("Indexes created successfully")
        except Exception as e:
            print(f"Error creating indexes: {e}")

    def _validate_user(self, user: Dict) -> Dict:
        validated_user = user.copy()
        required_fields = ["username", "password", "fullName", "dateOfBirth", "gender"]
        if not all(field in validated_user and validated_user[field] is not None for field in required_fields):
            raise ValueError("Missing required fields")

        if not isinstance(validated_user["username"], str):
            raise ValueError("Username must be a string")
        if not re.match(r"^[a-zA-Z0-9_-]{3,50}$", validated_user["username"].strip().lower()):
            raise ValueError("Username must be 3-50 characters and contain only letters, numbers, underscores, or hyphens")

        if not isinstance(validated_user["password"], str) or len(validated_user["password"]) < 8:
            raise ValueError("Password must be a string with at least 8 characters")

        if not isinstance(validated_user["fullName"], str) or len(validated_user["fullName"].strip()) < 1:
            raise ValueError("fullName must be a non-empty string")
        validated_user["fullName"] = validated_user["fullName"].strip()

        if not isinstance(validated_user["dateOfBirth"], datetime.datetime):
            raise ValueError("dateOfBirth must be a datetime object")
        now = datetime.datetime.now()
        if validated_user["dateOfBirth"] > now or validated_user["dateOfBirth"] < datetime.datetime(1900, 1, 1):
            raise ValueError("Date of birth must be between 1900-01-01 and now")

        valid_genders = ["male", "female", "other"]
        if validated_user["gender"].lower() not in valid_genders:
            raise ValueError("Gender must be male/female/other")
        validated_user["gender"] = validated_user["gender"].lower()

        if "history" in validated_user and validated_user["history"] is not None:
            if not isinstance(validated_user["history"], list):
                raise ValueError("History must be a list")
            for entry in validated_user["history"]:
                if not all(k in entry for k in ["prompt", "curr_loc", "results"]):
                    raise ValueError("Invalid history format")

        if "_id" not in validated_user:
            validated_user["created_at"] = now
        validated_user["updated_at"] = now

        return validated_user

    def _validate_history_entry(self, history_entry: Dict) -> Dict:
        if not isinstance(history_entry, dict):
            raise ValueError("History entry must be a dict")
        if not all(k in history_entry for k in ["prompt", "curr_loc", "results"]):
            raise ValueError("Missing fields in history entry")
        return history_entry

    def insert_one(self, user: Dict) -> Dict:
        try:
            validated_user = self._validate_user(user)
            password = bcrypt.hashpw(validated_user["password"].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

            new_user = Users(
                username=validated_user["username"],
                password=password,
                fullName=validated_user["fullName"],
                dateOfBirth=validated_user["dateOfBirth"],
                gender=validated_user["gender"]
            )
            
            if self.collection.find_one({"username": new_user.username}):
                raise ValueError(f"Username '{new_user.username}' already exists")
            
            result = self.collection.insert_one(new_user.to_dict())
            return {
                "id": str(result.inserted_id),
                "username": new_user.username,
                "fullName": new_user.fullName,
                "dateOfBirth": new_user.dateOfBirth,
                "gender": new_user.gender,
                "history": new_user.history,
                "created_at": new_user.created_at,
                "updated_at": new_user.updated_at
            }
        except Exception as e:
            print(f"Error adding user: {e}")
            raise e

    def find_by_id(self, id: str) -> Optional[Dict]:
        try:
            user_data = self.collection.find_one({"_id": ObjectId(id)})
            if user_data:
                return {
                    "id": str(user_data["_id"]),
                    "username": user_data["username"],
                    "fullName": user_data["fullName"],
                    "dateOfBirth": user_data["dateOfBirth"],
                    "gender": user_data["gender"],
                    "history": user_data.get("history", []),
                    "created_at": user_data["created_at"],
                    "updated_at": user_data["updated_at"]
                }
            return None
        except Exception as e:
            print(f"Error finding user: {e}")
            return None

    def find_by_username(self, username: str) -> Optional[Dict]:
        try:
            user_data = self.collection.find_one({"username": username})

            if user_data:
                return {
                    "id": str(user_data["_id"]),
                    "username": user_data["username"],
                    "fullName": user_data["fullName"],
                    "dateOfBirth": user_data["dateOfBirth"],
                    "gender": user_data["gender"],
                    "history": user_data.get("history", []),
                    "created_at": user_data["created_at"],
                    "updated_at": user_data["updated_at"]
                }
            return None
        except Exception as e:
            print(f"Error finding user: {e}")
            return None

    def verify_password(self, username: str, password: str) -> bool:
        try:
            user= self.collection.find_one({"username": username})
            if not user:
                return False
            return bcrypt.checkpw(password.encode('utf-8'), user["password"].encode('utf-8'))
        except Exception as e:
            print(f"Error verifying password: {e}")
            return False

    def update_by_id(self, id: str, update_user: Dict) -> bool:
        try:
            if not self.find_by_id(id):
                raise ValueError(f"Not found user with id {id}")

            validated = self._validate_user(update_user)

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

    def add_history(self, id: str, history_entry: dict) -> bool:
        try:
            if not self.find_by_id(id):
                raise ValueError(f"Not found user with id {id}")
            validated_entry = self._validate_history_entry(history_entry)
            result = self.collection.update_one(
                {"_id": ObjectId(id)},
                {"$push": {"history": validated_entry}, "$set": {"updated_at": datetime.datetime.now()}}
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"Error adding history: {e}")
            raise e

    @staticmethod
    def create_token(user: Dict) -> str:
        payload = {
            'id': str(user["id"]),
            'username': user["username"],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1),
            'iat': datetime.datetime.utcnow()
        }
        token = jwt.encode(payload, Config.SECRET_KEY, algorithm='HS256')
        return token
