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

const getEmptyWeek = (): DailyRevenue[] => {
  const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const list: DailyRevenue[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    list.push({ dia: diasSemana[d.getDay()], ventas: 0, pedidos: 0 });
  }
  return list;
};

export function RevenueChart() {
  const { locatarioId, role } = useAuth();
  const [data, setData] = useState<DailyRevenue[]>(getEmptyWeek());
  const [totalSemana, setTotalSemana] = useState(0);
  const [metricView, setMetricView] = useState<"ventas" | "pedidos">("ventas");

  const fetchWeeklyRevenue = useCallback(async () => {
    try {
      const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
      const diasMap: { [key: string]: { ventas: number; pedidos: number } } = {};

      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = diasSemana[d.getDay()];
        diasMap[key] = { ventas: 0, pedidos: 0 };
      }

      // 7 días atrás
      const sieteDiasAtras = new Date();
      sieteDiasAtras.setDate(sieteDiasAtras.getDate() - 7);
      sieteDiasAtras.setHours(0, 0, 0, 0);

      let query = supabase
        .from("pedidos")
        .select("monto_total, estado, created_at")
        .neq("estado", "cancelado")
        .neq("estado", "pendiente_pago")
        .gte("created_at", sieteDiasAtras.toISOString());

      if (role !== "super_admin" && locatarioId) {
        query = query.eq("locatario_id", locatarioId);
      }

      const { data: pedidos, error } = await query;
      if (!error && pedidos) {
        let sumaTotal = 0;
        pedidos.forEach((p) => {
          const fechaPedido = new Date(p.created_at);
          const diaNom = diasSemana[fechaPedido.getDay()];
          if (diasMap[diaNom]) {
            diasMap[diaNom].ventas += p.monto_total || 0;
            diasMap[diaNom].pedidos += 1;
          }
          sumaTotal += p.monto_total || 0;
        });

        const chartData: DailyRevenue[] = Object.keys(diasMap).map((dia) => ({
          dia,
          ventas: diasMap[dia].ventas,
          pedidos: diasMap[dia].pedidos,
        }));

        setData(chartData);
        setTotalSemana(sumaTotal);
      } else {
        setData(getEmptyWeek());
        setTotalSemana(0);
      }
    } catch (err) {
      console.error(err);
      setData(getEmptyWeek());
      setTotalSemana(0);
    }
  }, [locatarioId, role]);

  useEffect(() => {
    fetchWeeklyRevenue();

    const channel = supabase
      .channel("chart-revenue-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pedidos" },
        () => {
          fetchWeeklyRevenue();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchWeeklyRevenue]);

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
              Comparativa de volumen de comanda por día en Sede San Joaquín
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
                ${totalSemana.toLocaleString("es-CL")}
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
                  Día de mayor venta: <strong>{best.dia} (${best.ventas.toLocaleString("es-CL")} CLP)</strong>
                </>
              );
            }
            return <span>Sin ventas registradas en los últimos 7 días</span>;
          })()}
        </span>
        <span className={totalSemana > 0 ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-zinc-400"}>
          {totalSemana > 0 ? "En vivo (Sede San Joaquín)" : "Sin actividad"}
        </span>
      </div>
    </div>
  );
}

export default RevenueChart;
