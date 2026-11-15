from flask import Blueprint
from sqlalchemy import func
from app.extensions import db
from app.models.complaint import Complaint
from app.models.category import Category
from app.models.user import User
from app.utils.response_helpers import success_response
from app.utils.decorators import role_required

analytics_bp = Blueprint("analytics_bp", __name__)

@analytics_bp.route("/dashboard", methods=["GET"])
@role_required("admin")
def get_dashboard_analytics():
    # Overall complaint counts
    total_complaints = Complaint.query.count()
    pending_count = Complaint.query.filter_by(status="Pending").count()
    assigned_count = Complaint.query.filter_by(status="Assigned").count()
    in_progress_count = Complaint.query.filter_by(status="In_Progress").count()
    resolved_count = Complaint.query.filter_by(status="Resolved").count()
    rejected_count = Complaint.query.filter_by(status="Rejected").count()

    # Priority breakdown
    priority_counts = {
        "Low": Complaint.query.filter_by(priority="Low").count(),
        "Medium": Complaint.query.filter_by(priority="Medium").count(),
        "High": Complaint.query.filter_by(priority="High").count(),
        "Emergency": Complaint.query.filter_by(priority="Emergency").count(),
    }

    # Category distribution
    category_data = (
        db.session.query(Category.name, func.count(Complaint.id))
        .outerjoin(Complaint, Category.id == Complaint.category_id)
        .group_by(Category.name)
        .all()
    )
    categories_breakdown = [{"category": name, "count": count} for name, count in category_data]

    # Staff task workload breakdown
    staff_members = User.query.filter_by(role="staff", is_active=True).all()
    staff_workload = []
    for staff in staff_members:
        assigned = Complaint.query.filter_by(assigned_staff_id=staff.id).count()
        completed = Complaint.query.filter(
            Complaint.assigned_staff_id == staff.id,
            Complaint.status == "Resolved"
        ).count()
        staff_workload.append({
            "staff_id": staff.id,
            "staff_name": staff.name,
            "assigned": assigned,
            "completed": completed,
            "pending": assigned - completed
        })

    # Summary KPIs
    total_students = User.query.filter_by(role="student").count()
    total_staff = len(staff_members)
    resolution_rate = round((resolved_count / total_complaints * 100), 1) if total_complaints > 0 else 0

    return success_response(data={
        "summary": {
            "total_complaints": total_complaints,
            "pending": pending_count,
            "assigned": assigned_count,
            "in_progress": in_progress_count,
            "resolved": resolved_count,
            "rejected": rejected_count,
            "resolution_rate": resolution_rate,
            "total_students": total_students,
            "total_staff": total_staff
        },
        "priority_breakdown": priority_counts,
        "categories_breakdown": categories_breakdown,
        "staff_workload": staff_workload
    })
