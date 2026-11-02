import urllib.request
import json

url = 'https://xillpulfdzkntplmquez.supabase.co/auth/v1/token?grant_type=password'
headers = {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpbGxwdWxmZHprbnRwbG1xdWV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxMDgyNjMsImV4cCI6MjEwMDY4NDI2M30.eK0Nrk2l-tprkE26CTCH-ZKufjQzmvYR0K28uMIrGUg',
    'Content-Type': 'application/json'
}

# Login as student
for email in ['mar.aburtom@duocuc.cl', 'martin.aburto@duocuc.cl', 'aburtomartin13@gmail.com']:
    for pwd in ['123456', 'Duoc2026!', 'martin123', 'admin123']:
        data = json.dumps({'email': email, 'password': pwd}).encode('utf-8')
        req = urllib.request.Request(url, data=data, headers=headers)
        try:
            with urllib.request.urlopen(req) as resp:
                res = json.loads(resp.read().decode())
                token = res['access_token']
                uid = res['user']['id']
                print(f"Logged in as {email}! UID: {uid}")
                
                # Fetch student orders
                p_req = urllib.request.Request(
                    'https://xillpulfdzkntplmquez.supabase.co/rest/v1/pedidos?select=id,codigo_retiro,estado,monto_total,locatario_id,created_at,locatarios(nombre)&order=created_at.desc',
                    headers={**headers, 'Authorization': f'Bearer {token}'}
                )
                with urllib.request.urlopen(p_req) as p_resp:
                    p_data = json.loads(p_resp.read().decode())
                    print(f"Orders count for {email}: {len(p_data)}")
                    for p in p_data:
                        loc = p.get('locatarios', {})
                        loc_name = loc.get('nombre') if loc else 'Unknown'
                        print(f"  [{p.get('codigo_retiro')}] Locatario: {loc_name} ({p.get('locatario_id')}) | Total: {p.get('monto_total')} | Fecha: {p.get('created_at')}")
                break
        except Exception as e:
            pass
