import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { 
  History, 
  Search, 
  User, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  ShoppingBag
} from 'lucide-react';

interface PedidoHistorial {
  id: string;
  codigo_retiro?: string;
  estado: string;
  monto_total: number;
  created_at: string;
  updated_at?: string;
  usuarios?: {
    p_nombre?: string;
    apellido_p?: string;
    apodo?: string;
    email?: string;
  } | null;
  pedido_items?: {
    id: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
    productos?: {
      nombre_producto: string;
    } | null;
  }[];
}

export const HistorialPedidosPage = () => {
  const { locatarioId, nombreLocal, role } = useAuth();
  const [pedidos, setPedidos] = useState<PedidoHistorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');

  const fetchHistorial = useCallback(async () => {
    if (!locatarioId && role !== 'super_admin') return;
    setLoading(true);

    try {
      let query = supabase
        .from('pedidos')
        .select(`
          id,
          codigo_retiro,
          estado,
          monto_total,
          created_at,
          updated_at,
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
        .order('created_at', { ascending: false });

      if (role !== 'super_admin' && locatarioId) {
        query = query.eq('locatario_id', locatarioId);
      }

      const { data, error } = await query;
      if (!error && data) {
        setPedidos(data as any as PedidoHistorial[]);
      } else if (error) {
        console.error('Error cargando historial:', error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [locatarioId, role]);

  useEffect(() => {
    fetchHistorial();
  }, [fetchHistorial]);

  const pedidosFiltrados = pedidos.filter((p) => {
    if (filtroEstado !== 'todos' && p.estado !== filtroEstado) {
      return false;
    }

    const term = search.toLowerCase();
    const codigoMatch = p.codigo_retiro?.toLowerCase().includes(term);
    const idMatch = p.id.toLowerCase().includes(term);
    const nombreMatch = (
      p.usuarios?.p_nombre?.toLowerCase().includes(term) ||
      p.usuarios?.apellido_p?.toLowerCase().includes(term) ||
      p.usuarios?.apodo?.toLowerCase().includes(term) ||
      p.usuarios?.email?.toLowerCase().includes(term)
    );

    return !search || codigoMatch || idMatch || nombreMatch;
  });

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'completado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700/60">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Entregado
          </span>
        );
      case 'listo_retiro':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Clock className="w-3 h-3" />
            Listo Retiro
          </span>
        );
      case 'en_preparacion':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Clock className="w-3 h-3" />
            En Cocina
          </span>
        );
      case 'cancelado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-md bg-red-500/10 text-red-400 border border-red-500/20">
            <XCircle className="w-3 h-3" />
            Cancelado
          </span>
        );
      case 'pagado':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Por Preparar
          </span>
        );
    }
  };

  const getNombreCliente = (p: PedidoHistorial) => {
    if (p.usuarios?.apodo) return p.usuarios.apodo;
    if (p.usuarios?.p_nombre) {
      return `${p.usuarios.p_nombre} ${p.usuarios.apellido_p || ''}`.trim();
    }
    if (p.usuarios?.email) return p.usuarios.email.split('@')[0];
    return 'Alumno Duoc';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#111116] p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#F5A623]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Auditoría &bull; {nombreLocal || 'Mi Local'}
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white mt-1">
            Historial de Pedidos
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Registro y trazabilidad de órdenes pasadas
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text"
              placeholder="Buscar código o alumno..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 w-56 font-medium"
            />
          </div>

          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="py-2 px-3 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 cursor-pointer"
          >
            <option value="todos">Todos los estados</option>
            <option value="completado">Solo Entregados</option>
            <option value="listo_retiro">Listos para Retiro</option>
            <option value="en_preparacion">En Cocina</option>
            <option value="pagado">Por Preparar</option>
            <option value="cancelado">Cancelados</option>
          </select>

          <button 
            onClick={fetchHistorial}
            className="p-2 text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl transition border border-zinc-200 dark:border-zinc-700/60"
            title="Refrescar"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white dark:bg-[#111116] rounded-2xl border border-zinc-200 dark:border-zinc-800/80 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-zinc-400 text-xs">
            <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin text-[#F5A623]" />
            <span>Cargando historial de pedidos...</span>
          </div>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="p-12 text-center text-zinc-400 text-xs">
            <ShoppingBag className="w-8 h-8 mx-auto mb-2 stroke-1 opacity-30" />
            <p className="font-semibold text-zinc-700 dark:text-zinc-300">No se encontraron pedidos</p>
            <p className="text-zinc-400 mt-0.5">Prueba cambiando los filtros de búsqueda</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  <th className="p-3.5 pl-5">Código Retiro</th>
                  <th className="p-3.5">ID Orden</th>
                  <th className="p-3.5">Alumno</th>
                  <th className="p-3.5">Detalle de Productos</th>
                  <th className="p-3.5">Total</th>
                  <th className="p-3.5">Estado</th>
                  <th className="p-3.5 pr-5">Fecha y Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {pedidosFiltrados.map((p) => {
                  const items = p.pedido_items || [];
                  const fecha = new Date(p.created_at);

                  return (
                    <tr key={p.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition">
                      <td className="p-3.5 pl-5 font-mono">
                        <span className="font-bold text-sm px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 tracking-wider">
                          {p.codigo_retiro || '----'}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-zinc-400">
                        #{p.id.substring(0, 8)}
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5 font-medium text-zinc-800 dark:text-zinc-200">
                          <User className="w-3 h-3 text-zinc-400" />
                          <span>{getNombreCliente(p)}</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-zinc-600 dark:text-zinc-400 max-w-sm">
                        {items.length > 0 ? (
                          <div className="space-y-0.5">
                            {items.map((item, idx) => (
                              <div key={item.id || idx}>
                                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{item.cantidad}x</span> {item.productos?.nombre_producto || 'Producto'}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="italic text-zinc-400">Sin items registrados</span>
                        )}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-zinc-900 dark:text-white">
                        ${p.monto_total.toLocaleString('es-CL')}
                      </td>
                      <td className="p-3.5">
                        {getStatusBadge(p.estado)}
                      </td>
                      <td className="p-3.5 pr-5 font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                        <div>{fecha.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}</div>
                        <div className="text-[10px] text-zinc-500">{fecha.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistorialPedidosPage;
