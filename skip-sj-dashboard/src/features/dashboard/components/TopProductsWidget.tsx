import { useEffect, useState } from "react";
import { Award, Flame, Store } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../context/AuthContext";

interface ProductSale {
  id: string;
  nombre: string;
  local: string;
  ventas: number;
  ingresos: number;
  porcentaje: number;
  emoji: string;
}

const DEFAULT_GLOBAL_PRODUCTS: ProductSale[] = [
  {
    id: "p1",
    nombre: "Empanada de Pino de Horno",
    local: "Castaño",
    ventas: 48,
    ingresos: 115200,
    porcentaje: 28,
    emoji: "🥟",
  },
  {
    id: "p2",
    nombre: "Choclo Mediano Tradicional",
    local: "Achoclonado",
    ventas: 36,
    ingresos: 115200,
    porcentaje: 23,
    emoji: "🌽",
  },
  {
    id: "p3",
    nombre: "Salchipapa San Joaquín",
    local: "Local -1",
    ventas: 29,
    ingresos: 87000,
    porcentaje: 18,
    emoji: "🍟",
  },
  {
    id: "p4",
    nombre: "Hot Dog Italiano Clásico",
    local: "Casino Central",
    ventas: 24,
    ingresos: 62400,
    porcentaje: 16,
    emoji: "🌭",
  },
  {
    id: "p5",
    nombre: "Muffin Vainilla & Chips",
    local: "Castaño",
    ventas: 19,
    ingresos: 34200,
    porcentaje: 15,
    emoji: "🧁",
  },
];

const DEFAULT_PARADISO_PRODUCTS: ProductSale[] = [
  {
    id: "para-1",
    nombre: "Sándwich Barros Luco",
    local: "Paradiso",
    ventas: 32,
    ingresos: 124800,
    porcentaje: 34,
    emoji: "🥪",
  },
  {
    id: "para-2",
    nombre: "Promo 2x1 Café Americano",
    local: "Paradiso",
    ventas: 28,
    ingresos: 67200,
    porcentaje: 25,
    emoji: "☕",
  },
  {
    id: "para-3",
    nombre: "Pizza Pepperoni Individual",
    local: "Paradiso",
    ventas: 19,
    ingresos: 79800,
    porcentaje: 20,
    emoji: "🍕",
  },
  {
    id: "para-4",
    nombre: "Café Latte Vainilla",
    local: "Paradiso",
    ventas: 15,
    ingresos: 42000,
    porcentaje: 12,
    emoji: "🥛",
  },
  {
    id: "para-5",
    nombre: "Croissant Jamón & Queso",
    local: "Paradiso",
    ventas: 12,
    ingresos: 31200,
    porcentaje: 9,
    emoji: "🥐",
  },
];

export function TopProductsWidget() {
  const { locatarioId, role, nombreLocal } = useAuth();
  const isAdmin = role === "super_admin";
  const defaultList = isAdmin ? DEFAULT_GLOBAL_PRODUCTS : DEFAULT_PARADISO_PRODUCTS;
  const [products, setProducts] = useState<ProductSale[]>(defaultList);

  useEffect(() => {
    const fetchTopSelling = async () => {
      try {
        let query = supabase
          .from("pedido_items")
          .select("cantidad, subtotal, productos(id, nombre_producto, emoji, locatario_id, locatarios(nombre))");

        const { data: items, error } = await query;

        if (!error && items && items.length > 0) {
          const map: { [key: string]: ProductSale } = {};
          let totalRecaudado = 0;

          items.forEach((item: any) => {
            const p = item.productos;
            if (!p) return;
            if (!isAdmin && locatarioId && p.locatario_id !== locatarioId) return;

            const key = p.id;
            const subtotal = item.subtotal || item.cantidad * 2500;
            totalRecaudado += subtotal;

            if (!map[key]) {
              map[key] = {
                id: key,
                nombre: p.nombre_producto || "Producto",
                local: p.locatarios?.nombre || (nombreLocal || "Local"),
                ventas: 0,
                ingresos: 0,
                porcentaje: 0,
                emoji: p.emoji || "🍽️",
              };
            }
            map[key].ventas += item.cantidad || 1;
            map[key].ingresos += subtotal;
          });

          const sorted = Object.values(map)
            .sort((a, b) => b.ventas - a.ventas)
            .slice(0, 5)
            .map((item) => ({
              ...item,
              porcentaje: totalRecaudado > 0 ? Math.round((item.ingresos / totalRecaudado) * 100) : 20,
            }));

          if (sorted.length > 0) {
            setProducts(sorted);
          }
        }
      } catch (err) {
        console.error("Error cargando top productos:", err);
      }
    };

    fetchTopSelling();
  }, [locatarioId, role, isAdmin, nombreLocal]);

  return (
    <div className="bg-white dark:bg-[#131318] border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#F5A623]" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              {isAdmin ? "Top 5 Platos Más Vendidos (Sede)" : `Top 5 Productos de ${nombreLocal || "Mi Local"}`}
            </h3>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
            Turno Hoy
          </span>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-5">
          {isAdmin 
            ? "Productos con mayor rotación e ingresos generados en la sede"
            : `Ranking de ventas de tu catálogo en ${nombreLocal || "tu punto de venta"}`}
        </p>

        <div className="space-y-4">
          {products.map((item, index) => {
            const medalColors = [
              "bg-amber-400 text-black", // 1° Oro
              "bg-zinc-300 dark:bg-zinc-600 text-black dark:text-white", // 2° Plata
              "bg-amber-700 text-white", // 3° Bronce
              "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400", // 4°
              "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400", // 5°
            ];

            return (
              <div key={item.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                        medalColors[index] || medalColors[3]
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span className="text-base">{item.emoji}</span>
                    <div>
                      <p className="font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                        {item.nombre}
                      </p>
                      <p className="text-[11px] text-zinc-400 flex items-center gap-1">
                        <Store className="w-3 h-3" />
                        {item.local}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-mono font-bold text-zinc-950 dark:text-white">
                      ${item.ingresos.toLocaleString("es-CL")}
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      {item.ventas} unid. ({item.porcentaje}%)
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#F5A623] h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, item.porcentaje * 2.5)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5 font-medium">
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          {isAdmin ? "Mayor rotación: Castaño & Achoclonado" : `Plato estrella: ${products[0]?.nombre}`}
        </span>
        <span className="font-semibold text-zinc-900 dark:text-zinc-200">
          {isAdmin ? "71% de recaudación total" : `${products[0]?.porcentaje}% de tus ventas`}
        </span>
      </div>
    </div>
  );
}

export default TopProductsWidget;
