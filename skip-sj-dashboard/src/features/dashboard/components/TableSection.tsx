import { useEffect, useState, useCallback } from "react";
import { User, ArrowUpRight, ShoppingBag } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../context/AuthContext";
import { Link } from "react-router-dom";

interface OrderRow {
  id: string;
  codigo_retiro?: string;
  estado: string;
  monto_total: number;
  created_at: string;
  cliente_nombre?: string;
  items_resumen?: string;
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

const DEFAULT_RECENT_ORDERS: OrderRow[] = [
  {
    id: "ord-1",
    codigo_retiro: "SJ-401",
    cliente_nombre: "Martin Aburto",
    items_resumen: "2x Empanada de Pino de Horno, 1x Coca-Cola Zero",
    monto_total: 6200,
    estado: "en_preparacion",
    created_at: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
  },
  {
    id: "ord-2",
    codigo_retiro: "SJ-402",
    cliente_nombre: "Ignacio Valenzuela",
    items_resumen: "1x Choclo Grande Premium Carne, 1x Agua Mineral",
    monto_total: 5700,
    estado: "listo_retiro",
    created_at: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
  },
  {
    id: "ord-3",
    codigo_retiro: "SJ-403",
    cliente_nombre: "Camila Rojas",
    items_resumen: "1x Salchipapa San Joaquín, 1x Té Lipton",
    monto_total: 4500,
    estado: "completado",
    created_at: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
  },
  {
    id: "ord-4",
    codigo_retiro: "SJ-404",
    cliente_nombre: "Matías Soto",
    items_resumen: "1x Hot Dog Italiano Clásico, 1x Papas Fritas",
    monto_total: 4800,
    estado: "completado",
    created_at: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
  },
  {
    id: "ord-5",
    codigo_retiro: "SJ-405",
    cliente_nombre: "Fernanda Díaz",
    items_resumen: "1x Choclo Mediano Tradicional",
    monto_total: 3200,
    estado: "pagado",
    created_at: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
  },
];

export function TableSection() {
  const { locatarioId, role } = useAuth();
  const [orders, setOrders] = useState<OrderRow[]>(DEFAULT_RECENT_ORDERS);

  const fetchRecentOrders = useCallback(async () => {
    try {
      let query = supabase
        .from("pedidos")
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
        .order("created_at", { ascending: false })
        .limit(6);

      if (role !== "super_admin" && locatarioId) {
        query = query.eq("locatario_id", locatarioId);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        setOrders(data as any as OrderRow[]);
      } else {
        setOrders(DEFAULT_RECENT_ORDERS);
      }
    } catch (err) {
      console.error(err);
    }
  }, [locatarioId, role]);

  useEffect(() => {
    fetchRecentOrders();

    const channel = supabase
      .channel("table-pedidos-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pedidos" },
        () => {
          fetchRecentOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRecentOrders]);

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "completado":
        return (
          <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700">
            Entregado
          </span>
        );
      case "listo_retiro":
        return (
          <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-emerald-100 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 animate-pulse">
            Listo Retiro
          </span>
        );
      case "en_preparacion":
        return (
          <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-blue-100 dark:bg-blue-500/15 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-500/30">
            En Cocina
          </span>
        );
      case "pagado":
      default:
        return (
          <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-amber-100 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30">
            Por Preparar
          </span>
        );
    }
  };

  const getCustomerName = (order: OrderRow) => {
    if (order.cliente_nombre) return order.cliente_nombre;
    const u = order.usuarios;
    if (!u) return "Alumno Duoc";
    if (u.apodo) return u.apodo;
    if (u.p_nombre) return `${u.p_nombre} ${u.apellido_p || ""}`.trim();
    if (u.email) return u.email.split("@")[0];
    return "Alumno Duoc";
  };

  const getItemsSummary = (order: OrderRow) => {
    if (order.items_resumen) return order.items_resumen;
    const items = order.pedido_items || [];
    if (items.length === 0) return "1x Menú del Día";
    return items
      .map((i) => `${i.cantidad}x ${i.productos?.nombre_producto || "Producto"}`)
      .join(", ");
  };

  return (
    <div className="bg-white dark:bg-[#131318] rounded-2xl border border-zinc-200/90 dark:border-zinc-800 overflow-hidden shadow-sm flex flex-col justify-between">
      <div>
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-zinc-950 dark:text-white">
              Últimas Comandas Registradas
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Flujo de ventas y entrega con código único de retiro
            </p>
          </div>
          <Link
            to="/ordering/kanban"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-white hover:text-[#F5A623] dark:hover:text-[#F5A623] px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl border border-zinc-300 dark:border-zinc-700 transition shadow-sm"
          >
            <span>Ver Cocina Kanban</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-[11px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                <th className="p-3.5 pl-5">Código</th>
                <th className="p-3.5">Cliente</th>
                <th className="p-3.5">Detalle del Pedido</th>
                <th className="p-3.5">Monto Total</th>
                <th className="p-3.5">Estado</th>
                <th className="p-3.5 pr-5">Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/70 dark:divide-zinc-800/80">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition"
                >
                  <td className="p-3.5 pl-5 font-mono">
                    <span className="font-extrabold text-xs px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-300 dark:border-zinc-700 tracking-wider">
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
                  <td className="p-3.5 font-black font-mono text-zinc-950 dark:text-white text-xs">
                    ${order.monto_total.toLocaleString("es-CL")}
                  </td>
                  <td className="p-3.5">{getStatusBadge(order.estado)}</td>
                  <td className="p-3.5 pr-5 text-zinc-500 dark:text-zinc-400 font-mono text-xs">
                    {new Date(order.created_at).toLocaleTimeString("es-CL", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-3.5 px-5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5">
          <ShoppingBag className="w-3.5 h-3.5 text-emerald-500" />
          Actualización en tiempo real vía WebSocket activo
        </span>
        <span className="font-semibold text-zinc-700 dark:text-zinc-300">
          Mostrando últimos pedidos de la sede
        </span>
      </div>
    </div>
  );
}

export default TableSection;
