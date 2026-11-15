import requests, json, sys
url='http://127.0.0.1:5000/api/auth/login'
payload={'email':'admin@hostel.com','password':'Admin@123'}
try:
    r=requests.post(url,json=payload)
    print('Status', r.status_code)
    print('Response', r.text)
except Exception as e:
    print('Error', e)
