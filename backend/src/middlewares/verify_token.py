from flask import request, g
from functools import wraps
from flask import jsonify
import jwt
from src.config import Config

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.cookies.get('token')
        if not token:
            return jsonify({'error': 'Token is missing'}), 401

        try:
            decoded = jwt.decode(token, Config.SECRET_KEY, algorithms=['HS256'])
            g.user_id = decoded.get('id')  # lưu id vào g
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401

        return f(*args, **kwargs)
    return decorated