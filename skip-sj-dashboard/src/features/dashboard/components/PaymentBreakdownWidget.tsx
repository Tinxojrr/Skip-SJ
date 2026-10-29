import { CreditCard, Wallet, ShieldCheck, CheckCircle2, DollarSign } from "lucide-react";

export function PaymentBreakdownWidget() {
  const methods = [
    {
      id: "bancoestado",
      name: "BancoEstado (CuentaRUT)",
      sub: "Open Banking directo sin comisiones",
      monto: 242730,
      porcentaje: 58,
      color: "bg-[#004B93]",
      barColor: "bg-blue-600",
      badge: "Más utilizado",
      icon: CreditCard,
    },
    {
      id: "junaeb",
      name: "Tarjeta Junaeb BAES",
      sub: "Beca de Alimentación Estudiantil",
      monto: 133920,
      porcentaje: 32,
      color: "bg-[#00A650]",
      barColor: "bg-emerald-500",
      badge: "Subsidio Duoc",
      icon: Wallet,
    },
    {
      id: "otros",
      name: "Billeteras (MACH / Tenpo)",
      sub: "Transferencias digitales instantáneas",
      monto: 41850,
      porcentaje: 10,
      color: "bg-[#7C3AED]",
      barColor: "bg-purple-500",
      badge: "Digital",
      icon: DollarSign,
    },
  ];

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
            {methods.map((m) => (
              <div
                key={m.id}
                style={{ width: `${m.porcentaje}%` }}
                className={`${m.barColor} h-full transition-all duration-500`}
                title={`${m.name}: ${m.porcentaje}%`}
              />
            ))}
          </div>
          <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
            <span>CuentaRUT (58%)</span>
            <span>Junaeb (32%)</span>
            <span>Otros (10%)</span>
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
          Ahorro en comisiones POS:
        </span>
        <span className="font-bold text-emerald-600 dark:text-emerald-400">
          +$12.550 CLP hoy
        </span>
      </div>
    </div>
  );
}

export default PaymentBreakdownWidget;
