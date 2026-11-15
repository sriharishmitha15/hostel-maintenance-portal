from datetime import datetime
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.user import User
from app.models.complaint import Complaint
from app.models.complaint_image import ComplaintImage
from app.services.complaint_service import log_complaint_action
from app.services.file_upload_service import save_uploaded_file
from app.utils.response_helpers import success_response, error_response
from app.utils.decorators import role_required

staff_bp = Blueprint("staff_bp", __name__)

@staff_bp.route("/tasks", methods=["GET"])
@role_required("staff", "admin")
def get_assigned_tasks():
    user_id = get_jwt_identity()
    status = request.args.get("status")

    query = Complaint.query.filter_by(assigned_staff_id=user_id)
    if status and status != "All":
        query = query.filter_by(status=status)

    tasks = query.order_by(Complaint.updated_at.desc()).all()
    return success_response(data={"tasks": [t.to_dict() for t in tasks]})

@staff_bp.route("/tasks/<int:complaint_id>/status", methods=["PUT"])
@role_required("staff", "admin")
def update_task_status(complaint_id):
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    complaint = db.session.get(Complaint, complaint_id)

    if not complaint:
        return error_response(message="Complaint not found.", status_code=404)

    # If staff, make sure task is assigned to them
    if user.role == "staff" and complaint.assigned_staff_id != user.id:
        return error_response(message="This task is not assigned to you.", status_code=403)

    # Read form data or json
    if request.content_type and "multipart/form-data" in request.content_type:
        new_status = request.form.get("status")
        remarks = request.form.get("remarks")
        files = request.files.getlist("images")
    else:
        data = request.get_json() or {}
        new_status = data.get("status")
        remarks = data.get("remarks")
        files = []

    if new_status not in ["In_Progress", "Resolved"]:
        return error_response(
            message="Invalid status. Staff can set status to 'In_Progress' or 'Resolved'.",
            status_code=400
        )

    old_status = complaint.status
    complaint.status = new_status

    if new_status == "Resolved":
        complaint.resolved_at = datetime.utcnow()

    # Save resolution proof photos if provided
    if files:
        for file in files:
            if file and file.filename:
                file_url = save_uploaded_file(file, subfolder="resolutions")
                if file_url:
                    img = ComplaintImage(
                        complaint_id=complaint.id,
                        image_url=file_url,
                        image_type="resolution"
                    )
                    db.session.add(img)

    # Log action in audit history
    log_complaint_action(
        complaint_id=complaint.id,
        user_id=user.id,
        action=f"STATUS_UPDATED_{new_status.upper()}",
        remarks=remarks or f"Staff updated status from {old_status} to {new_status}."
    )

    db.session.commit()
    return success_response(
        data={"complaint": complaint.to_dict(include_relations=True)},
        message=f"Complaint status updated to {new_status}."
    )
