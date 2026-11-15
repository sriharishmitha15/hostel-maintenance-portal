import unittest
import os
import json

os.environ["USE_SQLITE"] = "true"
os.environ["DATABASE_URL"] = "sqlite:///:memory:"

from app import create_app
from app.extensions import db
from app.models import Category, User, Complaint

class HostelPortalAPITestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.app.config["TESTING"] = True
        self.client = self.app.test_client()
        self.app_context = self.app.app_context()
        self.app_context.push()
        db.create_all()

        # Seed categories if not already existing
        if not Category.query.filter_by(name="Plumbing").first():
            db.session.add(Category(name="Plumbing", description="Water leaks and taps"))
        if not Category.query.filter_by(name="Electrical").first():
            db.session.add(Category(name="Electrical", description="Lights and switches"))

        # Seed Admin
        if not User.query.filter_by(email="admin@hostel.com").first():
            admin = User(name="Warden", email="admin@hostel.com", role="admin", hostel_block="A", room_number="1")
            admin.set_password("Admin@123")
            db.session.add(admin)

        # Seed Staff
        if not User.query.filter_by(email="staff@hostel.com").first():
            staff = User(name="Electrician", email="staff@hostel.com", role="staff", hostel_block="M", room_number="2")
            staff.set_password("Staff@123")
            db.session.add(staff)

        db.session.commit()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    def test_health_check(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertTrue(data["success"])

    def test_student_registration_and_login(self):
        # 1. Register student
        reg_res = self.client.post("/api/auth/register", json={
            "name": "Arun Kumar",
            "email": "arun@student.com",
            "password": "Password@123",
            "phone": "9876543212",
            "hostel_block": "Block B",
            "room_number": "B-204"
        })
        self.assertEqual(reg_res.status_code, 201)

        # 2. Login student
        login_res = self.client.post("/api/auth/login", json={
            "email": "arun@student.com",
            "password": "Password@123"
        })
        self.assertEqual(login_res.status_code, 200)
        login_data = json.loads(login_res.data)
        token = login_data["data"]["token"]
        self.assertIsNotNone(token)

        # 3. Submit complaint
        complaint_res = self.client.post(
            "/api/complaints",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "title": "Ceiling fan making squeaking noise",
                "description": "Fan in B-204 regulator is fine but blades wobble loudly.",
                "category_id": 2,
                "priority": "Medium",
                "hostel_block": "Block B",
                "room_number": "B-204"
            }
        )
        self.assertEqual(complaint_res.status_code, 201)
        c_data = json.loads(complaint_res.data)["data"]["complaint"]
        self.assertEqual(c_data["status"], "Pending")
        complaint_id = c_data["id"]

        # 4. Admin login & assign to staff
        admin_login = self.client.post("/api/auth/login", json={
            "email": "admin@hostel.com",
            "password": "Admin@123"
        })
        admin_token = json.loads(admin_login.data)["data"]["token"]

        assign_res = self.client.put(
            f"/api/admin/complaints/{complaint_id}/assign",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"staff_id": 2, "priority": "High", "remarks": "Fix before tonight."}
        )
        self.assertEqual(assign_res.status_code, 200)
        assigned_c = json.loads(assign_res.data)["data"]["complaint"]
        self.assertEqual(assigned_c["status"], "Assigned")
        self.assertEqual(assigned_c["assigned_staff_id"], 2)

        # 5. Staff login & update to In_Progress then Resolved
        staff_login = self.client.post("/api/auth/login", json={
            "email": "staff@hostel.com",
            "password": "Staff@123"
        })
        staff_token = json.loads(staff_login.data)["data"]["token"]

        progress_res = self.client.put(
            f"/api/staff/tasks/{complaint_id}/status",
            headers={"Authorization": f"Bearer {staff_token}"},
            json={"status": "In_Progress", "remarks": "Replaced bearing and tightened clamp."}
        )
        self.assertEqual(progress_res.status_code, 200)

        resolved_res = self.client.put(
            f"/api/staff/tasks/{complaint_id}/status",
            headers={"Authorization": f"Bearer {staff_token}"},
            json={"status": "Resolved", "remarks": "Fan working smoothly without any sound."}
        )
        self.assertEqual(resolved_res.status_code, 200)
        res_data = json.loads(resolved_res.data)["data"]["complaint"]
        self.assertEqual(res_data["status"], "Resolved")
        self.assertIsNotNone(res_data["resolved_at"])

        # 6. Admin Analytics check
        analytics_res = self.client.get(
            "/api/analytics/dashboard",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        self.assertEqual(analytics_res.status_code, 200)
        a_data = json.loads(analytics_res.data)["data"]["summary"]
        self.assertEqual(a_data["total_complaints"], 1)
        self.assertEqual(a_data["resolved"], 1)
        self.assertEqual(a_data["resolution_rate"], 100.0)

if __name__ == "__main__":
    unittest.main()
