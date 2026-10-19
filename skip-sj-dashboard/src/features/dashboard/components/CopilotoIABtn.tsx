import { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Sparkles, 
  BrainCircuit, 
  X, 
  RefreshCw, 
  Activity, 
  AlertTriangle, 
  Target, 
  TrendingUp, 
  Flame, 
  Rocket, 
  Clock, 
  CheckCircle2 
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';
import { generarAnalisisLocal, type MetricasNegocio, type AnalisisEstructurado } from '../../../lib/gemini';

export function CopilotoIABtn() {
  const { locatarioId, nombreLocal, role } = useAuth();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [analizando, setAnalizando] = useState(false);
  const [analisis, setAnalisis] = useState<AnalisisEstructurado | null>(null);

  const ejecutarAnalisis = async () => {
    if (!locatarioId && role !== 'super_admin') return;
    setAnalizando(true);

    try {
      // 1. Obtener pedidos del local
      let query = supabase.from('pedidos').select(`
        monto_total,
        estado,
        created_at,
        pedido_items (
          cantidad,
          productos ( nombre_producto )
        )
      `);

      if (role !== 'super_admin' && locatarioId) {
        query = query.eq('locatario_id', locatarioId);
      }

      const { data: pedidos } = await query;
      const validOrders = pedidos || [];

      // 2. Calcular métricas
      let totalVentas = 0;
      const estados = { pagado: 0, en_preparacion: 0, listo_retiro: 0, completado: 0 };
      const productosMap: { [key: string]: number } = {};

      validOrders.forEach((p: any) => {
        if (p.estado !== 'cancelado') totalVentas += p.monto_total || 0;
        if (p.estado in estados) {
          (estados as any)[p.estado] += 1;
        }

        p.pedido_items?.forEach((item: any) => {
          const nom = item.productos?.nombre_producto || 'Producto';
          productosMap[nom] = (productosMap[nom] || 0) + (item.cantidad || 1);
        });
      });

      const topProductos = Object.entries(productosMap)
        .map(([nombre, cantidad]) => ({ nombre, cantidad }))
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 5);

      const metricas: MetricasNegocio = {
        nombreLocal: nombreLocal || 'Achoclonado',
        totalVentas,
        pedidosTotales: validOrders.length,
        pedidosPorEstado: estados,
        productosMasVendidos: topProductos,
        horaActual: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
      };

      const resultado = await generarAnalisisLocal(metricas);
      setAnalisis(resultado);
    } catch (err) {
      console.error("Error al ejecutar Copiloto IA:", err);
    } finally {
      setAnalizando(false);
    }
  };

  const abrirModal = () => {
    setModalAbierto(true);
    if (!analisis) {
      ejecutarAnalisis();
    }
  };

  return (
    <>
      {/* Botón en Header */}
      <button
        onClick={abrirModal}
        className="group relative inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-linear-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 rounded-xl shadow-md shadow-orange-500/20 transition-all duration-200 hover:scale-[1.02] cursor-pointer"
        title="Consultar Copiloto Asesor con IA"
      >
        <Sparkles className="w-4 h-4 text-white animate-pulse" />
        <span className="tracking-wide">Copiloto IA</span>
      </button>

      {/* Modal Teletransportado a Body */}
      {modalAbierto && createPortal(
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalAbierto(false);
          }}
        >
          <div className="bg-[#0e0e13] border border-zinc-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
            
            {/* Header del Modal */}
            <div className="p-5 border-b border-zinc-800/80 bg-[#13131a] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-base font-extrabold text-white tracking-tight">
                      Copiloto Asesor SKIP Duoc UC
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Gemini 3 Flash
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Diagnóstico operativo y proyecciones para <strong className="text-zinc-200">{nombreLocal || 'tu local'}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={ejecutarAnalisis}
                  disabled={analizando}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded-xl transition disabled:opacity-50 cursor-pointer"
                  title="Actualizar diagnóstico con IA"
                >
                  <RefreshCw className={`w-4 h-4 ${analizando ? 'animate-spin text-amber-400' : ''}`} />
                </button>
                <button
                  onClick={() => setModalAbierto(false)}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded-xl transition cursor-pointer"
                  title="Cerrar modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Contenido con Scroll */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4 font-sans custom-scrollbar">
              {analizando ? (
                <div className="py-20 text-center space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 animate-bounce shadow-lg shadow-amber-500/10">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white tracking-wide">
                      Gemini 3 Flash está analizando la cocina...
                    </h4>
                    <p className="text-xs text-zinc-400 max-w-md mx-auto mt-1 leading-relaxed">
                      Procesando órdenes en vivo, ritmo de salida en mesón y recomendaciones de venta para el próximo bloque.
                    </p>
                  </div>
                </div>
              ) : analisis ? (
                <div className="space-y-4">

                  {/* Banner de Saludo y Contexto de Hora */}
                  <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-start gap-3">
                    <Clock className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                        {analisis.saludo}
                      </p>
                    </div>
                  </div>

                  {/* Grid de 2 Columnas para Diagnóstico y Cuello de Botella */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Card 1: Diagnóstico Operativo */}
                    <div className="p-4 rounded-xl bg-[#121218] border border-zinc-800/80 hover:border-zinc-700/80 transition-colors flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60 mb-3">
                          <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-300">
                            <Activity className="w-4 h-4 text-blue-400" />
                            Ritmo de Cocina
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                            analisis.ritmoCocina.nivel === 'optimo' 
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : analisis.ritmoCocina.nivel === 'moderado'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : 'bg-red-500/15 text-red-400 border border-red-500/30'
                          }`}>
                            {analisis.ritmoCocina.estado}
                          </span>
                        </div>

                        <p className="text-xs text-zinc-300 leading-relaxed">
                          {analisis.ritmoCocina.detalle}
                        </p>
                      </div>

                      {analisis.ritmoCocina.puntoAtencion && (
                        <div className="mt-3.5 pt-2.5 border-t border-zinc-800/50 flex items-start gap-2 text-[11px] text-zinc-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                          <span><strong className="text-zinc-200">Atención:</strong> {analisis.ritmoCocina.puntoAtencion}</span>
                        </div>
                      )}
                    </div>

                    {/* Card 2: Alerta de Cuello de Botella */}
                    <div className="p-4 rounded-xl bg-[#121218] border border-zinc-800/80 hover:border-zinc-700/80 transition-colors flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60 mb-3">
                          <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-300">
                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                            Punto de Despacho
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                            analisis.cuelloBotella.nivel === 'alto' 
                              ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                              : analisis.cuelloBotella.nivel === 'medio'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            Riesgo {analisis.cuelloBotella.nivel}
                          </span>
                        </div>

                        <p className="text-xs text-zinc-300 leading-relaxed">
                          {analisis.cuelloBotella.detalle}
                        </p>
                      </div>

                      <div className="mt-3.5 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200 text-[11px] font-medium flex items-start gap-2">
                        <strong className="text-amber-400 shrink-0">Acción:</strong>
                        <span>{analisis.cuelloBotella.accion}</span>
                      </div>
                    </div>

                  </div>

                  {/* Grid de 2 Columnas para Estrategia y Venta */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Card 3: Recomendación Estratégica Inmediata */}
                    <div className="p-4 rounded-xl bg-[#121218] border border-zinc-800/80 hover:border-zinc-700/80 transition-colors">
                      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60 mb-3">
                        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-300">
                          <Target className="w-4 h-4 text-purple-400" />
                          Estrategia de Cocina
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-300 bg-purple-500/15 border border-purple-500/25 px-2 py-0.5 rounded-md">
                          <Flame className="w-3 h-3 text-orange-400" />
                          {analisis.estrategia.productoDestacado}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-300 leading-relaxed mb-3">
                        {analisis.estrategia.detalle}
                      </p>

                      <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-200 text-[11px]">
                        <strong className="text-purple-400 block mb-0.5">Anticipación al bloque:</strong>
                        <span>{analisis.estrategia.preparacionProactiva}</span>
                      </div>
                    </div>

                    {/* Card 4: Oportunidad de Venta y Upselling */}
                    <div className="p-4 rounded-xl bg-[#121218] border border-zinc-800/80 hover:border-zinc-700/80 transition-colors">
                      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60 mb-3">
                        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-300">
                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                          {analisis.oportunidadVenta.titulo}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                          {analisis.oportunidadVenta.impactoTicket}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-300 leading-relaxed mb-3">
                        {analisis.oportunidadVenta.propuestaCombo}
                      </p>

                      <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-[11px]">
                        <strong className="text-emerald-400 block mb-0.5">Impacto Proyectado:</strong>
                        <span>{analisis.oportunidadVenta.impactoTicket}</span>
                      </div>
                    </div>

                  </div>

                  {/* Mensaje de Cierre / Motivación */}
                  <div className="p-3.5 rounded-xl bg-linear-to-r from-zinc-900 via-zinc-900/80 to-[#15151f] border border-zinc-800 flex items-center gap-3">
                    <Rocket className="w-4 h-4 text-orange-400 shrink-0" />
                    <p className="text-xs text-zinc-300 font-medium">
                      {analisis.cierre}
                    </p>
                  </div>

                </div>
              ) : (
                <div className="py-12 text-center text-xs text-zinc-400">
                  Sin datos disponibles para generar el análisis.
                </div>
              )}
            </div>

            {/* Footer Modal */}
            <div className="p-4 border-t border-zinc-800/80 bg-[#13131a] flex items-center justify-between text-xs shrink-0">
              <span className="flex items-center gap-2 text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Sincronizado con base de datos en tiempo real
              </span>
              <button
                onClick={() => setModalAbierto(false)}
                className="px-5 py-2 font-bold text-zinc-200 bg-zinc-800/80 hover:bg-zinc-700/80 rounded-xl transition cursor-pointer"
              >
                Entendido
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default CopilotoIABtn;
