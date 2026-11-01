import { useEffect, useState, useCallback } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../context/AuthContext";
import { PieChart as PieIcon, Clock, CheckCircle2 } from "lucide-react";

interface FlowItem {
  name: string;
  value: number;
  color: string;
}

export function SalesChart() {
  const { locatarioId, role } = useAuth();
  const [data, setData] = useState<FlowItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [avgTimeMin, setAvgTimeMin] = useState<number | null>(null);

  const fetchDistribution = useCallback(async () => {
    try {
      let query = supabase.from("pedidos").select("estado, created_at, updated_at");
      if (role !== "super_admin" && locatarioId) {
        query = query.eq("locatario_id", locatarioId);
      }

      const { data: pedidos, error } = await query;
      if (!error && pedidos) {
        const pagados = pedidos.filter((p) => p.estado === "pagado").length;
        const cocina = pedidos.filter((p) => p.estado === "en_preparacion").length;
        const listos = pedidos.filter((p) => p.estado === "listo_retiro").length;
        const entregados = pedidos.filter((p) => p.estado === "completado").length;

        const total = pagados + cocina + listos + entregados;
        setTotalCount(total);

        const items: FlowItem[] = [
          { name: "Por Preparar", value: pagados, color: "#f59e0b" },
          { name: "En Cocina", value: cocina, color: "#3b82f6" },
          { name: "Listos Retiro", value: listos, color: "#10b981" },
          { name: "Entregados", value: entregados, color: "#64748b" },
        ].filter((item) => item.value > 0);

        setData(items);

        // Calcular tiempo promedio real de entrega
        const completados = pedidos.filter(
          (p) => p.estado === "completado" && p.updated_at && p.created_at
        );
        if (completados.length > 0) {
          const totalMs = completados.reduce((acc, p) => {
            const diff = new Date(p.updated_at).getTime() - new Date(p.created_at).getTime();
            return acc + (diff > 0 ? diff : 0);
          }, 0);
          setAvgTimeMin(Math.round((totalMs / completados.length / 60000) * 10) / 10);
        } else {
          setAvgTimeMin(null);
        }
      } else {
        setData([]);
        setTotalCount(0);
        setAvgTimeMin(null);
      }
    } catch (err) {
      console.error(err);
      setData([]);
      setTotalCount(0);
      setAvgTimeMin(null);
    }
  }, [locatarioId, role]);

  useEffect(() => {
    fetchDistribution();
    const channel = supabase
      .channel("chart-distribution")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pedidos" },
        () => {
          fetchDistribution();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchDistribution]);

  return (
    <div className="bg-white dark:bg-[#131318] p-6 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-[#F5A623]" />
            <h3 className="text-base font-bold text-zinc-950 dark:text-white">
              Embudo de Cocina
            </h3>
          </div>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
            {totalCount} Comandas
          </span>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Distribución por estado actual en mesón
        </p>

        <div className="h-44 relative my-3 flex items-center justify-center">
          {totalCount === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-4">
              <span className="text-3xl mb-1">⏱️</span>
              <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
                Sin comandas activas
              </p>
              <p className="text-[10px] text-zinc-400">
                Los nuevos pedidos aparecerán aquí en vivo
              </p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={72}
                    paddingAngle={3}
                    stroke="rgba(0,0,0,0.1)"
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: "8px",
                      color: "#ffffff",
                      fontSize: "12px",
                      fontFamily: "monospace",
                    }}
                    formatter={(val: any, name: any) => [
                      `${val} pedidos (${Math.round((Number(val) / (totalCount || 1)) * 100)}%)`,
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black font-mono text-zinc-950 dark:text-white">
                  {totalCount}
                </span>
                <span className="text-[10px] uppercase font-bold text-zinc-400">
                  Total
                </span>
              </div>
            </>
          )}
        </div>

        {data.length > 0 && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            {data.map((item) => (
              <div
                key={item.name}
                className="flex items-center gap-2 p-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-zinc-800"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-200 truncate text-[11px]">
                    {item.name}
                  </p>
                  <p className="text-zinc-400 font-mono text-[10px]">
                    {item.value} pedidos ({Math.round((item.value / (totalCount || 1)) * 100)}%)
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-blue-500" />
          Tiempo promedio: <strong>{avgTimeMin !== null ? `${avgTimeMin} min` : "N/A"}</strong>
        </span>
        <span className={totalCount > 0 ? "text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1" : "text-zinc-400 flex items-center gap-1"}>
          <CheckCircle2 className="w-3.5 h-3.5" />
          {totalCount > 0 ? "Monitoreo en vivo" : "Sin pedidos"}
        </span>
      </div>
    </div>
  );
}

export default SalesChart;
