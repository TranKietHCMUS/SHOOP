from flask import Flask, make_response, request, jsonify
from src.services.services import user_service
from datetime import datetime

class AuthController:
    def __init__(self):
        self.user_service = user_service

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

            user = {
                "username": data.get("username"),
                "password": data.get("password"),
                "fullName": data.get("fullName"),
                "dateOfBirth": date_of_birth,
                "gender": gender
            }

            # Gọi UserService để insert user
            user_response = self.user_service.insert_one(user)

            response = make_response(jsonify({
                "message": "User created successfully",
                "data": {
                    "user": user_response,
                }
            }), 201)

            return response

        except ValueError as ve:
            # Xử lý lỗi validate từ UserService
            return jsonify({"error": str(ve)}), 400
        except Exception as e:
            # Xử lý lỗi chung
            print(f"Error creating user: {e}")
            return jsonify({"error": "Internal server error"}), 500
    
    def login(self, request):
        try:
            # Lấy dữ liệu từ request
            data = request.get_json()
            if not data:
                return jsonify({"error": "No input data provided"}), 400

            # Validate username and password
            username = data.get("username")
            password = data.get("password")
            if not username or not password:
                return jsonify({"error": "Username and password are required"}), 400

            # check if user exists
            user = user_service.find_by_username(username)
            if not user:
                return jsonify({"error": "User not found"}), 404
            
            # check if password is correct
            if not user_service.verify_password(username, password):
                return jsonify({"error": "Wrong password"}), 401

            # create access token
            access_token = user_service.create_token(user)

            if not access_token:
                return jsonify({"error": "Failed to create access token"}), 500
            
            response = make_response(jsonify({
                "message": "Log in successfully",
                "data": {
                    "user": user,
                }
            }), 200)

            response.set_cookie(
                key="token",
                value=access_token,
                max_age=86400,  # 1 day expiry
                httponly=False,
                secure=False,  # Set to True in production with HTTPS
                samesite="Lax"  # CSRF protection
            )

            return response

        except Exception as e:
            print(f"Error during login: {e}")
            return jsonify({"error": "Internal server error"}), 500
    
    def logout(self, request):
        try:
            response = make_response(jsonify({
                "message": "Log out successfully",
            }), 200)

            # clear cookie
            response.delete_cookie('token')

            return response

        except Exception as e:
            print(f"Error during logout: {e}")
            return jsonify({"error": "Internal server error"}), 500