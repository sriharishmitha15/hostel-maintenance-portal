import json
from app import create_app

def test_auth():
    app = create_app()
    client = app.test_client()

    print("\n--- 1. Testing Health Endpoint ---")
    r = client.get("/api/health")
    print(f"Health check status: {r.status_code}, data: {r.get_json()}")
    assert r.status_code == 200

    print("\n--- 2. Testing Admin Login ---")
    r = client.post("/api/auth/login", json={
        "email": "admin@hostel.com",
        "password": "Admin@123"
    })
    print(f"Admin login status: {r.status_code}")
    data = r.get_json()
    print(f"Response: success={data.get('success')}, role={data.get('data', {}).get('user', {}).get('role')}")
    assert r.status_code == 200
    assert data["success"] is True
    assert data["data"]["user"]["role"] == "admin"
    admin_token = data["data"]["token"]

    print("\n--- 3. Testing Staff Login ---")
    r = client.post("/api/auth/login", json={
        "email": "staff@hostel.com",
        "password": "Staff@123"
    })
    print(f"Staff login status: {r.status_code}")
    data = r.get_json()
    print(f"Response: success={data.get('success')}, role={data.get('data', {}).get('user', {}).get('role')}")
    assert r.status_code == 200
    assert data["data"]["user"]["role"] == "staff"

    print("\n--- 4. Testing Demo Student Login ---")
    r = client.post("/api/auth/login", json={
        "email": "student@hostel.com",
        "password": "Student@123"
    })
    print(f"Student login status: {r.status_code}")
    data = r.get_json()
    print(f"Response: success={data.get('success')}, role={data.get('data', {}).get('user', {}).get('role')}")
    assert r.status_code == 200
    assert data["data"]["user"]["role"] == "student"

    print("\n--- 5. Testing Student Self-Registration ---")
    test_email = "vikram.test@student.com"
    r = client.post("/api/auth/register", json={
        "name": "Vikram Patel",
        "email": test_email,
        "password": "Password@123",
        "phone": "9811223344",
        "hostel_block": "Block C",
        "room_number": "C-302"
    })
    print(f"Register status: {r.status_code}, msg: {r.get_json().get('message')}")
    assert r.status_code in [201, 409] # 201 created or 409 if already exists

    print("\n--- 6. Testing Registered Student Login ---")
    r = client.post("/api/auth/login", json={
        "email": test_email,
        "password": "Password@123"
    })
    print(f"Login status: {r.status_code}")
    data = r.get_json()
    print(f"Response: success={data.get('success')}, role={data.get('data', {}).get('user', {}).get('role')}")
    assert r.status_code == 200

    print("\n--- 7. Testing Invalid Password (Expect 401, NOT 500) ---")
    r = client.post("/api/auth/login", json={
        "email": "admin@hostel.com",
        "password": "WrongPassword!"
    })
    print(f"Invalid login status: {r.status_code}, data: {r.get_json()}")
    assert r.status_code == 401
    assert r.get_json()["success"] is False

    print("\n--- 8. Testing Protected Endpoint with Token (/api/auth/me) ---")
    r = client.get("/api/auth/me", headers={"Authorization": f"Bearer {admin_token}"})
    print(f"/api/auth/me status: {r.status_code}, user: {r.get_json().get('data', {}).get('user', {}).get('name')}")
    assert r.status_code == 200

    print("\n>>> ALL AUTHENTICATION TESTS PASSED PERFECTLY! <<<")

if __name__ == "__main__":
    test_auth()
