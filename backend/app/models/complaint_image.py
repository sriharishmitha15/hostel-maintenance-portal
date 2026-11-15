from datetime import datetime
from app.extensions import db

class ComplaintImage(db.Model):
    __tablename__ = "Complaint_Images"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    complaint_id = db.Column(
        db.Integer,
        db.ForeignKey("Complaints.id", ondelete="CASCADE", onupdate="CASCADE"),
        nullable=False,
        index=True
    )
    image_url = db.Column(db.String(500), nullable=False)
    image_type = db.Column(
        db.Enum("submission", "resolution", name="image_type_enum"),
        nullable=False,
        default="submission"
    )
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "complaint_id": self.complaint_id,
            "image_url": self.image_url,
            "image_type": self.image_type,
            "uploaded_at": self.uploaded_at.isoformat() if self.uploaded_at else None
        }

    def __repr__(self):
        return f"<ComplaintImage #{self.id} for Complaint #{self.complaint_id}>"
