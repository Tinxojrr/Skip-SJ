import { useEffect, useState, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../context/AuthContext";
import { TrendingUp, BarChart2 } from "lucide-react";

interface DailyRevenue {
  dia: string;
  ventas: number;
  pedidos: number;
}

interface RevenueChartProps {
  periodo?: "hoy" | "semana" | "mes";
}

export function RevenueChart({ periodo = "hoy" }: RevenueChartProps) {
  const { locatarioId, role } = useAuth();
  const [data, setData] = useState<DailyRevenue[]>([]);
  const [totalPeriodo, setTotalPeriodo] = useState(0);
  const [metricView, setMetricView] = useState<"ventas" | "pedidos">("ventas");

  const fetchRevenue = useCallback(async () => {
    try {
      const now = new Date();
      let startDate = new Date();
      let chartBuckets: { label: string; filterFn: (d: Date) => boolean; ventas: number; pedidos: number }[] = [];

      if (periodo === "hoy") {
        startDate.setHours(0, 0, 0, 0);
        const hours = [
          { label: "09:00", hStart: 0, hEnd: 10 },
          { label: "11:00", hStart: 10, hEnd: 12 },
          { label: "13:00", hStart: 12, hEnd: 14 },
          { label: "15:00", hStart: 14, hEnd: 16 },
          { label: "17:00", hStart: 16, hEnd: 18 },
          { label: "19:00", hStart: 18, hEnd: 20 },
          { label: "21:00", hStart: 20, hEnd: 22 },
          { label: "23:00", hStart: 22, hEnd: 24 },
        ];
        chartBuckets = hours.map((h) => ({
          label: h.label,
          filterFn: (d: Date) => d.getHours() >= h.hStart && d.getHours() < h.hEnd,
          ventas: 0,
          pedidos: 0,
        }));
      } else if (periodo === "semana") {
        startDate.setDate(now.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dayName = diasSemana[d.getDay()];
          const dateStr = d.toDateString();
          chartBuckets.push({
            label: dayName,
            filterFn: (pedDate: Date) => pedDate.toDateString() === dateStr,
            ventas: 0,
            pedidos: 0,
          });
        }
      } else if (periodo === "mes") {
        startDate.setDate(now.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);
        chartBuckets = [
          {
            label: "Sem 1 (Hace 4)",
            filterFn: (d: Date) => {
              const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
              return diffDays >= 21 && diffDays <= 31;
            },
            ventas: 0,
            pedidos: 0,
          },
          {
            label: "Sem 2 (Hace 3)",
            filterFn: (d: Date) => {
              const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
              return diffDays >= 14 && diffDays < 21;
            },
            ventas: 0,
            pedidos: 0,
          },
          {
            label: "Sem 3 (Hace 2)",
            filterFn: (d: Date) => {
              const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
              return diffDays >= 7 && diffDays < 14;
            },
            ventas: 0,
            pedidos: 0,
          },
          {
            label: "Esta Semana",
            filterFn: (d: Date) => {
              const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
              return diffDays >= 0 && diffDays < 7;
            },
            ventas: 0,
            pedidos: 0,
          },
        ];
      }

      let query = supabase
        .from("pedidos")
        .select("monto_total, estado, created_at")
        .neq("estado", "cancelado")
        .neq("estado", "pendiente_pago")
        .gte("created_at", startDate.toISOString());

      if (role !== "super_admin" && locatarioId) {
        query = query.eq("locatario_id", locatarioId);
      }

      const { data: pedidos, error } = await query;
      if (!error && pedidos) {
        let sumaTotal = 0;
        pedidos.forEach((p) => {
          const pDate = new Date(p.created_at);
          const bucket = chartBuckets.find((b) => b.filterFn(pDate));
          if (bucket) {
            bucket.ventas += p.monto_total || 0;
            bucket.pedidos += 1;
          }
          sumaTotal += p.monto_total || 0;
        });

        setData(
          chartBuckets.map((b) => ({
            dia: b.label,
            ventas: b.ventas,
            pedidos: b.pedidos,
          }))
        );
        setTotalPeriodo(sumaTotal);
      } else {
        setData([]);
        setTotalPeriodo(0);
      }
    } catch (err) {
      console.error(err);
      setData([]);
      setTotalPeriodo(0);
    }
  }, [locatarioId, role, periodo]);

  useEffect(() => {
    fetchRevenue();

    const channel = supabase
      .channel("chart-revenue-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pedidos" },
        () => {
          fetchRevenue();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRevenue]);

  return (
    <div className="bg-white dark:bg-[#131318] rounded-2xl border border-zinc-200/90 dark:border-zinc-800 p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#F5A623]" />
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Curva de Recaudación &amp; Demanda
              </h3>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {periodo === "hoy"
                ? "Distribución de ventas por bloque horario del día"
                : periodo === "mes"
                ? "Comparativa de recaudación en las últimas 4 semanas"
                : "Comparativa de volumen de comanda por día de la semana"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex p-1 bg-zinc-100 dark:bg-[#1c1c24] rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold">
              <button
                onClick={() => setMetricView("ventas")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  metricView === "ventas"
                    ? "bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm font-bold"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                Ingresos ($)
              </button>
              <button
                onClick={() => setMetricView("pedidos")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  metricView === "pedidos"
                    ? "bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm font-bold"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                Comandas (N°)
              </button>
            </div>

            <div className="text-right pl-3 border-l border-zinc-200 dark:border-zinc-800 hidden sm:block">
              <p className="text-[10px] uppercase font-bold text-zinc-400">
                Total Ciclo
              </p>
              <p className="text-base font-black font-mono text-zinc-950 dark:text-white">
                ${totalPeriodo.toLocaleString("es-CL")}
              </p>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="rgba(255,255,255,0.05)"
              />
              <XAxis
                dataKey="dia"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#71717A", fontSize: 12, fontWeight: 600 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#71717A", fontSize: 11 }}
                tickFormatter={(val) =>
                  metricView === "ventas" ? `$${val / 1000}k` : `${val}`
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "10px",
                  color: "#ffffff",
                  fontSize: "12px",
                  fontFamily: "monospace",
                }}
                formatter={(val: any) => [
                  metricView === "ventas"
                    ? `$${Number(val).toLocaleString("es-CL")} CLP`
                    : `${val} comandas`,
                  metricView === "ventas" ? "Ventas" : "Pedidos",
                ]}
              />
              <Bar
                dataKey={metricView === "ventas" ? "ventas" : "pedidos"}
                fill="#F5A623"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5">
          <BarChart2 className="w-3.5 h-3.5 text-[#F5A623]" />
          {(() => {
            const best = [...data].sort((a, b) => b.ventas - a.ventas)[0];
            if (best && best.ventas > 0) {
              return (
                <>
                  Punto de mayor venta: <strong>{best.dia} (${best.ventas.toLocaleString("es-CL")} CLP)</strong>
                </>
              );
            }
            return <span>Sin ventas registradas en el período seleccionado</span>;
          })()}
        </span>
        <span className={totalPeriodo > 0 ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-zinc-400"}>
          {totalPeriodo > 0 ? "En vivo (Sede San Joaquín)" : "Sin actividad"}
        </span>
      </div>
    </div>
  );
}

export default RevenueChart;
