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

export interface AnalisisEstructurado {
  saludo: string;
  horaCorte: string;
  ritmoCocina: {
    estado: string;
    nivel: 'optimo' | 'moderado' | 'critico';
    detalle: string;
    puntoAtencion?: string;
  };
  cuelloBotella: {
    riesgo: string;
    nivel: 'bajo' | 'medio' | 'alto';
    detalle: string;
    accion: string;
  };
  estrategia: {
    productoDestacado: string;
    detalle: string;
    preparacionProactiva: string;
  };
  oportunidadVenta: {
    titulo: string;
    propuestaCombo: string;
    impactoTicket: string;
  };
  cierre: string;
}

export async function generarAnalisisLocal(metricas: MetricasNegocio): Promise<AnalisisEstructurado> {
  const currentKey = import.meta.env.VITE_GEMINI_API_KEY || '';

  if (!currentKey) {
    return generarReporteFallback(metricas);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: currentKey });
    const prompt = `
Eres el "Copiloto Asesor SKIP Duoc UC", consultor de gestión y analítica para locales de comida en Duoc UC Sede San Joaquín.
Analiza con rigor estas métricas en tiempo real del local "${metricas.nombreLocal}":

DATOS REALES:
- Local: ${metricas.nombreLocal}
- Ventas totales acumuladas: $${metricas.totalVentas.toLocaleString('es-CL')} CLP
- Pedidos totales: ${metricas.pedidosTotales}
- En cocina ahora (en preparación): ${metricas.pedidosPorEstado.en_preparacion}
- En cola por preparar: ${metricas.pedidosPorEstado.pagado}
- Listos esperando retiro en mesón: ${metricas.pedidosPorEstado.listo_retiro}
- Entregados exitosos: ${metricas.pedidosPorEstado.completado}
- Productos más pedidos: ${metricas.productosMasVendidos.map(p => `${p.cantidad}x ${p.nombre}`).join(', ') || 'Sin productos registrados aún'}
- Hora actual de corte: ${metricas.horaActual}

Devuelve un JSON estrictamente estructurado según este esquema:
{
  "saludo": "Estimados, reporte operativo para [nombreLocal] con corte a las [horaActual]. Breve contexto del momento del casino Duoc.",
  "horaCorte": "${metricas.horaActual}",
  "ritmoCocina": {
    "estado": "Flujo Moderado-Alto" (o Óptimo o Crítico),
    "nivel": "optimo" | "moderado" | "critico",
    "detalle": "Diagnóstico detallado y conciso del ritmo de cocina versus pedidos recibidos.",
    "puntoAtencion": "Detalle clave a vigilar (por ejemplo, demora en retiro de alumnos o velocidad de despacho)"
  },
  "cuelloBotella": {
    "riesgo": "Riesgo de acumulación en mesón" (o Saturación de fuegos, o Ninguno),
    "nivel": "bajo" | "medio" | "alto",
    "detalle": "Explicación del riesgo potencial si no se toman medidas rápidas.",
    "accion": "Acción inmediata y concreta recomendada para el personal de turno."
  },
  "estrategia": {
    "productoDestacado": "Nombre del producto estrella más vendido",
    "detalle": "Por qué este ítem lidera la demanda y qué representa en la carta.",
    "preparacionProactiva": "Instrucción proactiva antes del próximo cambio de clases."
  },
  "oportunidadVenta": {
    "titulo": "Sugerencia de Combo o Upselling",
    "propuestaCombo": "Descripción clara de la oferta sugerida para el alumno (ej: Por $1.500 extra suma bebida o postre)",
    "impactoTicket": "Estimación del nuevo ticket promedio proyectado"
  },
  "cierre": "Mensaje de motivación y enfoque operativo para el equipo del local."
}
No incluyas markdown adicional fuera del JSON.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    if (response.text) {
      const parsed: AnalisisEstructurado = JSON.parse(response.text);
      return parsed;
    }

    return generarReporteFallback(metricas);
  } catch (error) {
    console.error("Error al consultar Gemini:", error);
    return generarReporteFallback(metricas);
  }
}

function generarReporteFallback(m: MetricasNegocio): AnalisisEstructurado {
  const cargaCocina = m.pedidosPorEstado.pagado + m.pedidosPorEstado.en_preparacion;
  const nivelDemora: 'optimo' | 'moderado' | 'critico' = cargaCocina > 4 ? 'critico' : cargaCocina > 1 ? 'moderado' : 'optimo';
  const topProd = m.productosMasVendidos[0]?.nombre || 'Producto Principal';

  return {
    saludo: `Reporte analítico para ${m.nombreLocal}. Supervisión de operaciones en tiempo real en Duoc UC San Joaquín.`,
    horaCorte: m.horaActual,
    ritmoCocina: {
      estado: nivelDemora === 'optimo' ? 'Flujo Ágil' : nivelDemora === 'moderado' ? 'Flujo Regular' : 'Alta Demanda',
      nivel: nivelDemora,
      detalle: `La cocina opera con ${cargaCocina} pedidos en curso activo y $${m.totalVentas.toLocaleString('es-CL')} CLP acumulados en ${m.pedidosTotales} órdenes.`,
      puntoAtencion: m.pedidosPorEstado.listo_retiro > 1
        ? `${m.pedidosPorEstado.listo_retiro} pedidos listos esperan retiro en mesón. Conviene avisar a los alumnos.`
        : 'Mesón de entrega operando con fluidez.'
    },
    cuelloBotella: {
      riesgo: m.pedidosPorEstado.listo_retiro > 2 ? 'Congestión en Mesón de Retiro' : 'Demanda Equilibrada',
      nivel: m.pedidosPorEstado.listo_retiro > 2 ? 'medio' : 'bajo',
      detalle: m.pedidosPorEstado.listo_retiro > 2
        ? 'Hay bandejas esperando retiro que pueden entorpecer la salida de nuevas órdenes.'
        : 'No se observan trabas en la línea de producción en este instante.',
      accion: m.pedidosPorEstado.listo_retiro > 2
        ? 'Llamar por código de retiro a los alumnos pendientes para liberar espacio.'
        : 'Mantener el mise-en-place listo para el siguiente bloque de clases.'
    },
    estrategia: {
      productoDestacado: topProd,
      detalle: `${topProd} es el producto de mayor rotación en la jornada actual.`,
      preparacionProactiva: 'Tener porciones base pre-armadas 10 minutos antes del timbre de cambio de horario.'
    },
    oportunidadVenta: {
      titulo: 'Combo Recreo Duoc',
      propuestaCombo: 'Sugerir en caja agregar bebida o postre casero por $1.200 a compras sobre $3.500.',
      impactoTicket: 'Aumento proyectado del ticket promedio a $4.800 CLP.'
    },
    cierre: '¡Gran trabajo del equipo! Mantener la velocidad de despacho en el mesón es la clave de la satisfacción estudiantil.'
  };
}
