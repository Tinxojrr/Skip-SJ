const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, BorderStyle, AlignmentType, ShadingType, VerticalAlign,
  Header, Footer, PageNumber, ImageRun, LevelFormat,
} = require("docx");
const fs = require("fs");
 
const NAVY = "1F3864";
const ACCENT = "2E5395";
const LIGHT = "DDE6F0";
const GRAY = "595959";
const AMBER = "8a5a00";
const FONT = "Calibri";
 
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 160 },
    border: { bottom: { color: ACCENT, space: 4, style: BorderStyle.SINGLE, size: 6 } },
    children: [new TextRun({ text, bold: true, color: NAVY, font: FONT, size: 28 })],
  });
}
function h2(text, color = ACCENT) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text, bold: true, color, font: FONT, size: 24 })],
  });
}
function body(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 160, line: 276 },
    alignment: AlignmentType.JUSTIFIED,
    children: [new TextRun({ text, font: FONT, size: 22, color: "262626", ...opts })],
  });
}
function bullet(children, level = 0) {
  return new Paragraph({
    numbering: { reference: "bullet-list", level },
    spacing: { after: 100, line: 276 },
    children: Array.isArray(children) ? children : [children],
  });
}
function run(text, opts = {}) {
  return new TextRun({ text, font: FONT, size: 22, color: "262626", ...opts });
}
function captionText(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 80, after: 260 },
    children: [new TextRun({ text, italics: true, font: FONT, size: 18, color: GRAY })],
  });
}
function cellText(text, { bold = false, color = "262626", size = 20, align = AlignmentType.LEFT } = {}) {
  return new Paragraph({
    alignment: align,
    spacing: { after: 0, line: 240 },
    children: [new TextRun({ text, bold, color, font: FONT, size })],
  });
}
function headerCell(text, width) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: { type: ShadingType.CLEAR, color: "auto", fill: NAVY },
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
    children: [cellText(text, { bold: true, color: "FFFFFF", size: 20 })],
  });
}
function dataCell(text, width, { fill, bold = false } = {}) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: fill ? { type: ShadingType.CLEAR, color: "auto", fill } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
    children: [cellText(text, { bold })],
  });
}
 
function diagramImage(path, widthIn) {
  const buf = fs.readFileSync(path);
  const sizeOf = (p) => {
    const b = fs.readFileSync(p);
    return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
  };
  const { width, height } = sizeOf(path);
  const ratio = height / width;
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 160, after: 0 },
    children: [new ImageRun({ data: buf, type: "png", transformation: { width: Math.round(widthIn * 96), height: Math.round(widthIn * 96 * ratio) } })],
  });
}
 
// ---- Influence/Interest matrix table ----
const matrixRows = [
  ["Administrador Global", "Alto", "Alto", "Gestionar de cerca (Key Player)"],
  ["Locatario", "Medio\u2013Alto", "Alto", "Mantener satisfecho / involucrar activamente"],
  ["Alumno", "Bajo (individual) / Alto (colectivo)", "Alto", "Mantener informado \u2014 su adopción masiva define el éxito"],
];
const matrixWidths = [2800, 2600, 1800, 3140];
const matrixTable = new Table({
  width: { size: 10340, type: WidthType.DXA },
  columnWidths: matrixWidths,
  rows: [
    new TableRow({ tableHeader: true, children: [headerCell("Actor", matrixWidths[0]), headerCell("Influencia / Poder", matrixWidths[1]), headerCell("Interés", matrixWidths[2]), headerCell("Estrategia de Gestión", matrixWidths[3])] }),
    ...matrixRows.map((r, i) => new TableRow({
      children: [
        dataCell(r[0], matrixWidths[0], { fill: i % 2 ? LIGHT : "FFFFFF", bold: true }),
        dataCell(r[1], matrixWidths[1], { fill: i % 2 ? LIGHT : "FFFFFF" }),
        dataCell(r[2], matrixWidths[2], { fill: i % 2 ? LIGHT : "FFFFFF" }),
        dataCell(r[3], matrixWidths[3], { fill: i % 2 ? LIGHT : "FFFFFF" }),
      ],
    })),
  ],
});
 
const doc = new Document({
  numbering: {
    config: [
      { reference: "bullet-list", levels: [
        { level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 460, hanging: 260 } } } },
      ] },
    ],
  },
  sections: [
    {
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
      headers: { default: new Header({ children: [
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          border: { bottom: { color: "BFBFBF", space: 4, style: BorderStyle.SINGLE, size: 4 } },
          children: [new TextRun({ text: "Skip Duoc UC \u2014 Mapa de Actores", font: FONT, size: 16, color: GRAY })],
        }),
      ] }) },
      footers: { default: new Footer({ children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "Página ", font: FONT, size: 16, color: GRAY }),
            new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16, color: GRAY }),
            new TextRun({ text: " de ", font: FONT, size: 16, color: GRAY }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FONT, size: 16, color: GRAY }),
          ],
        }),
      ] }) },
      children: [
        // Title
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 100, after: 60 }, children: [new TextRun({ text: "MAPA DE ACTORES", bold: true, font: FONT, size: 22, color: GRAY })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 300 }, children: [new TextRun({ text: "Skip Duoc UC", bold: true, font: FONT, size: 40, color: NAVY })] }),
        new Table({
          width: { size: 10340, type: WidthType.DXA },
          columnWidths: [2600, 7740],
          rows: [
            new TableRow({ children: [dataCell("Proyecto", 2600, { fill: LIGHT, bold: true }), dataCell("Skip Duoc UC \u2014 Sistema Integral de Pedidos Anticipados", 7740)] }),
            new TableRow({ children: [dataCell("Alcance del Mapa", 2600, { fill: LIGHT, bold: true }), dataCell("3 actores principales: Alumno, Locatario y Administrador Global", 7740)] }),
          ],
        }),
        new Paragraph({ spacing: { after: 200 }, children: [] }),
 
        body("Este mapa representa las relaciones e influencia entre los tres actores principales del ecosistema Skip Duoc UC. A diferencia del Diagrama de Casos de Uso (que detalla funcionalidades), este mapa se enfoca en el poder, el interés y el tipo de vínculo que cada actor mantiene con los demás dentro del proyecto."),
 
        // diagramImage("/home/claude/skipsj/uml/actores.png", 6.3),
        // captionText("Figura 1. Mapa de Actores \u2014 Skip Duoc UC."),
 
        // Actor descriptions
        h1("1. Descripción de los Actores"),
 
        h2("Administrador Global (Duoc UC / Sponsor)", NAVY),
        body("Actor de control institucional. Representa tanto al Sponsor del proyecto (Carlos Soto) como a la capa de gobierno del sistema (rol super_admin). No participa en la transacción de compra, pero define las reglas del juego: habilita nuevos locales, gestiona usuarios y supervisa la salud general del ecosistema."),
        bullet([run("Influencia sobre el Alumno: ", { bold: true }), run("supervisión de cuentas, soporte ante incidencias y resguardo de la experiencia dentro de la sede.")]),
        bullet([run("Influencia sobre el Locatario: ", { bold: true }), run("habilitación del local en la plataforma y aplicación de las políticas de seguridad (RLS) que delimitan lo que cada local puede ver y hacer.")]),
 
        h2("Alumno (Cliente / Demanda)", AMBER),
        body("Actor principal del lado de la demanda. Es quien genera el volumen transaccional del sistema: explora el catálogo, arma su pedido y paga de forma anticipada para evitar las filas físicas durante su breve ventana de descanso."),
        bullet([run("Relación con el Locatario: ", { bold: true }), run("vínculo transaccional directo \u2014 el Alumno origina el pedido y el pago; el Locatario responde con la preparación y el estado en tiempo real.")]),
        bullet([run("Relación con el Administrador: ", { bold: true }), run("depende de él para la autenticación, el soporte y la resolución de problemas de cuenta.")]),
 
        h2("Locatario (Vendedor / Oferta)", AMBER),
        body("Actor principal del lado de la oferta. Representa a los 5 locales piloto (Achoclonados, -1 Foodtruck, Paradiso, Castaño y Casino). Su rol es operativo: recibe los pedidos pagados, gestiona su cocina mediante el tablero Kanban y confirma la entrega."),
        bullet([run("Relación con el Alumno: ", { bold: true }), run("recibe la demanda y retribuye con la entrega del producto y la notificación del estado del pedido (\u201clisto para retiro\u201d).")]),
        bullet([run("Relación con el Administrador: ", { bold: true }), run("opera bajo las políticas de aislamiento de datos (RLS), lo que garantiza que solo vea información de su propio local.")]),
 
        // 2. Matrix
        h1("2. Matriz de Influencia e Interés"),
        body("Complementando el mapa gráfico, la siguiente matriz clasifica a cada actor según su nivel de poder de decisión sobre el proyecto y su interés en el resultado, orientando la estrategia de comunicación y gestión de expectativas de cada uno."),
        matrixTable,
        new Paragraph({ spacing: { after: 200 }, children: [] }),
 
        // 3. Relaciones clave
        h1("3. Relaciones Clave del Ecosistema"),
        bullet([run("Alumno \u2194 Locatario (bidireccional, transaccional): ", { bold: true, color: NAVY }), run("es el corazón del negocio. El pedido y pago fluye del Alumno al Locatario; el estado del pedido y la notificación push fluyen en sentido inverso.")]),
        bullet([run("Administrador \u2192 Alumno (unidireccional, de control): ", { bold: true, color: NAVY }), run("el Administrador no participa en la compra, pero sostiene la infraestructura de autenticación y soporte que la hace posible.")]),
        bullet([run("Administrador \u2192 Locatario (unidireccional, de control): ", { bold: true, color: NAVY }), run("el Administrador habilita, audita y aplica las políticas de seguridad que permiten a cada local operar de forma aislada y confiable.")]),
      ],
    },
  ],
});
 
Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync("Skip_DuocUC_Mapa_de_Actores.docx", buf);
  console.log("done");
});