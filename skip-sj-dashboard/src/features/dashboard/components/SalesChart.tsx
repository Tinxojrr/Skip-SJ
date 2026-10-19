import { useEffect, useState, useCallback } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../context/AuthContext";
import { PieChart as PieIcon } from "lucide-react";

export function SalesChart() {
  const { locatarioId, role } = useAuth();
  const [data, setData] = useState([
    { name: "Por Preparar", value: 1, color: "#f59e0b" },
    { name: "En Cocina", value: 1, color: "#3b82f6" },
    { name: "Listos Retiro", value: 1, color: "#10b981" },
    { name: "Entregados", value: 1, color: "#64748b" },
  ]);
  const [totalCount, setTotalCount] = useState(0);

  const fetchDistribution = useCallback(async () => {
    if (!locatarioId && role !== 'super_admin') return;
    try {
      let query = supabase.from('pedidos').select('estado');
      if (role !== 'super_admin' && locatarioId) {
        query = query.eq('locatario_id', locatarioId);
      }

      const { data: pedidos, error } = await query;
      if (!error && pedidos) {
        const pagados = pedidos.filter(p => p.estado === 'pagado').length;
        const cocina = pedidos.filter(p => p.estado === 'en_preparacion').length;
        const listos = pedidos.filter(p => p.estado === 'listo_retiro').length;
        const entregados = pedidos.filter(p => p.estado === 'completado').length;

        const total = pagados + cocina + listos + entregados;
        setTotalCount(total);

        if (total > 0) {
          setData([
            { name: "Por Preparar", value: pagados, color: "#f59e0b" },
            { name: "En Cocina", value: cocina, color: "#3b82f6" },
            { name: "Listos Retiro", value: listos, color: "#10b981" },
            { name: "Entregados", value: entregados, color: "#64748b" },
          ].filter(item => item.value > 0));
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, [locatarioId, role]);

  useEffect(() => {
    fetchDistribution();
    const channel = supabase.channel('chart-distribution')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, () => {
        fetchDistribution();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchDistribution]);

  return (
    <div className="bg-white dark:bg-[#131318] p-6 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <PieIcon className="w-4 h-4 text-[#F5A623]" />
          <h3 className="text-base font-bold text-zinc-950 dark:text-white">
            Flujo de Pedidos
          </h3>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Distribución por estado actual
        </p>
      </div>

      <div className="h-44 relative my-3 flex items-center justify-center">
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
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Centro del Donut */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-black font-mono text-zinc-950 dark:text-white">
            {totalCount}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">
            Total
          </span>
        </div>
      </div>

      <div className="space-y-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
        {data.map((item, index) => (
          <div className="flex items-center justify-between text-xs" key={index}>
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-zinc-700 dark:text-zinc-300 font-semibold">
                {item.name}
              </span>
            </div>
            <div className="font-extrabold text-zinc-950 dark:text-white font-mono text-xs">
              {item.value} {item.value === 1 ? 'pedido' : 'pedidos'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SalesChart;