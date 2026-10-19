import { useEffect, useState, useCallback } from "react";
import {
  DollarSign,
  CheckCircle2,
  TrendingUp,
  Clock
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../context/AuthContext";

export function StatsGrid() {
  const { locatarioId, role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    ingresosTotales: 0,
    pedidosActivos: 0,
    pedidosCompletados: 0,
    ticketPromedio: 0,
  });

  const fetchMetrics = useCallback(async () => {
    if (!locatarioId && role !== 'super_admin') return;
    try {
      let query = supabase.from('pedidos').select('monto_total, estado, created_at');

      if (role !== 'super_admin' && locatarioId) {
        query = query.eq('locatario_id', locatarioId);
      }

      const { data, error } = await query;
      if (!error && data) {
        const validOrders = data.filter(p => p.estado !== 'cancelado' && p.estado !== 'pendiente_pago');
        const ingresos = validOrders.reduce((sum, p) => sum + (p.monto_total || 0), 0);
        
        const activos = data.filter(p => ['pagado', 'en_preparacion', 'listo_retiro'].includes(p.estado)).length;
        const completados = data.filter(p => p.estado === 'completado').length;
        const promedio = validOrders.length > 0 ? Math.round(ingresos / validOrders.length) : 0;

        setMetrics({
          ingresosTotales: ingresos,
          pedidosActivos: activos,
          pedidosCompletados: completados,
          ticketPromedio: promedio,
        });
      }
    } catch (err) {
      console.error("Error obteniendo métricas:", err);
    } finally {
      setLoading(false);
    }
  }, [locatarioId, role]);

  useEffect(() => {
    fetchMetrics();

    const channel = supabase.channel('stats-pedidos-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, () => {
        fetchMetrics();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMetrics]);

  const stats = [
    {
      title: "Ingresos Totales",
      value: `$${metrics.ingresosTotales.toLocaleString('es-CL')}`,
      subtext: "Ventas aprobadas",
      icon: DollarSign,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-100/80 dark:bg-emerald-500/15 border border-emerald-300/60 dark:border-emerald-500/30",
    },
    {
      title: "Pedidos en Curso",
      value: `${metrics.pedidosActivos}`,
      subtext: "En cocina o listos",
      icon: Clock,
      iconColor: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-100/80 dark:bg-amber-500/15 border border-amber-300/60 dark:border-amber-500/30",
    },
    {
      title: "Pedidos Entregados",
      value: `${metrics.pedidosCompletados}`,
      subtext: "Órdenes finalizadas",
      icon: CheckCircle2,
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-100/80 dark:bg-blue-500/15 border border-blue-300/60 dark:border-blue-500/30",
    },
    {
      title: "Ticket Promedio",
      value: `$${metrics.ticketPromedio.toLocaleString('es-CL')}`,
      subtext: "Promedio por alumno",
      icon: TrendingUp,
      iconColor: "text-purple-600 dark:text-purple-400",
      iconBg: "bg-purple-100/80 dark:bg-purple-500/15 border border-purple-300/60 dark:border-purple-500/30",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={index}
            className="bg-white dark:bg-[#131318] rounded-2xl p-5 border border-zinc-200/90 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-black font-mono text-zinc-950 dark:text-white mt-1">
                  {loading ? "..." : stat.value}
                </p>
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-2">
                  {stat.subtext}
                </p>
              </div>

              <div className={`p-2.5 rounded-xl ${stat.iconBg}`}>
                <IconComponent className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default StatsGrid;
