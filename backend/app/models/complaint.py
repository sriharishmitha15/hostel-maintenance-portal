from datetime import datetime
from app.extensions import db

class Complaint(db.Model):
    __tablename__ = "Complaints"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=False)
    category_id = db.Column(
        db.Integer,
        db.ForeignKey("Categories.id", ondelete="RESTRICT", onupdate="CASCADE"),
        nullable=False
    )
    student_id = db.Column(
        db.Integer,
        db.ForeignKey("Users.id", ondelete="RESTRICT", onupdate="CASCADE"),
        nullable=False
    )
    assigned_staff_id = db.Column(
        db.Integer,
        db.ForeignKey("Users.id", ondelete="SET NULL", onupdate="CASCADE"),
        nullable=True
    )
    priority = db.Column(
        db.Enum("Low", "Medium", "High", "Emergency", name="complaint_priority_enum"),
        nullable=False,
        default="Medium"
    )
    status = db.Column(
        db.Enum("Pending", "Assigned", "In_Progress", "Resolved", "Rejected", name="complaint_status_enum"),
        nullable=False,
        default="Pending"
    )
    hostel_block = db.Column(db.String(20), nullable=False)
    room_number = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )
    resolved_at = db.Column(db.DateTime, nullable=True)

    # Relationships
    images = db.relationship(
        "ComplaintImage",
        backref="complaint",
        cascade="all, delete-orphan",
        lazy="joined"
    )
    logs = db.relationship(
        "ComplaintLog",
        backref="complaint",
        cascade="all, delete-orphan",
        order_by="ComplaintLog.created_at.asc()",
        lazy="joined"
    )

    def to_dict(self, include_relations=True):
        data = {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "category_id": self.category_id,
            "category_name": self.category.name if self.category else None,
            "student_id": self.student_id,
            "student_name": self.student.name if self.student else None,
            "student_email": self.student.email if self.student else None,
            "student_phone": self.student.phone if self.student else None,
            "assigned_staff_id": self.assigned_staff_id,
            "assigned_staff_name": self.assigned_staff.name if self.assigned_staff else None,
            "priority": self.priority,
            "status": self.status,
            "hostel_block": self.hostel_block,
            "room_number": self.room_number,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "resolved_at": self.resolved_at.isoformat() if self.resolved_at else None,
        }

        if include_relations:
            data["images"] = [img.to_dict() for img in self.images] if self.images else []
            data["logs"] = [log.to_dict() for log in self.logs] if self.logs else []

        return data

    def __repr__(self):
        return f"<Complaint #{self.id} - {self.title} [{self.status}]>"
