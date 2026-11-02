import { useEffect, useState, useCallback } from "react";
import {
  DollarSign,
  CheckCircle2,
  TrendingUp,
  Clock,
  Flame,
  CreditCard,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../context/AuthContext";

interface StatsGridProps {
  periodo?: "hoy" | "semana" | "mes";
}

export function StatsGrid({ periodo = "hoy" }: StatsGridProps) {
  const { locatarioId, role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    ingresosTotales: 0,
    pedidosActivos: 0,
    pedidosCompletados: 0,
    ticketPromedio: 0,
    tiempoPromedioMin: 0,
    horaPico: "Sin registros",
    porcentajeBancoEstado: 0,
    comparativaPorcentaje: 0,
  });

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      const now = new Date();
      let startDate = new Date();
      if (periodo === "hoy") {
        startDate.setHours(0, 0, 0, 0);
      } else if (periodo === "semana") {
        startDate.setDate(now.getDate() - 7);
      } else if (periodo === "mes") {
        startDate.setDate(now.getDate() - 30);
      }

      let query = supabase
        .from("pedidos")
        .select("monto_total, estado, metodo_pago, created_at, updated_at")
        .gte("created_at", startDate.toISOString());

      if (role !== "super_admin" && locatarioId) {
        query = query.eq("locatario_id", locatarioId);
      }

      const { data, error } = await query;
      if (!error && data) {
        const validOrders = data.filter(
          (p) => p.estado !== "cancelado" && p.estado !== "pendiente_pago"
        );
        const ingresos = validOrders.reduce((sum, p) => sum + (p.monto_total || 0), 0);
        const activos = data.filter((p) =>
          ["pagado", "en_preparacion", "listo_retiro"].includes(p.estado)
        ).length;
        const completados = data.filter((p) => p.estado === "completado").length;
        const promedio = validOrders.length > 0 ? Math.round(ingresos / validOrders.length) : 0;

        // Calcular tiempo de preparación promedio en completados
        const completedWithTimes = data.filter(
          (p) => p.estado === "completado" && p.updated_at && p.created_at
        );
        let avgMinutes = 0;
        if (completedWithTimes.length > 0) {
          const totalDiffMs = completedWithTimes.reduce((acc, p) => {
            const diff = new Date(p.updated_at).getTime() - new Date(p.created_at).getTime();
            return acc + (diff > 0 ? diff : 0);
          }, 0);
          avgMinutes = Math.round((totalDiffMs / completedWithTimes.length / 60000) * 10) / 10;
        }

        // Calcular hora pico
        const hoursMap: { [hour: number]: number } = {};
        validOrders.forEach((p) => {
          const hour = new Date(p.created_at).getHours();
          hoursMap[hour] = (hoursMap[hour] || 0) + 1;
        });

        let peakHourStr = "Sin registros";
        let maxCount = 0;
        for (const [hour, count] of Object.entries(hoursMap)) {
          if (count > maxCount) {
            maxCount = count;
            const h = parseInt(hour, 10);
            peakHourStr = `${h.toString().padStart(2, "0")}:00 - ${(h + 1).toString().padStart(2, "0")}:00`;
          }
        }

        // Calcular porcentajes de método de pago bancario / digital
        const totalPagados = validOrders.length;
        const bancoEstadoCount = validOrders.filter(
          (p) => p.metodo_pago === "otro" || p.metodo_pago === "mercadopago"
        ).length;

        const pctBanco = totalPagados > 0 ? Math.round((bancoEstadoCount / totalPagados) * 100) : 0;

        setMetrics({
          ingresosTotales: ingresos,
          pedidosActivos: activos,
          pedidosCompletados: completados,
          ticketPromedio: promedio,
          tiempoPromedioMin: avgMinutes,
          horaPico: peakHourStr,
          porcentajeBancoEstado: pctBanco,
          comparativaPorcentaje: validOrders.length > 0 ? 100 : 0,
        });
      } else {
        setMetrics({
          ingresosTotales: 0,
          pedidosActivos: 0,
          pedidosCompletados: 0,
          ticketPromedio: 0,
          tiempoPromedioMin: 0,
          horaPico: "Sin registros",
          porcentajeBancoEstado: 0,
          comparativaPorcentaje: 0,
        });
      }
    } catch (err) {
      console.error("Error obteniendo métricas:", err);
    } finally {
      setLoading(false);
    }
  }, [locatarioId, role, periodo]);

  useEffect(() => {
    fetchMetrics();

    const channel = supabase
      .channel("stats-pedidos-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pedidos" },
        () => {
          fetchMetrics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMetrics]);

  const stats = [
    {
      title: periodo === "hoy" ? "Ingresos de Hoy" : periodo === "semana" ? "Ventas Semanales" : "Ventas del Mes",
      value: `$${metrics.ingresosTotales.toLocaleString("es-CL")}`,
      badgeText: metrics.ingresosTotales > 0 ? "En vivo" : "Sin ventas",
      badgeColor: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20",
      subtext: "Recaudación del período",
      icon: DollarSign,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-100/80 dark:bg-emerald-500/15 border border-emerald-300/60 dark:border-emerald-500/30",
    },
    {
      title: "Comandas en Cocina",
      value: `${metrics.pedidosActivos} activas`,
      badgeText: `${metrics.pedidosCompletados} entregadas`,
      badgeColor: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20",
      subtext: "En preparación o retiro",
      icon: Clock,
      iconColor: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-100/80 dark:bg-amber-500/15 border border-amber-300/60 dark:border-amber-500/30",
    },
    {
      title: "Ticket Promedio",
      value: `$${metrics.ticketPromedio.toLocaleString("es-CL")}`,
      badgeText: metrics.ticketPromedio > 0 ? "Real" : "Sin datos",
      badgeColor: "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20",
      subtext: "Gasto promedio por comanda",
      icon: TrendingUp,
      iconColor: "text-purple-600 dark:text-purple-400",
      iconBg: "bg-purple-100/80 dark:bg-purple-500/15 border border-purple-300/60 dark:border-purple-500/30",
    },
    {
      title: "SLA / Tiempo Entrega",
      value: metrics.tiempoPromedioMin > 0 ? `${metrics.tiempoPromedioMin} min` : "N/A",
      badgeText: metrics.tiempoPromedioMin > 0 && metrics.tiempoPromedioMin <= 10 ? "Óptimo" : "En curso",
      badgeColor: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20",
      subtext: "Promedio preparación mesón",
      icon: CheckCircle2,
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-100/80 dark:bg-blue-500/15 border border-blue-300/60 dark:border-blue-500/30",
    },
    {
      title: "Hora Punta",
      value: metrics.horaPico,
      badgeText: metrics.horaPico !== "Sin registros" ? "Mayor flujo" : "En espera",
      badgeColor: "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20",
      subtext: "Horario de mayor demanda",
      icon: Flame,
      iconColor: "text-rose-600 dark:text-rose-400",
      iconBg: "bg-rose-100/80 dark:bg-rose-500/15 border border-rose-300/60 dark:border-rose-500/30",
    },
    {
      title: "CuentaRUT & Webpay",
      value: `${metrics.porcentajeBancoEstado}%`,
      badgeText: "Bancario",
      badgeColor: "bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-500/20",
      subtext: "Transacciones oficiales",
      icon: CreditCard,
      iconColor: "text-teal-600 dark:text-teal-400",
      iconBg: "bg-teal-100/80 dark:bg-teal-500/15 border border-teal-300/60 dark:border-teal-500/30",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={index}
            className="bg-white dark:bg-[#131318] rounded-2xl p-4 border border-zinc-200/90 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 flex flex-col justify-between"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 line-clamp-1">
                {stat.title}
              </p>
              <div className={`p-2 rounded-xl flex-shrink-0 ${stat.iconBg}`}>
                <IconComponent className={`w-4 h-4 ${stat.iconColor}`} />
              </div>
            </div>

            <div className="my-2">
              <p className="text-xl font-black font-mono text-zinc-950 dark:text-white">
                {loading ? "..." : stat.value}
              </p>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
              <span className="text-zinc-500 dark:text-zinc-400 line-clamp-1">
                {stat.subtext}
              </span>
              <span
                className={`px-1.5 py-0.5 rounded font-bold text-[10px] flex-shrink-0 ${stat.badgeColor}`}
              >
                {stat.badgeText}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default StatsGrid;
