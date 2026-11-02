import os
import docx
from docx.shared import Pt, RGBColor

folder = r"C:\Users\Martin\skip-sj\evidencias\Fase 2\Evidencias Proyecto"

def enrich_doc_15():
    # Modelo de base de datos
    fn = [f for f in os.listdir(folder) if f.startswith("15. ")][0]
    path = os.path.join(folder, fn)
    doc = docx.Document(path)
    
    # Check if notas is already present under pedido_items
    for pi, p in enumerate(doc.paragraphs):
        if "Entidad: pedido_items" in p.text:
            # Look ahead for subtotal and add notas
            for target_i in range(pi, pi + 15):
                if "subtotal" in doc.paragraphs[target_i].text and "notas" not in doc.paragraphs[target_i + 1].text:
                    new_p = doc.paragraphs[target_i].insert_paragraph_before()
                    # Actually insert right after subtotal
                    p_notas = doc.paragraphs[target_i]
                    p_notas.text = p_notas.text + "\nnotas  TEXT  Instrucciones de preparacion personalizadas para cocina"
                    print("Added 'notas' to pedido_items in Doc 15")
                    break
            break
    doc.save(path)

def enrich_doc_8():
    # Requisitos Funcionales
    fn = [f for f in os.listdir(folder) if f.startswith("8. ")][0]
    path = os.path.join(folder, fn)
    doc = docx.Document(path)
    
    # Table 1 is RF-ALU
    t1 = doc.tables[1]
    existing_ids = [r.cells[0].text.strip() for r in t1.rows]
    if "RF-ALU-11" not in existing_ids:
        r11 = t1.add_row()
        r11.cells[0].text = "RF-ALU-11"
        r11.cells[1].text = "Almacenamiento Seguro de Tarjetas Bancarias: El sistema debe permitir vincular y persistir tarjetas de debito o credito en el dispositivo de forma encriptada localmente (expo-secure-store con AES-256), omitiendo el reingreso de datos en cada compra y mostrandolas con mascara en Perfil y Carrito."
    if "RF-ALU-12" not in existing_ids:
        r12 = t1.add_row()
        r12.cells[0].text = "RF-ALU-12"
        r12.cells[1].text = "Modo Oscuro (Obsidian Theme): La aplicacion movil debe permitir alternar dinamicamente entre Modo Claro y Modo Oscuro nocturno (#09090B), garantizando contraste visual optimo WCAG AA y ahorro de bateria en pantallas OLED."

    # Table 2 is RF-LOC
    t2 = doc.tables[2]
    existing_ids_loc = [r.cells[0].text.strip() for r in t2.rows]
    if "RF-LOC-08" not in existing_ids_loc:
        r_loc = t2.add_row()
        r_loc.cells[0].text = "RF-LOC-08"
        r_loc.cells[1].text = "Alerta Auditiva de Nueva Comanda: El Dashboard de cocina debe emitir una senal sonora de campanilla (chime bell via Web Audio API) en cuanto ingresa un nuevo pedido pagado a la columna 'Pendiente'."

    # Table 3 is RF-ADM
    t3 = doc.tables[3]
    existing_ids_adm = [r.cells[0].text.strip() for r in t3.rows]
    if "RF-ADM-05" not in existing_ids_adm:
        r_adm = t3.add_row()
        r_adm.cells[0].text = "RF-ADM-05"
        r_adm.cells[1].text = "Copiloto Asesor Gastronomico con IA (Gemini 3 Flash): El sistema debe integrar el SDK @google/genai con modelo gemini-3-flash-preview para evaluar metricas de venta, detectar cuellos de botella en meson y recomendar promociones de upselling en tarjetas Bento."

    doc.save(path)
    print("Enriched Doc 8 (Requisitos Funcionales)")

def enrich_doc_9():
    # Requisitos No Funcionales
    fn = [f for f in os.listdir(folder) if f.startswith("9. ")][0]
    path = os.path.join(folder, fn)
    doc = docx.Document(path)
    
    # Table 1: RNF-SEG-04
    for r in doc.tables[1].rows:
        if "RNF-SEG-04" in r.cells[0].text:
            r.cells[1].text = "Proteccion de Credenciales de Pago: El sistema almacena tarjetas bancarias del alumno utilizando encriptacion local por hardware en el dispositivo (expo-secure-store con AES-256) sin transmitir CVV ni numeros planos; las transacciones se autorizan delegando a Transbank Webpay Plus Developer Sandbox / Open Banking sin almacenar datos financieros sensibles en backend."
            
    # Table 7: RNF-COM-03
    for r in doc.tables[7].rows:
        if "RNF-COM-03" in r.cells[0].text:
            r.cells[1].text = "Compatibilidad con Entorno Sandbox de Pagos: El sistema debe integrarse con el ambiente oficial Transbank Webpay Plus Developer Sandbox (Codigo de Comercio 597055555532) y Open Banking, admitiendo tarjetas de prueba certificadas (VISA 4000 0000 0000 0000, Mastercard, CuentaRUT BancoEstado y MACH) para el entorno academico."
            
    doc.save(path)
    print("Enriched Doc 9 (Requisitos No Funcionales)")

def enrich_doc_14():
    # Arquitectura Software
    fn = [f for f in os.listdir(folder) if f.startswith("14. ")][0]
    path = os.path.join(folder, fn)
    doc = docx.Document(path)
    
    # Add a paragraph at the end summarizing modern features if not present
    full_text = "\n".join([p.text for p in doc.paragraphs])
    if "Gemini" not in full_text:
        doc.add_paragraph("5. Inteligencia Artificial y Componentes Auxiliares")
        p = doc.add_paragraph(
            "El ecosistema integra Google Gemini 3 Flash (@google/genai) como copiloto analitico para los locatarios de la sede, "
            "procesando en tiempo real los patrones de flujo en cocina para generar diagnosticos en tarjetas Bento. "
            "Asimismo, la aplicacion movil incorpora persistencia encriptada con expo-secure-store para la gestion de tarjetas bancarias "
            "y reproduccion sonora mediante Web Audio API en el terminal web de despacho."
        )
        print("Enriched Doc 14 (Arquitectura Software)")
        doc.save(path)

if __name__ == '__main__':
    enrich_doc_15()
    enrich_doc_8()
    enrich_doc_9()
    enrich_doc_14()
