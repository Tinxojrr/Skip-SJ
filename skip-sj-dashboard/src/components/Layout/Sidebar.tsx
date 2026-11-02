import { useState } from "react";
import {
  BarChart3,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Store,
  UtensilsCrossed,
  History,
  Volume2,
  Wifi
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface MenuItem {
  id: string;
  icon: any;
  label: string;
  badge?: string;
  badgeColor?: string;
  count?: string;
}

export function Sidebar({ collapsed }: SidebarProps) {
  const { user, role, nombreLocal } = useAuth();
  const [isPlayingSound, setIsPlayingSound] = useState(false);

  // Reproductor de Chime de cocina con Web Audio API nativo
  const playChimeSound = () => {
    try {
      setIsPlayingSound(true);
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.type = "sine";
      // Secuencia de campana suave dual (D5 a A5)
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);

      setTimeout(() => setIsPlayingSound(false), 700);
    } catch (e) {
      console.error("Audio error", e);
      setIsPlayingSound(false);
    }
  };

  // Menú exclusivo para ENCARGADOS DE LOCAL (Cajero / Cocina)
  const storeAdminItems: MenuItem[] = [
    {
      id: "ordering/kanban",
      icon: ShoppingBag,
      label: "Pedidos en Vivo",
      badge: "Cocina",
      badgeColor: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    },
    {
      id: "historial",
      icon: History,
      label: "Historial de Pedidos",
    },
    {
      id: "productos",
      icon: Package,
      label: "Carta y Productos",
    },
    {
      id: "dashboard",
      icon: BarChart3,
      label: "Ventas y Resumen",
    },
  ];

  // Menú para ADMINISTRADORES GENERALES DE LA PLATAFORMA (Super Admin)
  const superAdminItems: MenuItem[] = [
    {
      id: "dashboard",
      icon: LayoutDashboard,
      label: "Métricas Globales",
      badge: "Sede",
      badgeColor: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    },
    {
      id: "ordering/kanban",
      icon: UtensilsCrossed,
      label: "Monitor de Locales",
    },
    {
      id: "productos",
      icon: Package,
      label: "Catálogo General",
    },
    {
      id: "historial",
      icon: History,
      label: "Historial General",
    },
  ];

  const currentMenuItems = role === "store_admin" ? storeAdminItems : superAdminItems;

  return (
    <aside
      className={`${collapsed ? "w-20" : "w-64"} transition-all duration-300 ease-in-out 
      bg-white dark:bg-[#0d0d11]
      border-r border-zinc-200 dark:border-zinc-800/80 
      flex flex-col relative z-20 shrink-0 select-none`}
    >
      {/* Logo & Marca */}
      <div className="p-5 border-b border-zinc-200 dark:border-zinc-800/80">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-linear-to-b from-[#F5A623] to-[#0B2A6B] rounded-xl flex items-center justify-center shadow-sm">
            <Store className="w-5 h-5 text-white" />
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-base font-extrabold tracking-tight text-zinc-900 dark:text-white">
                Skip <span className="text-[#0B2A6B] dark:text-[#F5A623]">Duoc UC</span>
              </h1>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 truncate">
                {role === "store_admin" ? "Terminal de Local" : "Admin Central"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navegación por Rol */}
      <nav className="p-3 space-y-1">
        {!collapsed && (
          <div className="px-3 pt-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            {role === "store_admin" ? "Operaciones del Local" : "Gestión Central"}
          </div>
        )}

        {currentMenuItems.map((item) => (
          <NavLink
            key={item.id}
            to={`/${item.id}`}
            className={({ isActive }) =>
              `w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-zinc-900 text-white dark:bg-zinc-800/90 dark:text-white dark:border dark:border-zinc-700/60 shadow-xs font-semibold"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`
            }
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <item.icon className="w-4 h-4 shrink-0 opacity-80" />
              {!collapsed && (
                <span className="truncate">{item.label}</span>
              )}
            </div>

            {!collapsed && (
              <div className="flex items-center space-x-1.5 shrink-0">
                {item.badge && (
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${item.badgeColor || 'bg-zinc-700 text-zinc-200'}`}>
                    {item.badge}
                  </span>
                )}
                {item.count && (
                  <span className="px-2 py-0.5 text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-md font-mono">
                    {item.count}
                  </span>
                )}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* SECCIÓN INTERMEDIA: ESTADO DEL MESÓN & HERRAMIENTAS (Rellena el espacio vacío con alto valor) */}
      {!collapsed && (
        <div className="flex-1 px-3 py-2 space-y-3 overflow-y-auto">
          {/* 1. Tarjeta Estado Operativo del Local */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-[#14141a] border border-zinc-200/80 dark:border-zinc-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-200">
                  Mesón en Servicio
                </span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-semibold border border-emerald-500/20">
                ONLINE
              </span>
            </div>

            <div className="space-y-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center justify-between">
                <span>SLA Entrega:</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-300">&lt; 8 min</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Canal Retiro:</span>
                <span className="font-semibold text-[#F5A623]">Express Click &amp; Collect</span>
              </div>
            </div>

            {/* Botón de Prueba de Sonido de Cocina */}
            <button
              onClick={playChimeSound}
              disabled={isPlayingSound}
              className={`w-full flex items-center justify-center space-x-1.5 py-1.5 px-2.5 rounded-xl text-xs font-semibold transition-all border ${
                isPlayingSound
                  ? "bg-amber-500/20 text-[#F5A623] border-amber-500/40"
                  : "bg-white dark:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700/80 border-zinc-200 dark:border-zinc-700/60"
              }`}
            >
              <Volume2 className={`w-3.5 h-3.5 ${isPlayingSound ? "animate-bounce text-[#F5A623]" : "text-zinc-400"}`} />
              <span>{isPlayingSound ? "Sonando timbre..." : "Probar Timbre Mesón"}</span>
            </button>
          </div>

          {/* 2. Badge de Información de Sede & Infraestructura */}
          <div className="p-3 rounded-2xl bg-linear-to-b from-zinc-50 to-zinc-100/60 dark:from-zinc-900/40 dark:to-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800/60 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Wifi className="w-3 h-3 text-emerald-500" />
                Red San Joaquín
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">Realtime</span>
            </div>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-relaxed">
              Casino Central Duoc UC • Terminal sincronizado con la app móvil de alumnos.
            </p>
          </div>
        </div>
      )}

      {/* Perfil del Local Autenticado (Footer Fijo) */}
      {!collapsed && (
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800/80 mt-auto">
          <div className="flex items-center space-x-3 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60">
            <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-[#0B2A6B] to-[#F5A623] border border-amber-500/30 flex items-center justify-center text-white font-extrabold text-xs shrink-0 shadow-sm">
              {nombreLocal ? nombreLocal.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">
                {nombreLocal || (role === "store_admin" ? "Mi Local" : "Administrador")}
              </p>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate font-mono">
                {user?.email || "Usuario"}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
