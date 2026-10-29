import { useState } from "react";
import { Store, Clock, Users, DollarSign, Power } from "lucide-react";

interface LocalState {
  id: string;
  nombre: string;
  categoria: string;
  emoji: string;
  pedidosEnCola: number;
  tiempoEsperaMin: number;
  ventasHoy: number;
  activo: boolean;
  demanda: "normal" | "alta" | "baja";
}

const INITIAL_STORES: LocalState[] = [
  {
    id: "castano",
    nombre: "Castaño San Joaquín",
    categoria: "Cafetería y Empanadas",
    emoji: "🥐",
    pedidosEnCola: 3,
    tiempoEsperaMin: 5,
    ventasHoy: 149400,
    activo: true,
    demanda: "alta",
  },
  {
    id: "achoclonado",
    nombre: "Achoclonado",
    categoria: "Choclos en Vaso & Snacks",
    emoji: "🌽",
    pedidosEnCola: 2,
    tiempoEsperaMin: 4,
    ventasHoy: 115200,
    activo: true,
    demanda: "normal",
  },
  {
    id: "casino",
    nombre: "Casino Central Duoc",
    categoria: "Almuerzos & Menú del Día",
    emoji: "🍲",
    pedidosEnCola: 5,
    tiempoEsperaMin: 8,
    ventasHoy: 89000,
    activo: true,
    demanda: "alta",
  },
  {
    id: "local_menos_1",
    nombre: "Local -1 (Comidas Rápidas)",
    categoria: "Salchipapas & Burgers",
    emoji: "🍟",
    pedidosEnCola: 1,
    tiempoEsperaMin: 6,
    ventasHoy: 42500,
    activo: true,
    demanda: "normal",
  },
  {
    id: "paradiso",
    nombre: "Paradiso Canteen",
    categoria: "Sandwiches & Bebidas",
    emoji: "🥪",
    pedidosEnCola: 0,
    tiempoEsperaMin: 3,
    ventasHoy: 22400,
    activo: true,
    demanda: "baja",
  },
];

export function CampusStoresOverview() {
  const [stores, setStores] = useState<LocalState[]>(INITIAL_STORES);

  const toggleLocalStatus = (id: string) => {
    setStores((prev) =>
      prev.map((s) => (s.id === id ? { ...s, activo: !s.activo } : s))
    );
  };

  return (
    <div className="bg-white dark:bg-[#131318] border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-[#F5A623]" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              Monitoreo de Locales del Campus
            </h3>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Estado operativo y colas de espera en los 5 puntos de la sede
          </p>
        </div>

        <div className="inline-flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          5/5 Puntos Operativos
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
        {stores.map((s) => (
          <div
            key={s.id}
            className={`p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
              s.activo
                ? "bg-zinc-50/70 dark:bg-zinc-800/40 border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                : "bg-zinc-100/40 dark:bg-zinc-900/40 border-zinc-200/40 dark:border-zinc-800/40 opacity-60"
            }`}
          >
            <div>
              {/* Header de Local */}
              <div className="flex items-start justify-between gap-1 mb-2">
                <span className="text-2xl">{s.emoji}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    !s.activo
                      ? "bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
                      : s.demanda === "alta"
                      ? "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300"
                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                  }`}
                >
                  {s.activo ? (s.demanda === "alta" ? "Alta Demanda" : "Normal") : "Pausado"}
                </span>
              </div>

              <h4 className="font-bold text-xs text-zinc-900 dark:text-white line-clamp-1">
                {s.nombre}
              </h4>
              <p className="text-[11px] text-zinc-400 line-clamp-1 mb-3">
                {s.categoria}
              </p>

              {/* Métricas del Local */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3 text-zinc-400" /> Espera
                  </span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono text-[11px]">
                    {s.tiempoEsperaMin} min
                  </span>
                </div>

                <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Users className="w-3 h-3 text-zinc-400" /> En cola
                  </span>
                  <span className="font-bold text-amber-600 dark:text-amber-400 font-mono text-[11px]">
                    {s.pedidosEnCola} pedidos
                  </span>
                </div>

                <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                  <span className="flex items-center gap-1 text-[11px]">
                    <DollarSign className="w-3 h-3 text-zinc-400" /> Ventas
                  </span>
                  <span className="font-bold text-zinc-950 dark:text-white font-mono text-[11px]">
                    ${s.ventasHoy.toLocaleString("es-CL")}
                  </span>
                </div>
              </div>
            </div>

            {/* Toggle de Cocina */}
            <button
              onClick={() => toggleLocalStatus(s.id)}
              className={`mt-4 w-full py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors ${
                s.activo
                  ? "bg-zinc-200/80 dark:bg-zinc-700/60 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              <Power className="w-3 h-3" />
              {s.activo ? "Pausar Pedidos" : "Reanudar Cocina"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CampusStoresOverview;
