import os
from flask import Flask, send_from_directory, jsonify
from config import Config
from app.extensions import db, jwt, cors
from app.utils.response_helpers import error_response, success_response

def init_db_defaults(app):
    """Ensures database tables exist and default categories/accounts are seeded."""
    with app.app_context():
        try:
            db.create_all()
            from app.models import Category, User

            # Seed default categories if none
            if Category.query.count() == 0:
                default_categories = [
                    Category(name="Plumbing", description="Water leaks, tap repair, washroom drainage, shower issues"),
                    Category(name="Electrical", description="Lights, fans, switchboards, wiring, power socket failure"),
                    Category(name="Carpentry", description="Door locks, cupboard hinges, bed frames, study tables"),
                    Category(name="Civil & Masonry", description="Wall cracks, dampness, window glass, tile repairs"),
                    Category(name="Cleaning & Hygiene", description="Room cleaning, pest control, waste disposal"),
                    Category(name="Network & Internet", description="LAN port damage, Wi-Fi router connectivity issues")
                ]
                db.session.add_all(default_categories)
                db.session.commit()

            # Seed Admin
            admin = User.query.filter_by(email="admin@hostel.com").first()
            if not admin:
                admin = User(
                    name="Chief Warden",
                    email="admin@hostel.com",
                    role="admin",
                    phone="9876543210",
                    hostel_block="Admin Block",
                    room_number="W-01"
                )
                admin.set_password("Admin@123")
                db.session.add(admin)
                db.session.commit()

            # Seed Staff
            staff = User.query.filter_by(email="staff@hostel.com").first()
            if not staff:
                staff = User(
                    name="Ramesh Kumar (Electrician)",
                    email="staff@hostel.com",
                    role="staff",
                    phone="9876543211",
                    hostel_block="Maintenance Office",
                    room_number="M-101"
                )
                staff.set_password("Staff@123")
                db.session.add(staff)
                db.session.commit()

            # Seed Demo Student
            student = User.query.filter_by(email="student@hostel.com").first()
            if not student:
                student = User(
                    name="Rahul Sharma",
                    email="student@hostel.com",
                    role="student",
                    phone="9876543212",
                    hostel_block="Block A",
                    room_number="A-204"
                )
                student.set_password("Student@123")
                db.session.add(student)
                db.session.commit()

            print(f"[DB] Initialized successfully. Driver: {app.config.get('DB_DRIVER', 'default')}")
        except Exception as e:
            print(f"[Notice] DB Init Check: {e}")

def create_app(config_class=Config):
    """Application Factory pattern."""
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Ensure upload folder exists
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(
        app,
        resources={
            r"/api/*": {
                "origins": "*",
                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                "allow_headers": ["Content-Type", "Authorization"]
            },
            r"/uploads/*": {"origins": "*"}
        },
        supports_credentials=True
    )

    # Static file serving for uploaded photos
    @app.route("/uploads/<path:filename>")
    def serve_upload(filename):
        return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

    # Health check route
    @app.route("/api/health", methods=["GET"])
    def health_check():
        return success_response(
            data={
                "status": "healthy",
                "service": "Hostel Maintenance Request Portal API",
                "db_driver": app.config.get("DB_DRIVER", "default")
            },
            message="Server is running"
        )

    # JWT Error handlers
    @jwt.unauthorized_loader
    def unauthorized_callback(callback):
        return error_response(
            message="Missing or invalid Authorization header",
            errors=["Authorization token is required"],
            status_code=401
        )

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return error_response(
            message="Session expired. Please log in again.",
            errors=["Token has expired"],
            status_code=401
        )

    @jwt.invalid_token_loader
    def invalid_token_callback(callback):
        return error_response(
            message="Invalid token",
            errors=["Token verification failed"],
            status_code=401
        )

    # Register API Blueprints
    from app.routes.auth_routes import auth_bp
    from app.routes.complaint_routes import complaint_bp
    from app.routes.staff_routes import staff_bp
    from app.routes.admin_routes import admin_bp
    from app.routes.analytics_routes import analytics_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(complaint_bp, url_prefix="/api/complaints")
    app.register_blueprint(staff_bp, url_prefix="/api/staff")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(analytics_bp, url_prefix="/api/analytics")

    # Run auto-initialization of DB tables and seed data
    init_db_defaults(app)

    return app
