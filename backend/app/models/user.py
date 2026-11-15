from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from app.extensions import db

class User(db.Model):
    __tablename__ = "Users"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(
        db.Enum("student", "staff", "admin", name="user_role_enum"),
        nullable=False,
        default="student",
        index=True
    )
    phone = db.Column(db.String(20), nullable=True)
    hostel_block = db.Column(db.String(20), nullable=True)
    room_number = db.Column(db.String(20), nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    lodged_complaints = db.relationship(
        "Complaint",
        foreign_keys="Complaint.student_id",
        backref="student",
        lazy="dynamic"
    )
    assigned_complaints = db.relationship(
        "Complaint",
        foreign_keys="Complaint.assigned_staff_id",
        backref="assigned_staff",
        lazy="dynamic"
    )
    action_logs = db.relationship(
        "ComplaintLog",
        backref="performed_by_user",
        lazy="dynamic"
    )

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "phone": self.phone,
            "hostel_block": self.hostel_block,
            "room_number": self.room_number,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

    def __repr__(self):
        return f"<User {self.email} ({self.role})>"
