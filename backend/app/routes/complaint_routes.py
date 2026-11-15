from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.user import User
from app.models.complaint import Complaint
from app.models.category import Category
from app.services.complaint_service import create_complaint, get_complaints_query
from app.utils.response_helpers import success_response, error_response
from app.utils.decorators import role_required

complaint_bp = Blueprint("complaint_bp", __name__)

@complaint_bp.route("/categories", methods=["GET"])
def get_categories():
    categories = Category.query.order_by(Category.name.asc()).all()
    return success_response(data={"categories": [c.to_dict() for c in categories]})

@complaint_bp.route("", methods=["POST"])
@jwt_required()
def submit_complaint():
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    if not user:
        return error_response(message="User not found.", status_code=404)

    # Allow both multipart/form-data (with files) and application/json
    if request.content_type and "multipart/form-data" in request.content_type:
        title = request.form.get("title")
        description = request.form.get("description")
        category_id = request.form.get("category_id")
        priority = request.form.get("priority", "Medium")
        hostel_block = request.form.get("hostel_block", user.hostel_block)
        room_number = request.form.get("room_number", user.room_number)
        files = request.files.getlist("images")
    else:
        data = request.get_json() or {}
        title = data.get("title")
        description = data.get("description")
        category_id = data.get("category_id")
        priority = data.get("priority", "Medium")
        hostel_block = data.get("hostel_block", user.hostel_block)
        room_number = data.get("room_number", user.room_number)
        files = []

    if not all([title, description, category_id, hostel_block, room_number]):
        return error_response(
            message="Please provide title, description, category, hostel block, and room number.",
            status_code=400
        )

    try:
        complaint = create_complaint(
            student_id=user.id,
            title=title,
            description=description,
            category_id=int(category_id),
            priority=priority,
            hostel_block=hostel_block,
            room_number=room_number,
            uploaded_files=files
        )
        return success_response(
            data={"complaint": complaint.to_dict()},
            message="Complaint lodged successfully.",
            status_code=201
        )
    except ValueError as e:
        return error_response(message=str(e), status_code=400)
    except Exception as e:
        return error_response(message="Failed to submit complaint.", errors=[str(e)], status_code=500)

@complaint_bp.route("", methods=["GET"])
@jwt_required()
def list_complaints():
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    if not user:
        return error_response(message="User not found.", status_code=404)

    status = request.args.get("status")
    priority = request.args.get("priority")
    category_id = request.args.get("category_id")
    hostel_block = request.args.get("hostel_block")
    search = request.args.get("search")

    query = get_complaints_query(
        current_user=user,
        status=status,
        priority=priority,
        category_id=category_id,
        hostel_block=hostel_block,
        search=search
    )
    complaints = query.all()

    return success_response(data={"complaints": [c.to_dict() for c in complaints]})

@complaint_bp.route("/<int:complaint_id>", methods=["GET"])
@jwt_required()
def get_complaint_detail(complaint_id):
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    complaint = db.session.get(Complaint, complaint_id)

    if not complaint:
        return error_response(message="Complaint not found.", status_code=404)

    # Ensure student can only view their own complaint
    if user.role == "student" and complaint.student_id != user.id:
        return error_response(message="Access unauthorized.", status_code=403)

    return success_response(data={"complaint": complaint.to_dict(include_relations=True)})
