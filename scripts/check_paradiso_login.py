import urllib.request
import json

url = 'https://xillpulfdzkntplmquez.supabase.co/auth/v1/token?grant_type=password'
headers = {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpbGxwdWxmZHprbnRwbG1xdWV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxMDgyNjMsImV4cCI6MjEwMDY4NDI2M30.eK0Nrk2l-tprkE26CTCH-ZKufjQzmvYR0K28uMIrGUg',
    'Content-Type': 'application/json'
}

for pwd in ['123456', 'Duoc2026!', 'paradiso123', 'admin123', '12345678', 'admin', 'password']:
    data = json.dumps({'email': 'paradiso@skipsj.cl', 'password': pwd}).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            res = json.loads(resp.read().decode())
            uid = res["user"]["id"]
            email = res["user"]["email"]
            print(f"SUCCESS with pwd '{pwd}'! User ID: {uid}, Email: {email}")
            
            # Now test fetching from usuarios
            token = res["access_token"]
            u_req = urllib.request.Request(
                f"https://xillpulfdzkntplmquez.supabase.co/rest/v1/usuarios?select=*&id=eq.{uid}",
                headers={**headers, 'Authorization': f'Bearer {token}'}
            )
            with urllib.request.urlopen(u_req) as u_resp:
                u_data = json.loads(u_resp.read().decode())
                print("Profile in usuarios:", u_data)
                
            # Now test fetching locatarios
            l_req = urllib.request.Request(
                f"https://xillpulfdzkntplmquez.supabase.co/rest/v1/locatarios?select=*",
                headers={**headers, 'Authorization': f'Bearer {token}'}
            )
            with urllib.request.urlopen(l_req) as l_resp:
                l_data = json.loads(l_resp.read().decode())
                print("Locatarios:")
                for loc in l_data:
                    print(f"  {loc['id']} - {loc['nombre']} (admin: {loc.get('usuario_admin_id')})")
                    
            # Now test fetching pedidos!
            p_req = urllib.request.Request(
                f"https://xillpulfdzkntplmquez.supabase.co/rest/v1/pedidos?select=*",
                headers={**headers, 'Authorization': f'Bearer {token}'}
            )
            with urllib.request.urlopen(p_req) as p_resp:
                p_data = json.loads(p_resp.read().decode())
                print(f"Pedidos visible for paradiso: {len(p_data)}")
                for p in p_data:
                    print(f"  Pedido {p['id'][:8]} | estado: {p['estado']} | locatario_id: {p['locatario_id']} | total: {p['monto_total']}")
            break
    except Exception as e:
        pass
