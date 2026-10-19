import { useEffect, useState, useCallback } from "react";
import { User, ArrowUpRight } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../context/AuthContext";
import { Link } from "react-router-dom";

interface OrderRow {
  id: string;
  codigo_retiro?: string;
  estado: string;
  monto_total: number;
  created_at: string;
  usuarios?: {
    p_nombre?: string;
    apellido_p?: string;
    apodo?: string;
    email?: string;
  } | null;
  pedido_items?: {
    cantidad: number;
    productos?: {
      nombre_producto: string;
    } | null;
  }[];
}

export function TableSection() {
  const { locatarioId, role } = useAuth();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecentOrders = useCallback(async () => {
    if (!locatarioId && role !== 'super_admin') return;
    try {
      let query = supabase
        .from('pedidos')
        .select(`
          id,
          codigo_retiro,
          estado,
          monto_total,
          created_at,
          usuarios (
            p_nombre,
            apellido_p,
            apodo,
            email
          ),
          pedido_items (
            cantidad,
            productos (
              nombre_producto
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(6);

      if (role !== 'super_admin' && locatarioId) {
        query = query.eq('locatario_id', locatarioId);
      }

      const { data, error } = await query;
      if (!error && data) {
        setOrders(data as any as OrderRow[]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [locatarioId, role]);

  useEffect(() => {
    fetchRecentOrders();

    const channel = supabase.channel('table-pedidos-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, () => {
        fetchRecentOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRecentOrders]);

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "completado":
        return <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700">Entregado</span>;
      case "listo_retiro":
        return <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-emerald-100 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">Listo Retiro</span>;
      case "en_preparacion":
        return <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-blue-100 dark:bg-blue-500/15 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-500/30">En Cocina</span>;
      case "pagado":
      default:
        return <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-amber-100 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30">Por Preparar</span>;
    }
  };

  const getCustomerName = (order: OrderRow) => {
    if (order.usuarios?.apodo) return order.usuarios.apodo;
    if (order.usuarios?.p_nombre) {
      return `${order.usuarios.p_nombre} ${order.usuarios.apellido_p || ''}`.trim();
    }
    if (order.usuarios?.email) {
      return order.usuarios.email.split('@')[0];
    }
    return "Alumno Duoc";
  };

  const getItemsSummary = (order: OrderRow) => {
    const items = order.pedido_items || [];
    if (items.length === 0) return "1x Pedido general";
    return items.map(i => `${i.cantidad}x ${i.productos?.nombre_producto || 'Producto'}`).join(', ');
  };

  return (
    <div className="bg-white dark:bg-[#131318] rounded-2xl border border-zinc-200/90 dark:border-zinc-800 overflow-hidden shadow-sm">
      <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-zinc-950 dark:text-white">
            Últimos Pedidos Registrados
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Actividad de ventas en tiempo real
          </p>
        </div>
        <Link 
          to="/ordering/kanban" 
          className="inline-flex items-center gap-1 text-xs font-bold text-[#0B2A6B] dark:text-[#F5A623] hover:underline px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl border border-zinc-300 dark:border-zinc-700 transition"
        >
          <span>Tablero en Vivo</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-10 text-center text-zinc-400 text-xs font-medium">Cargando pedidos...</div>
        ) : orders.length === 0 ? (
          <div className="p-10 text-center text-zinc-400 text-xs font-medium">Aún no hay pedidos registrados</div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-[11px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                <th className="p-3.5 pl-5">Código</th>
                <th className="p-3.5">Cliente</th>
                <th className="p-3.5">Detalle</th>
                <th className="p-3.5">Total</th>
                <th className="p-3.5">Estado</th>
                <th className="p-3.5 pr-5">Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/70 dark:divide-zinc-800/80">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition">
                  <td className="p-3.5 pl-5 font-mono">
                    <span className="font-extrabold text-sm px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-300 dark:border-zinc-700 tracking-wider">
                      {order.codigo_retiro || `#${order.id.substring(0, 4)}`}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-1.5 font-semibold text-zinc-900 dark:text-zinc-100">
                      <User className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{getCustomerName(order)}</span>
                    </div>
                  </td>
                  <td className="p-3.5 text-zinc-700 dark:text-zinc-300 font-medium max-w-xs truncate">
                    {getItemsSummary(order)}
                  </td>
                  <td className="p-3.5 font-black font-mono text-zinc-950 dark:text-white text-sm">
                    ${order.monto_total.toLocaleString('es-CL')}
                  </td>
                  <td className="p-3.5">
                    {getStatusBadge(order.estado)}
                  </td>
                  <td className="p-3.5 pr-5 text-zinc-500 dark:text-zinc-400 font-mono text-xs">
                    {new Date(order.created_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default TableSection;
