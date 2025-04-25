from src.extensions import AI_MODELS
from bson.objectid import ObjectId
from datetime import datetime
import bcrypt
import re
from typing import List, Optional, Dict
from src.models.user_model import Users


class UserService:  
    def __init__(self, db, ai_service=None):
        self.ai_service = ai_service
        self.collection = db.get_collection("users")
        self._ensure_indexes()
        
    def get_similar_products(self, user_products):
        embeddings = self.ai_service.get_embeddings(user_products)
        results = self.ai_service.search_products(embeddings, user_products)
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

    def get_stores(self, products):
        stores = []

        """
        search stores that have products
        """

        return stores

    def processing(self, request):
        # print(request)
        prompt = request.get("prompt")
        expected_radius = request.get("expected_radius")
        user_location = request.get("user_location")

        # prompt = self.ai_service.prompt_formatting(prompt)
        prompt_instance = self.ai_service.process_prompt(prompt)
        items = prompt_instance.items
        if not items:
            raise ValueError("Error in prompting, prompt again")
        products = []
        quantity = []
        total_price = prompt_instance.total_price
        for item in items:
            products.append(item.get("product_name"))
            quantity.append((item.get("quantity"), item.get("unit")))
            
        similar_products = self.get_similar_products(products)
        stores = self.get_stores(similar_products)

        return products, similar_products, quantity, total_price, stores

    def _ensure_indexes(self):
        try:
            self.collection.create_index([("username", 1)], unique=True, name="username_unique_index")
            print("Indexes created successfully")
        except Exception as e:
            print(f"Error creating indexes: {e}")

    def _validate_user(self, user: Users) -> Users:
        # Validate required fields
        required_fields = ["username", "password", "fullName", "dateOfBirth", "gender"]
        if not all(getattr(user, field, None) for field in required_fields):
            raise ValueError("Missing required fields")

        # Validate username
        if not isinstance(user.username, str):
            raise ValueError("Username must be a string")
        user.username = user.username.strip().lower()
        if not re.match(r"^[a-zA-Z0-9_-]{3,50}$", user.username):
            raise ValueError("Username must be 3-50 characters and contain only letters, numbers, underscores, or hyphens")

        # Validate password
        if not isinstance(user.password, str) or len(user.password) < 8:
            raise ValueError("Password must be a string with at least 8 characters")

        # Validate fullName
        if not isinstance(user.fullName, str) or len(user.fullName.strip()) < 1:
            raise ValueError("fullName must be a non-empty string")
        user.fullName = user.fullName.strip()

        # Validate dateOfBirth
        if not isinstance(user.dateOfBirth, datetime):
            raise ValueError("dateOfBirth must be a datetime object")
        current_date = datetime.now()
        min_date = datetime(1900, 1, 1)
        if user.dateOfBirth > current_date:
            raise ValueError("dateOfBirth cannot be in the future")
        if user.dateOfBirth < min_date:
            raise ValueError("dateOfBirth cannot be before 1900")

        # Validate gender
        valid_genders = ["male", "female", "other"]
        if not isinstance(user.gender, str) or user.gender.lower() not in valid_genders:
            raise ValueError("Gender must be one of: male, female, other")
        user.gender = user.gender.lower()

        # Validate history if provided
        if user.history is not None:
            if not isinstance(user.history, list):
                raise ValueError("History must be a list")
            for entry in user.history:
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
        if user._id is None:
            user.created_at = now
        user.updated_at = now

        return user

    def _validate_history_entry(self, history_entry: dict) -> dict:
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

    def insert_one(self, user: Users) -> Dict:
        try:
            validated_user = self._validate_user(user)

            password = bcrypt.hashpw(validated_user.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

            new_user = Users(username=validated_user.username, 
                             password=password, 
                             fullName=validated_user.fullName,
                             dateOfBirth=validated_user.dateOfBirth, 
                             gender=validated_user.gender)
            
            if self.collection.find_one({"username": new_user.username}):
                raise ValueError(f"Username '{new_user.username}' already exists")
            
            result = self.collection.insert_one(new_user.to_dict())
            if result:
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

    def find_by_id(self, id: str) -> Optional[Users]:
        try:
            user_data = self.collection.find_one({"_id": ObjectId(id)})
            if user_data:
                return Users(
                    id=str(user_data["_id"]),
                    username=user_data["username"],
                    fullName=user_data["fullName"],
                    dateOfBirth=user_data["dateOfBirth"],
                    gender=user_data["gender"],
                    history=user_data["history"],
                    created_at=user_data["created_at"],
                    updated_at=user_data["updated_at"]
                )
            return None
        except Exception as e:
            print(f"Error finding user: {e}")
            return None

    def find_by_username(self, username: str) -> Optional[Users]:
        try:
            user_data = self.collection.find_one({"username": username.lower()})
            if user_data:
                return Users(
                    id=str(user_data["_id"]),
                    username=user_data["username"],
                    fullName=user_data["fullName"],
                    dateOfBirth=user_data["dateOfBirth"],
                    gender=user_data["gender"],
                    history=user_data["history"],
                    created_at=user_data["created_at"],
                    updated_at=user_data["updated_at"]
                )
            return None
        except Exception as e:
            print(f"Error finding user: {e}")
            return None

    def verify_password(self, username: str, password: str) -> bool:
        try:
            user = self.find_by_username(username)
            if not user:
                return False
            return bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8'))
        except Exception as e:
            print(f"Error verifying password: {e}")
            return False

    def update_by_id(self, id: str, update_user: Users) -> bool:
        try:
            current = self.find_by_id(id)
            if not current:
                raise ValueError(f"Not found user with id {id}")

            validated = self._validate_user(update_user)
            
            if validated.username != current.username:
                existing = self.collection.find_one({
                    "username": validated.username,
                    "_id": {"$ne": ObjectId(id)}
                })
                if existing:
                    raise ValueError(f"Username '{validated.username}' already exists")

            result = self.collection.update_one(
                {"_id": ObjectId(id)},
                {"$set": validated.to_dict()}
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