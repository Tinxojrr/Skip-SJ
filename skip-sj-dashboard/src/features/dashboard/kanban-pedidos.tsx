import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { 
  Clock, 
  ChefHat, 
  CheckCircle2, 
  ShoppingBag, 
  User, 
  ArrowRight, 
  RefreshCw, 
  PackageCheck,
  Volume2
} from 'lucide-react';

type EstadoPedido = 'pendiente_pago' | 'pagado' | 'en_preparacion' | 'listo_retiro' | 'completado';

interface PedidoItem {
  id: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  productos: {
    nombre_producto: string;
  } | null;
}

interface Pedido {
  id: string;
  estado: EstadoPedido;
  hora_retiro_estimada: string;
  monto_total: number;
  codigo_retiro?: string;
  created_at: string;
  usuarios?: {
    p_nombre?: string;
    apellido_p?: string;
    apodo?: string;
    email?: string;
  } | null;
  pedido_items?: PedidoItem[];
}

export const KanbanBoard = () => {
  const { locatarioId, role } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [nombreLocal, setNombreLocal] = useState('Cargando local...');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // 1. Obtener datos del Local
  useEffect(() => {
    if (locatarioId) {
      supabase.from('locatarios').select('nombre').eq('id', locatarioId).single()
        .then(({ data }) => {
          if (data) setNombreLocal(data.nombre);
        });
    } else if (role === 'super_admin') {
      setNombreLocal('Vista Global (Super Admin)');
    }
  }, [locatarioId, role]);

  // 2. Cargar Pedidos
  const fetchPedidos = useCallback(async () => {
    try {
      let query = supabase
        .from('pedidos')
        .select(`
          id,
          estado,
          hora_retiro_estimada,
          monto_total,
          codigo_retiro,
          created_at,
          usuarios (
            p_nombre,
            apellido_p,
            apodo,
            email
          ),
          pedido_items (
            id,
            cantidad,
            precio_unitario,
            subtotal,
            productos (
              nombre_producto
            )
          )
        `)
        .in('estado', ['pagado', 'en_preparacion', 'listo_retiro'])
        .order('created_at', { ascending: false });

      if (role !== 'super_admin' && locatarioId) {
        query = query.eq('locatario_id', locatarioId);
      }

      const { data, error } = await query;
      if (!error && data) {
        setPedidos(data as any as Pedido[]);
      } else if (error) {
        console.error('Error obteniendo pedidos:', error);
      }
    } catch (err) {
      console.error('Error inesperado:', err);
    } finally {
      setLoading(false);
    }
  }, [locatarioId, role]);

  // Sonido de campana de cocina para nuevos pedidos (Web Audio API)
  const playOrderChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
      gain1.gain.setValueAtTime(0.25, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.45);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
      gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.75);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.15);
      osc2.stop(ctx.currentTime + 0.75);
    } catch (e) {
      console.warn("AudioContext no disponible o bloqueado por el navegador:", e);
    }
  };

  useEffect(() => {
    if (!locatarioId && role !== 'super_admin') return;

    fetchPedidos();

    const channel = supabase.channel('cambios-pedidos-dashboard')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pedidos' }, (payload) => {
        if (!locatarioId || payload.new?.locatario_id === locatarioId) {
          playOrderChime();
        }
        fetchPedidos();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pedidos' }, () => {
        fetchPedidos();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPedidos, locatarioId, role]);

  const cambiarEstadoPedido = async (id: string, nuevoEstado: EstadoPedido) => {
    setUpdatingId(id);
    const { error } = await supabase
      .from('pedidos')
      .update({ estado: nuevoEstado, updated_at: new Date().toISOString() })
      .eq('id', id);

    setUpdatingId(null);

    if (error) {
      console.error('Error actualizando pedido:', error);
      alert('Hubo un error al actualizar el estado del pedido');
    } else {
      setPedidos(prev => prev.map(p => p.id === id ? { ...p, estado: nuevoEstado } : p));
      if (nuevoEstado === 'completado') {
        setPedidos(prev => prev.filter(p => p.id !== id));
      }
    }
  };

  const getPedidosPorEstado = (estado: EstadoPedido) => {
    return pedidos.filter(p => p.estado === estado);
  };

  const formatearTiempo = (fechaIso?: string) => {
    if (!fechaIso) return 'Recién';
    const fecha = new Date(fechaIso);
    return fecha.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  };

  const formatearPrecio = (monto: number) => {
    return `$${monto.toLocaleString('es-CL')}`;
  };

  const obtenerNombreCliente = (pedido: Pedido) => {
    if (pedido.usuarios) {
      if (pedido.usuarios.apodo) return pedido.usuarios.apodo;
      if (pedido.usuarios.p_nombre) {
        return `${pedido.usuarios.p_nombre} ${pedido.usuarios.apellido_p || ''}`.trim();
      }
      if (pedido.usuarios.email) {
        return pedido.usuarios.email.split('@')[0];
      }
    }
    return 'Alumno Duoc';
  };

  return (
    <div className="space-y-6">
      {/* Header del Tablero */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#111116] p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              En Vivo &bull; Cocina Duoc UC
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white mt-1">
            Tablero de Pedidos: <span className="text-[#F5A623]">{nombreLocal}</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Coordina la preparación y entrega en mesón validando el código de 4 caracteres.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => playOrderChime()}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl transition border border-zinc-200 dark:border-zinc-700/60"
            title="Probar sonido de notificación"
          >
            <Volume2 className="w-3.5 h-3.5 text-[#F5A623]" />
            <span>Probar Timbre</span>
          </button>

          <button 
            onClick={() => fetchPedidos()}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl transition border border-zinc-200 dark:border-zinc-700/60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* Columnas Kanban */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* COLUMNA 1: NUEVOS / PAGADOS */}
        <div className="bg-zinc-100/70 dark:bg-[#0e0e13] rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800/80 flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between pb-3.5 border-b border-zinc-200 dark:border-zinc-800 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">1. Por Preparar</h3>
            </div>
            <span className="px-2 py-0.5 text-xs font-bold font-mono bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-md">
              {getPedidosPorEstado('pagado').length}
            </span>
          </div>

          <div className="space-y-3.5 overflow-y-auto flex-1">
            {getPedidosPorEstado('pagado').length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-zinc-400 text-xs">
                <ShoppingBag className="w-8 h-8 mb-2 stroke-1 opacity-30" />
                <span>No hay pedidos entrantes</span>
              </div>
            ) : (
              getPedidosPorEstado('pagado').map((pedido) => (
                <PedidoCard 
                  key={pedido.id}
                  pedido={pedido}
                  formatearTiempo={formatearTiempo}
                  formatearPrecio={formatearPrecio}
                  obtenerNombreCliente={obtenerNombreCliente}
                  actionButton={
                    <button
                      onClick={() => cambiarEstadoPedido(pedido.id, 'en_preparacion')}
                      disabled={updatingId === pedido.id}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl transition text-xs shadow-xs disabled:opacity-50"
                    >
                      <ChefHat className="w-3.5 h-3.5" />
                      <span>Empezar Preparación</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                    </button>
                  }
                />
              ))
            )}
          </div>
        </div>

        {/* COLUMNA 2: EN PREPARACIÓN */}
        <div className="bg-zinc-100/70 dark:bg-[#0e0e13] rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800/80 flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between pb-3.5 border-b border-zinc-200 dark:border-zinc-800 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">2. En Cocina</h3>
            </div>
            <span className="px-2 py-0.5 text-xs font-bold font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md">
              {getPedidosPorEstado('en_preparacion').length}
            </span>
          </div>

          <div className="space-y-3.5 overflow-y-auto flex-1">
            {getPedidosPorEstado('en_preparacion').length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-zinc-400 text-xs">
                <ChefHat className="w-8 h-8 mb-2 stroke-1 opacity-30" />
                <span>Cocina libre</span>
              </div>
            ) : (
              getPedidosPorEstado('en_preparacion').map((pedido) => (
                <PedidoCard 
                  key={pedido.id}
                  pedido={pedido}
                  formatearTiempo={formatearTiempo}
                  formatearPrecio={formatearPrecio}
                  obtenerNombreCliente={obtenerNombreCliente}
                  actionButton={
                    <button
                      onClick={() => cambiarEstadoPedido(pedido.id, 'listo_retiro')}
                      disabled={updatingId === pedido.id}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition text-xs shadow-xs disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Marcar Listo para Retiro</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                    </button>
                  }
                />
              ))
            )}
          </div>
        </div>

        {/* COLUMNA 3: LISTOS PARA RETIRO */}
        <div className="bg-zinc-100/70 dark:bg-[#0e0e13] rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800/80 flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between pb-3.5 border-b border-zinc-200 dark:border-zinc-800 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">3. Listos para Retiro</h3>
            </div>
            <span className="px-2 py-0.5 text-xs font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">
              {getPedidosPorEstado('listo_retiro').length}
            </span>
          </div>

          <div className="space-y-3.5 overflow-y-auto flex-1">
            {getPedidosPorEstado('listo_retiro').length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-zinc-400 text-xs">
                <PackageCheck className="w-8 h-8 mb-2 stroke-1 opacity-30" />
                <span>Mesón despejado</span>
              </div>
            ) : (
              getPedidosPorEstado('listo_retiro').map((pedido) => (
                <PedidoCard 
                  key={pedido.id}
                  pedido={pedido}
                  formatearTiempo={formatearTiempo}
                  formatearPrecio={formatearPrecio}
                  obtenerNombreCliente={obtenerNombreCliente}
                  isReadyToPickUp
                  actionButton={
                    <button
                      onClick={() => cambiarEstadoPedido(pedido.id, 'completado')}
                      disabled={updatingId === pedido.id}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold rounded-xl transition text-xs border border-zinc-700 disabled:opacity-50"
                    >
                      <PackageCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Entregar (Finalizar)</span>
                    </button>
                  }
                />
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

// Componente individual de Tarjeta de Pedido
function PedidoCard({
  pedido,
  formatearTiempo,
  formatearPrecio,
  obtenerNombreCliente,
  actionButton,
  isReadyToPickUp = false
}: {
  pedido: Pedido;
  formatearTiempo: (f?: string) => string;
  formatearPrecio: (m: number) => string;
  obtenerNombreCliente: (p: Pedido) => string;
  actionButton: React.ReactNode;
  isReadyToPickUp?: boolean;
}) {
  const items = pedido.pedido_items || [];

  return (
    <div className={`bg-white dark:bg-[#15151b] rounded-2xl p-4 border transition-all duration-200 shadow-xs ${
      isReadyToPickUp 
        ? 'border-emerald-500/40 ring-1 ring-emerald-500/20' 
        : 'border-zinc-200 dark:border-zinc-800/90'
    }`}>
      {/* Header: ID y Hora */}
      <div className="flex items-center justify-between pb-2.5 border-b border-zinc-100 dark:border-zinc-800/60">
        <span className="font-mono text-xs font-bold text-zinc-500 dark:text-zinc-400">
          #{pedido.id.substring(0, 6).toUpperCase()}
        </span>
        <div className="flex items-center gap-1 text-[11px] text-zinc-400 font-mono">
          <Clock className="w-3 h-3" />
          <span>{formatearTiempo(pedido.created_at)}</span>
        </div>
      </div>

      {/* CÓDIGO DE RETIRO TICKET */}
      <div className={`my-3 p-2.5 rounded-xl flex items-center justify-between ${
        isReadyToPickUp
          ? 'bg-emerald-500/10 border border-emerald-500/30'
          : 'bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800'
      }`}>
        <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
          Código
        </div>
        <div className="text-xl font-black font-mono tracking-widest text-zinc-900 dark:text-white">
          {pedido.codigo_retiro || '----'}
        </div>
      </div>

      {/* CLIENTE */}
      <div className="flex items-center gap-1.5 mb-2.5 text-xs text-zinc-700 dark:text-zinc-300 font-medium">
        <User className="w-3 h-3 text-zinc-400" />
        <span className="truncate">{obtenerNombreCliente(pedido)}</span>
      </div>

      {/* ITEMS */}
      <div className="bg-zinc-50 dark:bg-[#0c0c10] rounded-xl p-2.5 mb-3 border border-zinc-100 dark:border-zinc-800/60">
        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
          Productos ({items.reduce((acc, i) => acc + (i.cantidad || 1), 0)})
        </div>
        {items.length > 0 ? (
          <ul className="space-y-1 text-xs text-zinc-700 dark:text-zinc-300">
            {items.map((item, idx) => (
              <li key={item.id || idx} className="flex justify-between items-start gap-2">
                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                  {item.cantidad}x {item.productos?.nombre_producto || 'Producto'}
                </span>
                <span className="text-zinc-400 font-mono text-[11px]">
                  {formatearPrecio(item.subtotal || item.precio_unitario * item.cantidad)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-zinc-400 italic">Detalle de items reservado</p>
        )}
      </div>

      {/* TOTAL */}
      <div className="flex items-center justify-between pt-1 mb-3.5">
        <span className="text-[11px] font-semibold text-zinc-400">Total</span>
        <span className="text-sm font-black font-mono text-zinc-900 dark:text-white">
          {formatearPrecio(pedido.monto_total)}
        </span>
      </div>

      {/* ACCION */}
      <div>
        {actionButton}
      </div>
    </div>
  );
}

export default KanbanBoard;