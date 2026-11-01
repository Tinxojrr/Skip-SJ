import { useEffect, useState, useCallback } from "react";
import { CreditCard, Wallet, ShieldCheck, CheckCircle2, DollarSign } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../context/AuthContext";

export function PaymentBreakdownWidget() {
  const { locatarioId, role } = useAuth();
  const [breakdown, setBreakdown] = useState({
    bancoEstadoMonto: 0,
    bancoEstadoPct: 0,
    junaebMonto: 0,
    junaebPct: 0,
    otrosMonto: 0,
    otrosPct: 0,
    totalIngresos: 0,
  });

  const fetchBreakdown = useCallback(async () => {
    try {
      let query = supabase
        .from("pedidos")
        .select("monto_total, estado, metodo_pago")
        .neq("estado", "cancelado")
        .neq("estado", "pendiente_pago");

      if (role !== "super_admin" && locatarioId) {
        query = query.eq("locatario_id", locatarioId);
      }

      const { data, error } = await query;
      if (!error && data) {
        let beMonto = 0;
        let junaebMonto = 0;
        let otrosMonto = 0;
        let total = 0;

        data.forEach((p) => {
          const monto = p.monto_total || 0;
          total += monto;

          if (p.metodo_pago === "junaeb") {
            junaebMonto += monto;
          } else if (p.metodo_pago === "mercadopago") {
            otrosMonto += monto;
          } else {
            // "otro" representa BancoEstado Open Banking / transferencias en el sistema
            beMonto += monto;
          }
        });

        setBreakdown({
          bancoEstadoMonto: beMonto,
          bancoEstadoPct: total > 0 ? Math.round((beMonto / total) * 100) : 0,
          junaebMonto: junaebMonto,
          junaebPct: total > 0 ? Math.round((junaebMonto / total) * 100) : 0,
          otrosMonto: otrosMonto,
          otrosPct: total > 0 ? Math.round((otrosMonto / total) * 100) : 0,
          totalIngresos: total,
        });
      }
    } catch (err) {
      console.error("Error obteniendo desglose de pagos:", err);
    }
  }, [locatarioId, role]);

  useEffect(() => {
    fetchBreakdown();

    const channel = supabase
      .channel("payment-breakdown-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pedidos" },
        () => {
          fetchBreakdown();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchBreakdown]);

  const methods = [
    {
      id: "bancoestado",
      name: "BancoEstado (CuentaRUT)",
      sub: "Open Banking directo sin comisiones",
      monto: breakdown.bancoEstadoMonto,
      porcentaje: breakdown.bancoEstadoPct,
      color: "bg-[#004B93]",
      barColor: "bg-blue-600",
      badge: "Open Banking",
      icon: CreditCard,
    },
    {
      id: "junaeb",
      name: "Tarjeta Junaeb BAES",
      sub: "Beca de Alimentación Estudiantil",
      monto: breakdown.junaebMonto,
      porcentaje: breakdown.junaebPct,
      color: "bg-[#00A650]",
      barColor: "bg-emerald-500",
      badge: "Subsidio Duoc",
      icon: Wallet,
    },
    {
      id: "otros",
      name: "Webpay / Tarjetas / MACH",
      sub: "Tarjetas bancarias y billeteras digitales",
      monto: breakdown.otrosMonto,
      porcentaje: breakdown.otrosPct,
      color: "bg-[#7C3AED]",
      barColor: "bg-purple-500",
      badge: "Digital",
      icon: DollarSign,
    },
  ];

  // Ahorro estimado por Open Banking sin comisión POS (~2.5% de comisión transbank ahorrada)
  const ahorroComision = Math.round(breakdown.bancoEstadoMonto * 0.025);

  return (
    <div className="bg-white dark:bg-[#131318] border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#F5A623]" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              Métodos de Pago &amp; Recaudación
            </h3>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            100% Cifrado
          </span>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-5">
          Distribución de pagos de estudiantes en el casino
        </p>

        {/* Stacked Bar Overview */}
        <div className="mb-5 space-y-2">
          <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
            {breakdown.totalIngresos === 0 ? (
              <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-full" />
            ) : (
              methods.map((m) => (
                <div
                  key={m.id}
                  style={{ width: `${m.porcentaje}%` }}
                  className={`${m.barColor} h-full transition-all duration-500`}
                  title={`${m.name}: ${m.porcentaje}%`}
                />
              ))
            )}
          </div>
          <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
            <span>CuentaRUT ({breakdown.bancoEstadoPct}%)</span>
            <span>Junaeb ({breakdown.junaebPct}%)</span>
            <span>Otros ({breakdown.otrosPct}%)</span>
          </div>
        </div>

        {/* List of Methods */}
        <div className="space-y-3.5">
          {methods.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.id}
                className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl ${m.color} flex items-center justify-center text-white flex-shrink-0 shadow-sm`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {m.name}
                      </p>
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-white dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-600">
                        {m.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {m.sub}
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-black font-mono text-zinc-950 dark:text-white">
                    ${m.monto.toLocaleString("es-CL")}
                  </p>
                  <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    {m.porcentaje}% del total
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
        <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          Ahorro estimado comisiones POS:
        </span>
        <span className="font-bold text-emerald-600 dark:text-emerald-400">
          +${ahorroComision.toLocaleString("es-CL")} CLP
        </span>
      </div>
    </div>
  );
}

export default PaymentBreakdownWidget;
