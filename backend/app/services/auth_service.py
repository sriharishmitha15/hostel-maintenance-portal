from flask_jwt_extended import create_access_token
from app.extensions import db
from app.models.user import User

def register_student(name, email, password, phone, hostel_block, room_number):
    """Register a new student."""
    email_clean = email.strip().lower()
    
    if User.query.filter_by(email=email_clean).first():
        raise ValueError("An account with this email already exists.")

    student = User(
        name=name.strip(),
        email=email_clean,
        role="student",
        phone=phone.strip() if phone else None,
        hostel_block=hostel_block.strip() if hostel_block else None,
        room_number=room_number.strip() if room_number else None,
    )
    student.set_password(password)

    db.session.add(student)
    db.session.commit()

    return student

def authenticate_user(email, password):
    """Authenticate user and return user object with JWT access token."""
    email_clean = email.strip().lower()
    user = User.query.filter_by(email=email_clean).first()

    if not user or not user.check_password(password):
        raise ValueError("Invalid email or password.")

    if not user.is_active:
        raise ValueError("Your account has been deactivated. Please contact the administrator.")

    # Create JWT access token with user claims
    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={
            "role": user.role,
            "email": user.email,
            "name": user.name
        }
    )

    return user, access_token
