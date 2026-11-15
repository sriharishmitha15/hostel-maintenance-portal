import json, urllib.request, urllib.error, sys

def test_login(email, pwd):
    url = 'http://127.0.0.1:5000/api/auth/login'
    payload = json.dumps({'email': email, 'password': pwd}).encode('utf-8')
    req = urllib.request.Request(url, data=payload, headers={'Content-Type':'application/json'}, method='POST')
    try:
        with urllib.request.urlopen(req) as resp:
            print('Status', resp.getcode())
            print('Body', resp.read().decode())
    except urllib.error.HTTPError as e:
        print('HTTPError', e.code)
        print(e.read().decode())
    except Exception as e:
        print('Error', e)

if __name__ == '__main__':
    test_login('admin@hostel.com', 'Admin@123')
    test_login('staff@hostel.com', 'Staff@123')
    test_login('student@hostel.com', 'Student@123')
