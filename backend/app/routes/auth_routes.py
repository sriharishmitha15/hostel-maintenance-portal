from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.auth_service import register_student, authenticate_user
from app.models.user import User
from app.utils.response_helpers import success_response, error_response

auth_bp = Blueprint("auth_bp", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    phone = data.get("phone")
    hostel_block = data.get("hostel_block")
    room_number = data.get("room_number")

    if not all([name, email, password, hostel_block, room_number]):
        return error_response(
            message="Please provide name, email, password, hostel block, and room number.",
            status_code=400
        )

    if len(password) < 6:
        return error_response(
            message="Password must be at least 6 characters long.",
            status_code=400
        )

    try:
        user = register_student(name, email, password, phone, hostel_block, room_number)
        return success_response(
            data={"user": user.to_dict()},
            message="Student registered successfully. Please log in.",
            status_code=201
        )
    except ValueError as e:
        return error_response(message=str(e), status_code=409)
    except Exception as e:
        return error_response(message="Registration failed.", errors=[str(e)], status_code=500)

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return error_response(message="Email and password are required.", status_code=400)

    try:
        user, token = authenticate_user(email, password)
        return success_response(
            data={
                "token": token,
                "user": user.to_dict()
            },
            message=f"Welcome back, {user.name}!"
        )
    except ValueError as e:
        return error_response(message=str(e), status_code=401)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return error_response(
            message=f"Login error: {str(e)}", 
            errors=[str(e)], 
            status_code=500
        )

@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_user_profile():
    from app.extensions import db
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    if not user:
        return error_response(message="User not found.", status_code=404)
    return success_response(data={"user": user.to_dict()})
