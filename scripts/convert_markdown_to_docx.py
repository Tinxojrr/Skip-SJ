import os
import re
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

DOCS = [
    "01_PLAN_DE_PRUEBAS",
    "02_CASOS_DE_PRUEBA",
    "03_REGISTRO_DE_DEFECTOS_POR_CICLOS",
    "04_MANUAL_DE_USUARIO_FINAL",
    "05_MANUAL_DE_IMPLEMENTACION",
    "06_CHECKLIST_TERMINO_PROYECTO",
]

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def add_styled_paragraph(doc, text, style='Normal', space_after=6, space_before=0, bold=False, italic=False, color=None):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.space_before = Pt(space_before)
    p.paragraph_format.line_spacing = 1.15
    
    # Process bold/italic runs in text
    parts = re.split(r'(\*\*.*?\*\*|\*.*?\*|`.*?`)', text)
    for part in parts:
        if not part:
            continue
        if part.startswith('**') and part.endswith('**'):
            run = p.add_run(part[2:-2])
            run.bold = True
        elif part.startswith('*') and part.endswith('*'):
            run = p.add_run(part[1:-1])
            run.italic = True
        elif part.startswith('`') and part.endswith('`'):
            run = p.add_run(part[1:-1])
            run.font.name = 'Consolas'
            run.font.size = Pt(9.5)
            run.font.color.rgb = RGBColor(199, 37, 78)
        else:
            run = p.add_run(part)
            if bold: run.bold = True
            if italic: run.italic = True
            
        if color:
            run.font.color.rgb = color
    return p

def convert_md_to_docx(base_path, doc_name):
    md_path = os.path.join(base_path, f"{doc_name}.md")
    docx_path = os.path.join(base_path, f"{doc_name}.docx")
    
    if not os.path.exists(md_path):
        print(f"File not found: {md_path}")
        return

    with open(md_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    doc = Document()
    
    # Page Setup (A4, 1 inch margins)
    section = doc.sections[0]
    section.page_width = Inches(8.5)
    section.page_height = Inches(11.0)
    section.top_margin = Inches(1.0)
    section.bottom_margin = Inches(1.0)
    section.left_margin = Inches(1.0)
    section.right_margin = Inches(1.0)

    # Base Styles
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Calibri'
    normal_style.font.size = Pt(11)
    normal_style.font.color.rgb = RGBColor(38, 38, 38)

    in_code_block = False
    code_lines = []
    in_table = False
    table_lines = []

    def flush_table(t_lines):
        if not t_lines: return
        rows_data = []
        for l in t_lines:
            cells = [c.strip() for c in l.strip().strip('|').split('|')]
            if all(set(c) <= set('-: ') for c in cells):
                continue # Header separator
            rows_data.append(cells)
        if not rows_data: return

        cols_count = max(len(r) for r in rows_data)
        table = doc.add_table(rows=len(rows_data), cols=cols_count)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        table.autofit = True

        for i, row in enumerate(rows_data):
            is_header = (i == 0)
            for j, cell_text in enumerate(row):
                if j >= cols_count: continue
                cell = table.cell(i, j)
                set_cell_margins(cell, top=120, bottom=120, left=160, right=160)
                if is_header:
                    set_cell_background(cell, "002B49") # Duoc Navy Blue
                else:
                    set_cell_background(cell, "F8FAFC" if i % 2 == 1 else "FFFFFF")

                cell.text = ""
                cp = cell.paragraphs[0]
                cp.paragraph_format.space_before = Pt(0)
                cp.paragraph_format.space_after = Pt(0)
                
                parts = re.split(r'(\*\*.*?\*\*|\*.*?\*|`.*?`)', cell_text)
                for part in parts:
                    if not part: continue
                    if part.startswith('**') and part.endswith('**'):
                        r = cp.add_run(part[2:-2])
                        r.bold = True
                    elif part.startswith('`') and part.endswith('`'):
                        r = cp.add_run(part[1:-1])
                        r.font.name = 'Consolas'
                        r.font.size = Pt(9)
                    else:
                        r = cp.add_run(part)
                    
                    if is_header:
                        r.font.color.rgb = RGBColor(255, 255, 255)
                        r.bold = True
                    else:
                        r.font.color.rgb = RGBColor(30, 41, 59)
                    r.font.size = Pt(9.5)

        # Spacing after table
        sp = doc.add_paragraph()
        sp.paragraph_format.space_after = Pt(6)

    for line in lines:
        raw = line.rstrip('\r\n')

        # Code block
        if raw.startswith('```'):
            if in_code_block:
                in_code_block = False
                p = doc.add_paragraph()
                p.paragraph_format.space_before = Pt(4)
                p.paragraph_format.space_after = Pt(10)
                p.paragraph_format.left_indent = Inches(0.2)
                run = p.add_run("\n".join(code_lines))
                run.font.name = 'Consolas'
                run.font.size = Pt(9)
                run.font.color.rgb = RGBColor(51, 65, 85)
                code_lines = []
            else:
                in_code_block = True
                code_lines = []
            continue

        if in_code_block:
            code_lines.append(raw)
            continue

        # Tables
        if raw.strip().startswith('|') and raw.strip().endswith('|'):
            in_table = True
            table_lines.append(raw)
            continue
        elif in_table:
            flush_table(table_lines)
            in_table = False
            table_lines = []

        # Empty lines
        if not raw.strip():
            continue

        # Headings
        if raw.startswith('# '):
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(16)
            p.paragraph_format.space_after = Pt(6)
            run = p.add_run(raw[2:])
            run.font.name = 'Calibri'
            run.font.size = Pt(22)
            run.bold = True
            run.font.color.rgb = RGBColor(0, 43, 73) # Duoc Navy
        elif raw.startswith('## '):
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(14)
            p.paragraph_format.space_after = Pt(4)
            run = p.add_run(raw[3:])
            run.font.name = 'Calibri'
            run.font.size = Pt(16)
            run.bold = True
            run.font.color.rgb = RGBColor(242, 169, 0) # Duoc Gold
        elif raw.startswith('### '):
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(10)
            p.paragraph_format.space_after = Pt(3)
            run = p.add_run(raw[4:])
            run.font.name = 'Calibri'
            run.font.size = Pt(13)
            run.bold = True
            run.font.color.rgb = RGBColor(15, 23, 42)
        elif raw.startswith('---'):
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(6)
            p.paragraph_format.space_after = Pt(6)
            run = p.add_run("―" * 50)
            run.font.color.rgb = RGBColor(226, 232, 240)
        elif raw.startswith('!['):
            # Image markdown ![Alt](./screenshots/image.png)
            match = re.search(r'!\[(.*?)\]\((.*?)\)', raw)
            if match:
                alt, img_rel = match.groups()
                img_path = os.path.normpath(os.path.join(base_path, img_rel))
                if os.path.exists(img_path):
                    p = doc.add_paragraph()
                    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                    p.paragraph_format.space_before = Pt(8)
                    p.paragraph_format.space_after = Pt(4)
                    doc.add_picture(img_path, width=Inches(5.0))
                    cap = doc.add_paragraph()
                    cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
                    cap.paragraph_format.space_after = Pt(8)
                    c_run = cap.add_run(f"Figura: {alt}")
                    c_run.font.size = Pt(9)
                    c_run.italic = True
                    c_run.font.color.rgb = RGBColor(100, 116, 139)
        elif raw.startswith('* ') or raw.startswith('- '):
            p = doc.add_paragraph(style='List Bullet')
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(2)
            content = raw[2:]
            parts = re.split(r'(\*\*.*?\*\*|\*.*?\*|`.*?`)', content)
            for part in parts:
                if not part: continue
                if part.startswith('**') and part.endswith('**'):
                    r = p.add_run(part[2:-2])
                    r.bold = True
                elif part.startswith('*') and part.endswith('*'):
                    r = p.add_run(part[1:-1])
                    r.italic = True
                elif part.startswith('`') and part.endswith('`'):
                    r = p.add_run(part[1:-1])
                    r.font.name = 'Consolas'
                    r.font.size = Pt(9.5)
                else:
                    r = p.add_run(part)
        elif re.match(r'^\s*(\d+\.|\*|\-)\s', raw):
            # Sub-bullet or numbered
            p = doc.add_paragraph()
            p.paragraph_format.left_indent = Inches(0.25)
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(2)
            parts = re.split(r'(\*\*.*?\*\*|\*.*?\*|`.*?`)', raw.strip())
            for part in parts:
                if not part: continue
                if part.startswith('**') and part.endswith('**'):
                    r = p.add_run(part[2:-2])
                    r.bold = True
                elif part.startswith('*') and part.endswith('*'):
                    r = p.add_run(part[1:-1])
                    r.italic = True
                elif part.startswith('`') and part.endswith('`'):
                    r = p.add_run(part[1:-1])
                    r.font.name = 'Consolas'
                    r.font.size = Pt(9.5)
                else:
                    r = p.add_run(part)
        else:
            add_styled_paragraph(doc, raw)

    if in_table:
        flush_table(table_lines)

    doc.save(docx_path)
    print(f"Generated: {docx_path} ({os.path.getsize(docx_path)} bytes)")

if __name__ == '__main__':
    base = os.path.abspath(r"C:\Users\Martin\skip-sj\docs")
    for doc in DOCS:
        convert_md_to_docx(base, doc)

