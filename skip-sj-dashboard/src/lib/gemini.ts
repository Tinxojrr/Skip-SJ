import { GoogleGenAI } from '@google/genai';

export interface MetricasNegocio {
  nombreLocal: string;
  totalVentas: number;
  pedidosTotales: number;
  pedidosPorEstado: {
    pagado: number;
    en_preparacion: number;
    listo_retiro: number;
    completado: number;
  };
  productosMasVendidos: { nombre: string; cantidad: number }[];
  horaActual: string;
}

export async function generarAnalisisLocal(metricas: MetricasNegocio): Promise<string> {
  const currentKey = import.meta.env.VITE_GEMINI_API_KEY || '';

  // Si no hay API key configurada, usamos el motor heurístico local de respaldo
  if (!currentKey) {
    return generarReporteFallback(metricas);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: currentKey });
    const prompt = `
Eres el "Copiloto Asesor Skip SJ", un experto en gestión de restaurantes universitarios y analítica gastronómica para Duoc UC Sede San Joaquín.
Analiza las siguientes métricas en vivo del local "${metricas.nombreLocal}" y entrega un reporte breve, accionable y ejecutivo (en formato Markdown en español chileno / formal):

DATOS DEL LOCAL:
- Local: ${metricas.nombreLocal}
- Ventas totales acumuladas: $${metricas.totalVentas.toLocaleString('es-CL')} CLP
- Total pedidos procesados: ${metricas.pedidosTotales}
- En cocina en este momento: ${metricas.pedidosPorEstado.en_preparacion}
- Por preparar (cola): ${metricas.pedidosPorEstado.pagado}
- Listos esperando retiro: ${metricas.pedidosPorEstado.listo_retiro}
- Entregados con éxito: ${metricas.pedidosPorEstado.completado}
- Productos más pedidos: ${metricas.productosMasVendidos.map(p => `${p.cantidad}x ${p.nombre}`).join(', ') || 'Sin productos registrados aún'}
- Hora actual de operación: ${metricas.horaActual}

ESTRUCTURA DEL REPORTE:
1. 📊 **Diagnóstico Operativo:** ¿Cómo está el ritmo de cocina y la carga de pedidos en comparación con el horario del casino?
2. ⚡ **Alerta de Cuello de Botella:** Identifica si hay riesgo de colapso de pedidos por preparar o acumulación en mesón.
3. 🎯 **Recomendación Estratégica Inmediata:** Sugiere qué cocinar o preparar antes del próximo bloque de clases o si conviene pausar algún producto con baja disponibilidad.
4. 💡 **Oportunidad de Venta:** Idea de promoción o combo rápido para aumentar el ticket promedio.

Sé conciso, motivador y muy profesional con tono de consultor de negocio.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "No se pudo generar el análisis en este momento.";
  } catch (error) {
    console.error("Error al consultar Gemini:", error);
    return generarReporteFallback(metricas);
  }
}

function generarReporteFallback(m: MetricasNegocio): string {
  const cargaCocina = m.pedidosPorEstado.pagado + m.pedidosPorEstado.en_preparacion;
  const nivelDemora = cargaCocina > 4 ? "Alto" : cargaCocina > 1 ? "Moderado" : "Óptimo";

  return `### 📊 Diagnóstico Operativo: ${m.nombreLocal}
El ritmo de cocina actualmente está en nivel **${nivelDemora}** (${cargaCocina} pedidos en cola activa). 
Has acumulado **$${m.totalVentas.toLocaleString('es-CL')} CLP** en ${m.pedidosTotales} órdenes registradas.

### ⚡ Alertas de Cocina
${m.pedidosPorEstado.listo_retiro > 2 
  ? `⚠️ Hay **${m.pedidosPorEstado.listo_retiro} pedidos listos** esperando retiro en el mesón. Notifica o valida códigos para descongestionar el mesón.` 
  : `✅ El mesón de retiro se encuentra despejado (${m.pedidosPorEstado.listo_retiro} esperando).`}

### 🎯 Recomendación para el Próximo Bloque
- **Anticipación:** Los picos de mayor demanda estudiantil ocurren entre bloques de clases (12:30 a 14:00 hrs). Ten preparados los ingredientes base con 10 minutos de antelación.
- **Top Ventas:** Tus productos estrella están respondiendo bien. Mantén revisada la pestaña de *Carta y Productos* para pausar a tiempo si algún insumo se agota.

*(Tip: Agrega tu VITE_GEMINI_API_KEY en el archivo .env para habilitar el motor generativo neuronal en vivo).*`;
}
