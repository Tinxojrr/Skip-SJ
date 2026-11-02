import urllib.request
import json

url = 'https://xillpulfdzkntplmquez.supabase.co/auth/v1/token?grant_type=password'
headers = {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpbGxwdWxmZHprbnRwbG1xdWV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxMDgyNjMsImV4cCI6MjEwMDY4NDI2M30.eK0Nrk2l-tprkE26CTCH-ZKufjQzmvYR0K28uMIrGUg',
    'Content-Type': 'application/json'
}

data = json.dumps({'email': 'admin@skipsj.cl', 'password': '123456'}).encode('utf-8')
req = urllib.request.Request(url, data=data, headers=headers)
with urllib.request.urlopen(req) as resp:
    res = json.loads(resp.read().decode())
    token = res['access_token']
    uid = res['user']['id']
    
    u_req = urllib.request.Request(
        f"https://xillpulfdzkntplmquez.supabase.co/rest/v1/usuarios?select=*&id=eq.{uid}",
        headers={**headers, 'Authorization': f'Bearer {token}'}
    )
    with urllib.request.urlopen(u_req) as u_resp:
        print("admin@skipsj.cl profile:", json.loads(u_resp.read().decode()))
        
    p_req = urllib.request.Request(
        f"https://xillpulfdzkntplmquez.supabase.co/rest/v1/pedidos?select=id,codigo_retiro,estado,monto_total,locatario_id,created_at,locatarios(nombre)",
        headers={**headers, 'Authorization': f'Bearer {token}'}
    )
    with urllib.request.urlopen(p_req) as p_resp:
        p_data = json.loads(p_resp.read().decode())
        print(f"Total pedidos visible for admin@skipsj.cl: {len(p_data)}")
        for p in p_data:
            print(" ", p)
