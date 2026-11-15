import json, sys, urllib.request
url = 'http://127.0.0.1:5000/api/auth/login'
payload = {'email':'admin@hostel.com','password':'Admin@123'}
data = json.dumps(payload).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'Content-Type':'application/json'}, method='POST')
try:
    with urllib.request.urlopen(req) as resp:
        body = resp.read().decode('utf-8')
        print('Status', resp.getcode())
        print('Response', body)
except urllib.error.HTTPError as e:
    print('HTTPError', e.code)
    print(e.read().decode())
except Exception as e:
    print('Error', e)
