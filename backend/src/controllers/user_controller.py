import requests
from flask import Flask, request, jsonify
from src.services.services import user_service
from src.models.user_model import Users
from datetime import datetime


class UserController:
    def __init__(self):
        self.user_service = user_service

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

    def register(self, request):
        try:
            # Lấy dữ liệu từ request
            data = request.get_json()
            if not data:
                return jsonify({"error": "No input data provided"}), 400

            # Validate gender
            gender = data.get("gender")
            valid_genders = ["male", "female", "other"]
            if not gender or not isinstance(gender, str) or gender.lower() not in valid_genders:
                return jsonify({"error": "Gender must be one of: male, female, other"}), 400

            # Parse dateOfBirth from string to datetime
            date_of_birth_str = data.get("dateOfBirth")
            try:
                date_of_birth = datetime.strptime(date_of_birth_str, "%Y-%m-%d") if date_of_birth_str else None
            except (ValueError, TypeError):
                return jsonify({"error": "Invalid dateOfBirth format, expected YYYY-MM-DD"}), 400

            user = Users(
                username=data.get("username"),
                password=data.get("password"),
                fullName=data.get("fullName"),
                dateOfBirth=date_of_birth,
                gender=gender.lower()
            )

            # Gọi UserService để insert user
            user_response = self.user_service.insert_one(user)

            # Trả về phản hồi thành công
            return jsonify({
                "message": "User created successfully",
                "user": str(user_response)
            }), 201

        except ValueError as ve:
            # Xử lý lỗi validate từ UserService
            return jsonify({"error": str(ve)}), 400
        except Exception as e:
            # Xử lý lỗi chung
            print(f"Error creating user: {e}")
            return jsonify({"error": "Internal server error"}), 500