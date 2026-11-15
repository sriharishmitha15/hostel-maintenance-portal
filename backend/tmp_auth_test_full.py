import threading, time, json, urllib.request, urllib.error, sys
from app import create_app

def start_flask():
    app = create_app()
    # run without reloader to avoid double start
    app.run(host='127.0.0.1', port=5000, debug=False, use_reloader=False)

def request(url, payload):
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type':'application/json'}, method='POST')
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            return resp.getcode(), resp.read().decode()
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()
    except Exception as e:
        return None, str(e)

def test_logins():
    users = [
        ('admin@hostel.com', 'Admin@123'),
        ('staff@hostel.com', 'Staff@123'),
        ('student@hostel.com', 'Student@123')
    ]
    for email, pwd in users:
        status, body = request('http://127.0.0.1:5000/api/auth/login', {'email': email, 'password': pwd})
        print(f'LOGIN {email}: status={status}')
        print(body)

def test_registration_and_login():
    new_user = {
        'name': 'Test User',
        'email': 'newuser@example.com',
        'password': 'TestPass123',
        'phone': '9876543219',
        'hostel_block': 'Block B',
        'room_number': 'B-101'
    }
    status, body = request('http://127.0.0.1:5000/api/auth/register', new_user)
    print('REGISTER newuser: status=', status)
    print(body)
    if status == 201:
        # try login with new credentials
        login_status, login_body = request('http://127.0.0.1:5000/api/auth/login', {'email': new_user['email'], 'password': new_user['password']})
        print('LOGIN newuser: status=', login_status)
        print(login_body)

if __name__ == '__main__':
    # start Flask in a separate daemon thread so the script can continue
    thread = threading.Thread(target=start_flask, daemon=True)
    thread.start()
    # give the server a moment to start
    time.sleep(3)
    test_logins()
    test_registration_and_login()
    # keep main thread alive briefly to ensure any async logs are printed
    time.sleep(2)
