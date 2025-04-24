import requests
from flask import Flask, request, jsonify
from src.services.user_service import processing
from src.services.service import user_service

def handle_user_search(prompt):
    if not prompt:
        return jsonify({"error": "Missing prompt"}), 400
    try:
        products, similar_products, quantity, total_price, stores = processing(prompt)
        return jsonify({"products": products, 
                        "similar_products": similar_products, 
                        "quantity": quantity, 
                        "total_price": total_price, 
                        "stores": stores}), 200
    except ValueError as e:
        return jsonify({"error": "Invalid prompt: " + str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Internal server error: " + str(e)}), 500
    

def register():
    try:
        # Lấy dữ liệu từ request
        data = request.get_json()
        if not data:
            return jsonify({"error": "No input data provided"}), 400

        # Tạo dictionary user từ dữ liệu
        user_data = {
            "username": data.get("username"),
            "password": data.get("password"),
            "fullname": data.get("fullname"),
            "age": data.get("age"),
            "gender": data.get("gender")
        }

        # Gọi UserService để insert user
        inserted_id = user_service.insert_one(user_data)

        # Trả về phản hồi thành công
        return jsonify({
            "message": "User created successfully",
            "user_id": str(inserted_id)
        }), 201

    except ValueError as ve:
        # Xử lý lỗi validate từ UserService
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        # Xử lý lỗi chung
        print(f"Error creating user: {e}")
        return jsonify({"error": "Internal server error"}), 500