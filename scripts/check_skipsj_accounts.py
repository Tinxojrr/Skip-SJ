import urllib.request
import json

url = 'https://xillpulfdzkntplmquez.supabase.co/auth/v1/token?grant_type=password'
headers = {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpbGxwdWxmZHprbnRwbG1xdWV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxMDgyNjMsImV4cCI6MjEwMDY4NDI2M30.eK0Nrk2l-tprkE26CTCH-ZKufjQzmvYR0K28uMIrGUg',
    'Content-Type': 'application/json'
}

accounts = [
    'castano@skipsj.cl',
    'achoclonado@skipsj.cl',
    'comedor@skipsj.cl',
    'paradiso@skipsj.cl',
    'local1@skipsj.cl',
    'admin@skipsj.cl'
]

for acc in accounts:
    for pwd in ['123456', 'Duoc2026!']:
        data = json.dumps({'email': acc, 'password': pwd}).encode('utf-8')
        req = urllib.request.Request(url, data=data, headers=headers)
        try:
            with urllib.request.urlopen(req) as resp:
                res = json.loads(resp.read().decode())
                print(f"Account: {acc} | ID: {res['user']['id']} | pwd: {pwd}")
                break
        except Exception:
            pass
