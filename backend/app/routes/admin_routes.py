from datetime import datetime
from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity
from app.extensions import db
from app.models.user import User
from app.models.complaint import Complaint
from app.models.category import Category
from app.services.complaint_service import log_complaint_action
from app.utils.response_helpers import success_response, error_response
from app.utils.decorators import role_required

admin_bp = Blueprint("admin_bp", __name__)

@admin_bp.route("/complaints", methods=["GET"])
@role_required("admin")
def get_all_complaints():
    complaints = Complaint.query.order_by(Complaint.created_at.desc()).all()
    return success_response(data={"complaints": [c.to_dict(include_relations=True) for c in complaints]})

@admin_bp.route("/complaints/<int:complaint_id>/assign", methods=["PUT"])
@role_required("admin")
def assign_complaint(complaint_id):
    data = request.get_json() or {}
    staff_id = data.get("staff_id")
    priority = data.get("priority")
    remarks = data.get("remarks")

    if not staff_id:
        return error_response(message="Please select a staff member to assign.", status_code=400)

    staff = User.query.filter_by(id=staff_id, role="staff").first()
    if not staff:
        return error_response(message="Specified staff member was not found.", status_code=404)

    complaint = db.session.get(Complaint, complaint_id)
    if not complaint:
        return error_response(message="Complaint not found.", status_code=404)

    admin_id = get_jwt_identity()
    complaint.assigned_staff_id = staff.id
    complaint.status = "Assigned"
    if priority and priority in ["Low", "Medium", "High", "Emergency"]:
        complaint.priority = priority

    log_complaint_action(
        complaint_id=complaint.id,
        user_id=admin_id,
        action="ASSIGNED_TO_STAFF",
        remarks=remarks or f"Assigned to {staff.name}."
    )

    db.session.commit()
    return success_response(
        data={"complaint": complaint.to_dict(include_relations=True)},
        message=f"Complaint assigned to {staff.name} successfully."
    )

@admin_bp.route("/complaints/<int:complaint_id>/status", methods=["PUT"])
@role_required("admin")
def update_complaint_status_admin(complaint_id):
    data = request.get_json() or {}
    new_status = data.get("status")
    remarks = data.get("remarks")

    if new_status not in ["Pending", "Assigned", "In_Progress", "Resolved", "Rejected"]:
        return error_response(message="Invalid status value.", status_code=400)

    complaint = db.session.get(Complaint, complaint_id)
    if not complaint:
        return error_response(message="Complaint not found.", status_code=404)

    admin_id = get_jwt_identity()
    old_status = complaint.status
    complaint.status = new_status

    if new_status == "Resolved":
        complaint.resolved_at = datetime.utcnow()
    elif old_status == "Resolved" and new_status != "Resolved":
        complaint.resolved_at = None

    log_complaint_action(
        complaint_id=complaint.id,
        user_id=admin_id,
        action=f"ADMIN_STATUS_{new_status.upper()}",
        remarks=remarks or f"Admin changed status from {old_status} to {new_status}."
    )

    db.session.commit()
    return success_response(
        data={"complaint": complaint.to_dict(include_relations=True)},
        message=f"Status updated to {new_status}."
    )

@admin_bp.route("/staff", methods=["GET"])
@role_required("admin")
def get_staff_members():
    staff_users = User.query.filter_by(role="staff", is_active=True).all()
    return success_response(data={"staff": [s.to_dict() for s in staff_users]})

@admin_bp.route("/users", methods=["GET"])
@role_required("admin")
def list_users():
    role = request.args.get("role")
    query = User.query
    if role:
        query = query.filter_by(role=role)
    users = query.order_by(User.created_at.desc()).all()
    return success_response(data={"users": [u.to_dict() for u in users]})

@admin_bp.route("/users/staff", methods=["POST"])
@role_required("admin")
def create_staff():
    data = request.get_json() or {}
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    phone = data.get("phone")
    department = data.get("department", "Maintenance Office")

    if not all([name, email, password]):
        return error_response(message="Name, email, and temporary password are required.", status_code=400)

    if User.query.filter_by(email=email.strip().lower()).first():
        return error_response(message="A user with this email already exists.", status_code=409)

    staff = User(
        name=name.strip(),
        email=email.strip().lower(),
        role="staff",
        phone=phone.strip() if phone else None,
        hostel_block=department,
        room_number="Staff Room"
    )
    staff.set_password(password)

    db.session.add(staff)
    db.session.commit()

    return success_response(
        data={"staff": staff.to_dict()},
        message=f"Staff member {staff.name} created successfully.",
        status_code=201
    )

@admin_bp.route("/categories", methods=["POST"])
@role_required("admin")
def add_category():
    data = request.get_json() or {}
    name = data.get("name")
    description = data.get("description")

    if not name:
        return error_response(message="Category name is required.", status_code=400)

    if Category.query.filter_by(name=name.strip()).first():
        return error_response(message="Category already exists.", status_code=409)

    cat = Category(name=name.strip(), description=description)
    db.session.add(cat)
    db.session.commit()

    return success_response(
        data={"category": cat.to_dict()},
        message="Category created successfully.",
        status_code=201
    )
