import { useState, useEffect, useCallback } from "react";
import { AlertTriangle, Clock, X } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../context/AuthContext";

interface AlertItem {
  id: string;
  tipo: "stock" | "demanda";
  titulo: string;
  mensaje: string;
  urgente: boolean;
}

export function StockAlertsBanner() {
  const { role, locatarioId, nombreLocal } = useAuth();
  const isAdmin = role === "super_admin";
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);

  const fetchAlerts = useCallback(async () => {
    try {
      const generatedAlerts: AlertItem[] = [];

      // 1. Consultar productos no disponibles o con bajo stock en la base de datos
      let prodQuery = supabase
        .from("productos")
        .select("id, nombre_producto, disponible, stock_diario, locatarios(nombre)")
        .or("disponible.eq.false,stock_diario.lte.5");

      if (!isAdmin && locatarioId) {
        prodQuery = prodQuery.eq("locatario_id", locatarioId);
      }

      const { data: prods } = await prodQuery;

      if (prods && prods.length > 0) {
        const unavailable = prods.filter((p) => p.disponible === false);
        if (unavailable.length > 0) {
          const names = unavailable.slice(0, 3).map((p) => p.nombre_producto).join(", ");
          generatedAlerts.push({
            id: `stock-unavail-${unavailable[0].id}`,
            tipo: "stock",
            titulo: isAdmin ? "Platos Agotados en Sede" : `Platos No Disponibles en ${nombreLocal || "tu local"}`,
            mensaje: `Los siguientes productos están pausados para venta: ${names}${unavailable.length > 3 ? ` y ${unavailable.length - 3} más` : ""}.`,
            urgente: true,
          });
        }
      }

      // 2. Consultar si hay alta demanda real de pedidos en cocina
      let pedQuery = supabase
        .from("pedidos")
        .select("id, estado")
        .in("estado", ["pagado", "en_preparacion"]);

      if (!isAdmin && locatarioId) {
        pedQuery = pedQuery.eq("locatario_id", locatarioId);
      }

      const { data: activeOrders } = await pedQuery;
      if (activeOrders && activeOrders.length >= 6) {
        generatedAlerts.push({
          id: `demand-high-${activeOrders.length}`,
          tipo: "demanda",
          titulo: "Alta Demanda en Cocina",
          mensaje: `Tienes ${activeOrders.length} comandas activas en mesón. Agiliza las entregas para mantener el SLA de entrega.`,
          urgente: false,
        });
      }

      setAlerts(generatedAlerts);
    } catch (err) {
      console.error("Error obteniendo alertas de stock:", err);
    }
  }, [isAdmin, locatarioId, nombreLocal]);

  useEffect(() => {
    fetchAlerts();

    const channel = supabase
      .channel("stock-alerts-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "productos" },
        () => {
          fetchAlerts();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pedidos" },
        () => {
          fetchAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAlerts]);

  const visibleAlerts = alerts.filter((a) => !dismissed.includes(a.id));

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
