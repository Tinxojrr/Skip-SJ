import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, BrainCircuit, X, RefreshCw, Lightbulb } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';
import { generarAnalisisLocal, type MetricasNegocio } from '../../../lib/gemini';

export function CopilotoIABtn() {
  const { locatarioId, nombreLocal, role } = useAuth();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [analizando, setAnalizando] = useState(false);
  const [analisis, setAnalisis] = useState<string | null>(null);

  const ejecutarAnalisis = async () => {
    if (!locatarioId && role !== 'super_admin') return;
    setAnalizando(true);
    setAnalisis(null);

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
      console.error(err);
      setAnalisis("Error al generar el diagnóstico con IA.");
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
      {/* Botón Flotante o de Acción en Header/Dashboard */}
      <button
        onClick={abrirModal}
        className="group relative inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-linear-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 rounded-xl shadow-md shadow-orange-500/20 transition-all duration-200 hover:scale-[1.02]"
        title="Consultar Copiloto Asesor con IA"
      >
        <Sparkles className="w-4 h-4 text-white animate-pulse" />
        <span className="tracking-wide">Copiloto IA</span>
      </button>

      {/* Modal del Asesor */}
      {modalAbierto && createPortal(
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalAbierto(false);
          }}
        >
          <div className="bg-white dark:bg-[#121217] w-full max-w-2xl rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150">
            
            {/* Header Modal */}
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-[#16161c]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500">
                  <BrainCircuit className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                    Copiloto Asesor IA
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Gemini 3 Flash
                    </span>
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Analítica predictiva en tiempo real para {nombreLocal || 'tu local'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={ejecutarAnalisis}
                  disabled={analizando}
                  className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition disabled:opacity-50"
                  title="Actualizar análisis"
                >
                  <RefreshCw className={`w-4 h-4 ${analizando ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => setModalAbierto(false)}
                  className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {analizando ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 animate-bounce">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                    Gemini está analizando los pedidos de tu cocina...
                  </p>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                    Calculando rotación de ingredientes, velocidad de preparación y proyecciones para los próximos bloques.
                  </p>
                </div>
              ) : analisis ? (
                <div className="prose dark:prose-invert max-w-none text-xs leading-relaxed space-y-3 text-zinc-700 dark:text-zinc-300 font-sans">
                  {analisis.split('\n\n').map((parrafo, i) => {
                    if (parrafo.startsWith('###') || parrafo.startsWith('#')) {
                      return (
                        <h4 key={i} className="text-sm font-bold text-zinc-950 dark:text-white pt-2 border-b border-zinc-100 dark:border-zinc-800 pb-1">
                          {parrafo.replace(/#/g, '').trim()}
                        </h4>
                      );
                    }
                    return (
                      <p key={i} className="whitespace-pre-line">
                        {parrafo}
                      </p>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-zinc-400 text-center py-10">Sin datos de análisis</p>
              )}
            </div>

            {/* Footer Modal */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-[#16161c] flex items-center justify-between text-[11px] text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                Actualizado en base a órdenes reales de Supabase
              </span>
              <button
                onClick={() => setModalAbierto(false)}
                className="px-4 py-1.5 font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition"
              >
                Cerrar
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
