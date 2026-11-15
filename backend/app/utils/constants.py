"""
Application-wide constants and enumerations.
Matches the MySQL database schema enums strictly.
"""

class UserRole:
    STUDENT = "student"
    STAFF = "staff"
    ADMIN = "admin"

    ALL = [STUDENT, STAFF, ADMIN]

class ComplaintStatus:
    PENDING = "Pending"
    ASSIGNED = "Assigned"
    IN_PROGRESS = "In_Progress"
    RESOLVED = "Resolved"
    REJECTED = "Rejected"

    ALL = [PENDING, ASSIGNED, IN_PROGRESS, RESOLVED, REJECTED]

class ComplaintPriority:
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    EMERGENCY = "Emergency"

    ALL = [LOW, MEDIUM, HIGH, EMERGENCY]

class ImageType:
    SUBMISSION = "submission"
    RESOLUTION = "resolution"

    ALL = [SUBMISSION, RESOLUTION]
