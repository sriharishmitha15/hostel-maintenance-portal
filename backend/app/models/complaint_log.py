from datetime import datetime
from app.extensions import db

class ComplaintLog(db.Model):
    __tablename__ = "Complaint_Logs"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    complaint_id = db.Column(
        db.Integer,
        db.ForeignKey("Complaints.id", ondelete="CASCADE", onupdate="CASCADE"),
        nullable=False,
        index=True
    )
    changed_by_user_id = db.Column(
        db.Integer,
        db.ForeignKey("Users.id", ondelete="RESTRICT", onupdate="CASCADE"),
        nullable=False
    )
    action = db.Column(db.String(100), nullable=False)
    remarks = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "complaint_id": self.complaint_id,
            "changed_by_user_id": self.changed_by_user_id,
            "changed_by_user_name": self.performed_by_user.name if self.performed_by_user else None,
            "changed_by_user_role": self.performed_by_user.role if self.performed_by_user else None,
            "action": self.action,
            "remarks": self.remarks,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

    def __repr__(self):
        return f"<ComplaintLog #{self.id} on Complaint #{self.complaint_id}: {self.action}>"
