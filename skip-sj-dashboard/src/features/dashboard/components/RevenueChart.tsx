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
import { DollarSign, TrendingUp } from "lucide-react";

interface DailyRevenue {
  dia: string;
  ventas: number;
  pedidos: number;
}

export function RevenueChart() {
  const { locatarioId, role } = useAuth();
  const [data, setData] = useState<DailyRevenue[]>([]);
  const [totalSemana, setTotalSemana] = useState(0);

  const fetchWeeklyRevenue = useCallback(async () => {
    if (!locatarioId && role !== 'super_admin') return;
    try {
      let query = supabase
        .from('pedidos')
        .select('monto_total, estado, created_at')
        .neq('estado', 'cancelado')
        .neq('estado', 'pendiente_pago');

      if (role !== 'super_admin' && locatarioId) {
        query = query.eq('locatario_id', locatarioId);
      }

      const { data: pedidos, error } = await query;
      if (!error && pedidos) {
        const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const diasMap: { [key: string]: { ventas: number; pedidos: number } } = {};

        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const key = diasSemana[d.getDay()];
          diasMap[key] = { ventas: 0, pedidos: 0 };
        }

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
      }
    } catch (err) {
      console.error(err);
    }
  }, [locatarioId, role]);

  useEffect(() => {
    fetchWeeklyRevenue();

    const channel = supabase.channel('chart-revenue-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, () => {
        fetchWeeklyRevenue();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchWeeklyRevenue]);

  return (
    <div className="bg-white dark:bg-[#131318] rounded-2xl border border-zinc-200/90 dark:border-zinc-800 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#F5A623]" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              Ingresos por Día
            </h3>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Rendimiento de ventas de la semana
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl">
          <DollarSign className="w-4 h-4 text-[#F5A623]" />
          <span className="text-xs font-bold font-mono text-zinc-900 dark:text-amber-400">
            Total: ${totalSemana.toLocaleString('es-CL')}
          </span>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -5, bottom: 0 }}>
            <defs>
              <linearGradient id="solidBarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F5A623" stopOpacity={1} />
                <stop offset="100%" stopColor="#D97706" stopOpacity={0.8} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(120, 120, 120, 0.15)" />
            <XAxis 
              dataKey="dia" 
              axisLine={{ stroke: "rgba(120, 120, 120, 0.2)" }} 
              tickLine={false} 
              tick={{ fill: "#52525b", fontSize: 12, fontWeight: 600 }} 
            />
            <YAxis
              axisLine={{ stroke: "rgba(120, 120, 120, 0.2)" }}
              tickLine={false}
              tick={{ fill: "#52525b", fontSize: 11, fontFamily: "monospace", fontWeight: 600 }}
              tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
            />
            <Tooltip
              cursor={{ fill: "rgba(120, 120, 120, 0.08)" }}
              formatter={(value: any) => [`$${Number(value).toLocaleString('es-CL')}`, "Ventas"]}
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "10px",
                color: "#ffffff",
                fontSize: "12px",
                fontFamily: "monospace",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)"
              }}
            />
            <Bar
              dataKey="ventas"
              fill="url(#solidBarGradient)"
              radius={[6, 6, 0, 0]}
              maxBarSize={44}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default RevenueChart;