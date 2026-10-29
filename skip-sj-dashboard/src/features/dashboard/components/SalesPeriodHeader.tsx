import { useState } from "react";
import { 
  Clock, 
  Download, 
  Flame, 
  Radio, 
  CheckCircle2
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

interface SalesPeriodHeaderProps {
  periodo: "hoy" | "semana" | "mes";
  setPeriodo: (p: "hoy" | "semana" | "mes") => void;
  onExportReport: () => void;
}

export function SalesPeriodHeader({
  periodo,
  setPeriodo,
  onExportReport,
}: SalesPeriodHeaderProps) {
  const { role, nombreLocal } = useAuth();
  const isAdmin = role === "super_admin";
  const [turno, setTurno] = useState<"todos" | "manana" | "almuerzo" | "tarde">("almuerzo");

  return (
    <div className="bg-white dark:bg-[#131318] border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Título & Estado según rol */}
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">
              {isAdmin ? "Panel de Ventas & Resumen General" : `Panel de Ventas — ${nombreLocal || "Mi Local"}`}
            </h2>
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
              isAdmin 
                ? "bg-purple-50 dark:bg-purple-500/10 border-purple-300 dark:border-purple-500/30 text-purple-700 dark:text-purple-400"
                : "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
            }`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${isAdmin ? "bg-purple-500" : "bg-emerald-500"}`} />
              {isAdmin ? "Vista Super Admin (Sede)" : `Vista Vendedor (${nombreLocal || "Local"})`}
            </div>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-[#F5A623]" />
            {isAdmin 
              ? "Monitoreo integral de todos los concesionarios y recaudación global del campus"
              : `Comandas, recaudación directa y métricas operativas de ${nombreLocal || "tu punto de venta"}`}
          </p>
        </div>

        {/* Acciones & Filtros */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Selector de Rango de Fecha */}
          <div className="inline-flex p-1 bg-zinc-100 dark:bg-[#1c1c24] rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold">
            <button
              onClick={() => setPeriodo("hoy")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                periodo === "hoy"
                  ? "bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm font-bold"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Hoy
            </button>
            <button
              onClick={() => setPeriodo("semana")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                periodo === "semana"
                  ? "bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm font-bold"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Esta Semana
            </button>
            <button
              onClick={() => setPeriodo("mes")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                periodo === "mes"
                  ? "bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm font-bold"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Este Mes
            </button>
          </div>

          {/* Botón Exportar */}
          <button
            onClick={onExportReport}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-white text-xs font-bold transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Descargar Cuadratura
          </button>
        </div>
      </div>

      {/* Sub-barra: Semáforo de Congestión y Turno */}
      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Semáforo de Demanda */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-300 font-medium">
            <Flame className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>
              {isAdmin 
                ? "Demanda Campus: Horario Almuerzo (Moderada)"
                : `Estado Cocina: Operando sin retrasos en ${nombreLocal || "el local"}`}
            </span>
          </div>

          {/* Cumplimiento SLA */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>SLA Entrega: <strong>96.4% a tiempo (&lt; 8 min)</strong></span>
          </div>
        </div>

        {/* Selector de Turno */}
        <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
          <Clock className="w-3.5 h-3.5" />
          <span className="font-medium mr-1">Turno:</span>
          {(["todos", "manana", "almuerzo", "tarde"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTurno(t)}
              className={`px-2 py-0.5 rounded capitalize text-[11px] font-semibold transition-colors ${
                turno === t
                  ? "bg-[#F5A623] text-black font-bold"
                  : "hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
              }`}
            >
              {t === "manana" ? "Mañana" : t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SalesPeriodHeader;
