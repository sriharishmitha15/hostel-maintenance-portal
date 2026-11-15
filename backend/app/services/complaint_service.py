from datetime import datetime
from app.extensions import db
from app.models.complaint import Complaint
from app.models.complaint_image import ComplaintImage
from app.models.complaint_log import ComplaintLog
from app.models.category import Category
from app.services.file_upload_service import save_uploaded_file

def log_complaint_action(complaint_id, user_id, action, remarks=None):
    """Utility to record an audit action in Complaint_Logs."""
    log = ComplaintLog(
        complaint_id=complaint_id,
        changed_by_user_id=user_id,
        action=action,
        remarks=remarks
    )
    db.session.add(log)

def create_complaint(student_id, title, description, category_id, priority, hostel_block, room_number, uploaded_files=None):
    """Create a new maintenance complaint with optional image uploads."""
    category = db.session.get(Category, category_id)
    if not category:
        raise ValueError("Invalid category selected.")

    complaint = Complaint(
        title=title.strip(),
        description=description.strip(),
        category_id=category_id,
        student_id=student_id,
        priority=priority or "Medium",
        status="Pending",
        hostel_block=hostel_block.strip(),
        room_number=room_number.strip()
    )
    db.session.add(complaint)
    db.session.flush()  # Obtain complaint.id

    # Handle image attachments
    if uploaded_files:
        for file in uploaded_files:
            if file and file.filename:
                file_url = save_uploaded_file(file, subfolder="complaints")
                if file_url:
                    img = ComplaintImage(
                        complaint_id=complaint.id,
                        image_url=file_url,
                        image_type="submission"
                    )
                    db.session.add(img)

    # Add initial audit log
    log_complaint_action(
        complaint_id=complaint.id,
        user_id=student_id,
        action="COMPLAINT_SUBMITTED",
        remarks="Complaint lodged by student."
    )

    db.session.commit()
    return complaint

def get_complaints_query(current_user, status=None, priority=None, category_id=None, hostel_block=None, search=None):
    """Filters complaints based on role and optional query parameters."""
    query = Complaint.query

    # Role-based visibility
    if current_user.role == "student":
        query = query.filter(Complaint.student_id == current_user.id)
    elif current_user.role == "staff":
        query = query.filter(Complaint.assigned_staff_id == current_user.id)
    # Admin can view all complaints

    # Query filters
    if status and status != "All":
        query = query.filter(Complaint.status == status)
    if priority and priority != "All":
        query = query.filter(Complaint.priority == priority)
    if category_id and category_id != "All":
        query = query.filter(Complaint.category_id == category_id)
    if hostel_block and hostel_block != "All":
        query = query.filter(Complaint.hostel_block == hostel_block)
    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.filter(
            (Complaint.title.ilike(search_pattern)) |
            (Complaint.description.ilike(search_pattern)) |
            (Complaint.room_number.ilike(search_pattern))
        )

    return query.order_by(Complaint.created_at.desc())
