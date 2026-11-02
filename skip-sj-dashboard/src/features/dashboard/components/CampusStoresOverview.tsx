import { useState, useEffect, useCallback } from "react";
import { Store, Clock, Users, DollarSign, Power } from "lucide-react";
import { supabase } from "../../../lib/supabase";

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

const getStoreMetadata = (nombre: string, tipo?: string) => {
  const n = (nombre || "").toLowerCase();
  if (n.includes("castaño")) return { emoji: "🥐", categoria: "Cafetería y Empanadas" };
  if (n.includes("achoclonado")) return { emoji: "🌽", categoria: "Choclos en Vaso & Snacks" };
  if (n.includes("comedor") || n.includes("casino")) return { emoji: "🍲", categoria: "Almuerzos & Menú Diario" };
  if (n.includes("paradiso")) return { emoji: "🥪", categoria: "Sándwiches & Bebidas" };
  if (n.includes("local -1")) return { emoji: "🍟", categoria: "Salchipapas & Burgers" };
  return { emoji: "🏪", categoria: tipo || "Local de Campus" };
};

export function CampusStoresOverview() {
  const [stores, setStores] = useState<LocalState[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStoresData = useCallback(async () => {
    try {
      setLoading(true);
      // 1. Obtener todos los locatarios reales
      const { data: locatarios, error: locError } = await supabase
        .from("locatarios")
        .select("id, nombre, tipo, activo")
        .order("nombre", { ascending: true });

      if (locError || !locatarios) {
        console.error("Error obteniendo locatarios:", locError);
        return;
      }

      // 2. Obtener pedidos del día para calcular métricas
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: pedidos } = await supabase
        .from("pedidos")
        .select("locatario_id, estado, monto_total, created_at")
        .gte("created_at", today.toISOString());

      const pedidosList = pedidos || [];

      const mapped: LocalState[] = locatarios.map((loc) => {
        const meta = getStoreMetadata(loc.nombre, loc.tipo);
        const storeOrders = pedidosList.filter((p) => p.locatario_id === loc.id);

        const enCola = storeOrders.filter((p) =>
          ["pagado", "en_preparacion"].includes(p.estado)
        ).length;

        const validSales = storeOrders.filter(
          (p) => !["cancelado", "pendiente_pago"].includes(p.estado)
        );
        const ventasHoy = validSales.reduce((acc, p) => acc + (p.monto_total || 0), 0);

        const tiempoEspera = enCola > 0 ? Math.max(4, enCola * 3) : 3;
        const demanda = enCola >= 4 ? "alta" : "normal";

        return {
          id: loc.id,
          nombre: loc.nombre,
          categoria: meta.categoria,
          emoji: meta.emoji,
          pedidosEnCola: enCola,
          tiempoEsperaMin: tiempoEspera,
          ventasHoy,
          activo: loc.activo !== false,
          demanda,
        };
      });

      setStores(mapped);
    } catch (err) {
      console.error("Error en CampusStoresOverview:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStoresData();

    const channel = supabase
      .channel("campus-stores-overview-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pedidos" },
        () => {
          fetchStoresData();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "locatarios" },
        () => {
          fetchStoresData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchStoresData]);

  const toggleLocalStatus = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    // Optimistic UI update
    setStores((prev) =>
      prev.map((s) => (s.id === id ? { ...s, activo: newStatus } : s))
    );

    try {
      const { error } = await supabase
        .from("locatarios")
        .update({ activo: newStatus })
        .eq("id", id);

      if (error) {
        console.error("Error actualizando estado del local en base de datos:", error);
        // Revertir en caso de error
        setStores((prev) =>
          prev.map((s) => (s.id === id ? { ...s, activo: currentStatus } : s))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const activeCount = stores.filter((s) => s.activo).length;

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
            Estado operativo y colas de espera en los {stores.length} puntos de la sede
          </p>
        </div>

        <div className="inline-flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
          <span className={`w-2 h-2 rounded-full ${activeCount > 0 ? "bg-emerald-500" : "bg-zinc-400"}`} />
          {activeCount}/{stores.length} Puntos Operativos
        </div>
      </div>

      {loading && stores.length === 0 ? (
        <p className="text-xs text-zinc-400 text-center py-6">
          Cargando locales del campus...
        </p>
      ) : (
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
                onClick={() => toggleLocalStatus(s.id, s.activo)}
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
      )}
    </div>
  );
}

export default CampusStoresOverview;
