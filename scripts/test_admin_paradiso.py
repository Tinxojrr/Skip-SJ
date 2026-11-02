import urllib.request
import json

url = 'https://xillpulfdzkntplmquez.supabase.co/auth/v1/token?grant_type=password'
headers = {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpbGxwdWxmZHprbnRwbG1xdWV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxMDgyNjMsImV4cCI6MjEwMDY4NDI2M30.eK0Nrk2l-tprkE26CTCH-ZKufjQzmvYR0K28uMIrGUg',
    'Content-Type': 'application/json'
}

# Test login as admin.paradiso@duocuc.cl
data = json.dumps({'email': 'admin.paradiso@duocuc.cl', 'password': 'Duoc2026!'}).encode('utf-8')
req = urllib.request.Request(url, data=data, headers=headers)
try:
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode())
        token = res['access_token']
        uid = res['user']['id']
        print(f"Logged in as admin.paradiso@duocuc.cl! UID: {uid}")
        
        # Check pedidos
        p_req = urllib.request.Request(
            'https://xillpulfdzkntplmquez.supabase.co/rest/v1/pedidos?select=*',
            headers={**headers, 'Authorization': f'Bearer {token}'}
        )
        with urllib.request.urlopen(p_req) as p_resp:
            p_data = json.loads(p_resp.read().decode())
            print(f"Pedidos visible for admin.paradiso@duocuc.cl: {len(p_data)}")
            for p in p_data:
                print(" ", p['id'][:8], p['codigo_retiro'], p['monto_total'], p['locatario_id'])
except Exception as e:
    print("Error:", e)
