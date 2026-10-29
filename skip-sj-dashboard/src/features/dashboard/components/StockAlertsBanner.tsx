import { useState } from "react";
import { AlertTriangle, Clock, X } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

export function StockAlertsBanner() {
  const { role, nombreLocal } = useAuth();
  const isAdmin = role === "super_admin";
  const [dismissed, setDismissed] = useState<string[]>([]);

  const adminAlerts = [
    {
      id: "a1",
      tipo: "stock",
      titulo: "Stock Crítico en Sede",
      mensaje: "Quedan solo 4 Empanadas de Pino en Castaño y 3 Sándwiches en Paradiso.",
      urgente: true,
    },
    {
      id: "a2",
      tipo: "demanda",
      titulo: "Alerta de Horario Punta en Campus",
      mensaje: "Inicio de recreo central en 15 minutos (13:00 hrs). Alza proyectada del 45% en comandas.",
      urgente: false,
    },
  ];

  const vendorAlerts = [
    {
      id: "v1",
      tipo: "stock",
      titulo: `Alerta de Stock en ${nombreLocal || "tu local"}`,
      mensaje: "Quedan pocas unidades de pan y quesos para Sándwich Barros Luco. Verificar reposición.",
      urgente: true,
    },
    {
      id: "v2",
      tipo: "demanda",
      titulo: "Próximo Recreo Masivo",
      mensaje: "Mayor afluencia de alumnos en 15 minutos. Tener lista la máquina de café y vitrina.",
      urgente: false,
    },
  ];

  const activeAlerts = isAdmin ? adminAlerts : vendorAlerts;
  const visibleAlerts = activeAlerts.filter((a) => !dismissed.includes(a.id));

  if (visibleAlerts.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
      {visibleAlerts.map((alert) => (
        <div
          key={alert.id}
          className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 shadow-sm ${
            alert.urgente
              ? "bg-rose-50/80 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-900 dark:text-rose-200"
              : "bg-amber-50/80 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-900 dark:text-amber-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                alert.urgente
                  ? "bg-rose-500 text-white"
                  : "bg-amber-500 text-black font-bold"
              }`}
            >
              {alert.urgente ? (
                <AlertTriangle className="w-4 h-4 animate-bounce" />
              ) : (
                <Clock className="w-4 h-4" />
              )}
            </div>
            <div>
              <p className="text-xs font-bold flex items-center gap-1.5">
                {alert.titulo}
                {alert.urgente && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] uppercase font-black bg-rose-600 text-white">
                    Atención
                  </span>
                )}
              </p>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-0.5">
                {alert.mensaje}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setDismissed((prev) => [...prev, alert.id])}
              className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default StockAlertsBanner;
