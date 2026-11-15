import os
from app import create_app
from app.extensions import db
from app.models import User, Category

app = create_app()

@app.cli.command("init-db")
def init_db():
    """Initializes the database schema and seeds standard categories and default admin."""
    with app.app_context():
        db.create_all()
        print("Database tables created successfully.")

        # Seed standard categories if table is empty
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
            print("Default maintenance categories seeded.")

        # Seed default Admin account if not exists
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
            print("Default Admin created: admin@hostel.com / Admin@123")

        # Seed default Staff account for testing
        staff = User.query.filter_by(email="staff@hostel.com").first()
        if not staff:
            staff = User(
                name="Ramesh Kumar (Electrician/Plumber)",
                email="staff@hostel.com",
                role="staff",
                phone="9876543211",
                hostel_block="Maintenance Office",
                room_number="M-101"
            )
            staff.set_password("Staff@123")
            db.session.add(staff)
            db.session.commit()
            print("Default Staff created: staff@hostel.com / Staff@123")

        print("Database initialization complete.")

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "init-db":
        init_db()
    else:
        port = int(os.getenv("PORT", 5000))
        app.run(host="0.0.0.0", port=port, debug=True)
