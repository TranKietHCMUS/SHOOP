from src import create_app
import traceback
from flask import jsonify, request, redirect

app = create_app()

# Add error handler to show detailed error message for 500 errors
@app.errorhandler(500)
def internal_error(error):
    error_traceback = traceback.format_exc()
    print("Internal Server Error:")
    print(error_traceback)
    return jsonify({
        "error": "Internal Server Error",
        "message": str(error),
        "traceback": error_traceback
    }), 500

# Log requests that return 500 errors
@app.after_request
def log_errors(response):
    if response.status_code >= 500:
        print(f"Error in request: {request.method} {request.url}")
        print(f"Response: {response.status_code}")
    return response

# Bỏ các route test không cần thiết để tránh xung đột
# Chỉ giữ lại route handler cho 404 errors
@app.errorhandler(404)
def page_not_found(e):
    return jsonify({
        "error": "Not Found",
        "message": f"The requested URL {request.path} was not found on the server"
    }), 404

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)