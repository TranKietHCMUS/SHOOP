import logging
from flask import Flask, make_response, request, jsonify
from src.services.services import user_service
from datetime import datetime

class AuthController:
    def __init__(self):
        self.user_service = user_service
        self.logger = logging.getLogger(__name__)

    def register(self, req):
        try:
            data = req.get_json()
            if not data:
                return jsonify({"error": "No input data provided"}), 400
            if data["username"] != data["username"].strip() or data["password"] != data["password"].strip():
                return jsonify({"error": "Username and password cannot contain leading or trailing spaces"}), 400
            gender = data.get("gender")
            valid_genders = ["male", "female", "other"]
            if not gender or not isinstance(gender, str) or gender.lower() not in valid_genders:
                return jsonify({"error": "Gender must be one of: male, female, other"}), 400
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
            user_response = self.user_service.insert_one(user)
            response = make_response(jsonify({
                "message": "User created successfully",
                "data": {"user": user_response}
            }), 201)
            return response
        except ValueError as ve:
            self.logger.warning(f"Validation error: {ve}")
            return jsonify({"error": str(ve)}), 400
        except Exception as e:
            self.logger.error(f"Error creating user: {e}")
            return jsonify({"error": "Internal server error"}), 500

    def login(self, req):
        try:
            data = req.get_json()
            if not data:
                return jsonify({"error": "No input data provided"}), 400
            username = data.get("username")
            password = data.get("password")
            if not username or not password:
                return jsonify({"error": "Username and password are required"}), 400
            if username != username.strip() or password != password.strip():
                return jsonify({"error": "Username and password cannot contain leading or trailing spaces"}), 400
            user = self.user_service.find_by_username(username)
            if not user:
                return jsonify({"error": "User not found"}), 404
            if not self.user_service.verify_password(username, password):
                return jsonify({"error": "Wrong password"}), 401
            access_token = self.user_service.create_token(user)
            if not access_token:
                return jsonify({"error": "Failed to create access token"}), 500
            response = make_response(jsonify({
                "message": "Log in successfully",
                "data": {"user": user}
            }), 200)
            response.set_cookie(
                key="token",
                value=access_token,
                max_age=86400,
                httponly=False,
                secure=False,
                samesite="Lax"
            )
            return response
        except Exception as e:
            self.logger.error(f"Error during login: {e}")
            return jsonify({"error": "Internal server error"}), 500

    def logout(self, req):
        try:
            response = make_response(jsonify({"message": "Log out successfully"}), 200)
            response.delete_cookie('token')
            return response
        except Exception as e:
            self.logger.error(f"Error during logout: {e}")
            return jsonify({"error": "Internal server error"}), 500