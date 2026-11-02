import urllib.request
import json

url = "https://xillpulfdzkntplmquez.supabase.co/rest/v1/usuarios?select=id,email,rol,p_nombre,apellido_p"
headers = {
    "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpbGxwdWxmZHprbnRwbG1xdWV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxMDgyNjMsImV4cCI6MjEwMDY4NDI2M30.eK0Nrk2l-tprkE26CTCH-ZKufjQzmvYR0K28uMIrGUg"
}

req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
        print("Total usuarios:", len(data))
        for u in data:
            print(f"- {u['id']} | {u.get('email')} | Rol: {u.get('rol')} | Nombre: {u.get('p_nombre')} {u.get('apellido_p')}")
except Exception as e:
    print("Error:", e)

