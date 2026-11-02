import os
import re
import docx

folder = r"C:\Users\Martin\skip-sj\evidencias\Fase 2\Evidencias Proyecto"

def replace_in_text(text):
    # Replacements dictionary
    replacements = [
        ("mercadopago, junaeb, otro", "card, bancoestado, webpay, mach, otro"),
        ("mercadopago", "webpay"),
        ("MercadoPago", "Transbank Webpay Plus"),
        ("Mercado Pago", "Transbank Webpay Plus"),
        ("MERCADOPAGO", "WEBPAY PLUS"),
        ("Transbank/MercadoPago", "Transbank Webpay Plus / Open Banking"),
        ("Almuerzos Junaeb", "Almuerzos y Menús Ejecutivos"),
        ("Menú Junaeb", "Menú Diario de Casino"),
        ("Tarjeta Junaeb BAES", "Tarjeta Bancaria Guardada (Débito/Crédito)"),
        ("Tarjeta Junaeb", "Tarjeta Bancaria Guardada"),
        ("Junaeb BAES", "Tarjetas Guardadas"),
        ("junaeb", "card"),
        ("Junaeb", "Webpay Plus"),
        ("BAES", "Transbank"),
        ("baes", "webpay")
    ]
    for old, new in replacements:
        text = text.replace(old, new)
    return text

def process_paragraph(p):
    full_text = p.text
    if any(k in full_text.lower() for k in ['mercadopago', 'mercado pago', 'junaeb', 'baes']):
        # If paragraph needs update, apply replacement
        new_text = replace_in_text(full_text)
        # Preserve first run format if available
        if p.runs:
            first_run = p.runs[0]
            bold = first_run.bold
            italic = first_run.italic
            font_name = first_run.font.name
            font_size = first_run.font.size
            color = first_run.font.color.rgb if first_run.font.color else None
            
            p.text = new_text
            if p.runs:
                p.runs[0].bold = bold
                p.runs[0].italic = italic
                if font_name: p.runs[0].font.name = font_name
                if font_size: p.runs[0].font.size = font_size
                if color: p.runs[0].font.color.rgb = color
        else:
            p.text = new_text

def process_table(t):
    for r in t.rows:
        for c in r.cells:
            for p in c.paragraphs:
                process_paragraph(p)

def update_file(filename):
    filepath = os.path.join(folder, filename)
    doc = docx.Document(filepath)
    
    # Process all paragraphs
    for p in doc.paragraphs:
        process_paragraph(p)
        
    # Process all tables
    for t in doc.tables:
        process_table(t)
        
    doc.save(filepath)
    print(f"Updated: {filename}")

if __name__ == '__main__':
    files = sorted(os.listdir(folder))
    for i in range(1, 17):
        matching = [f for f in files if f.startswith(f"{i}. ") or f.startswith(f"{i} ")]
        if matching:
            update_file(matching[0])

