import {
  BarChart3,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Store,
  Users,
  UtensilsCrossed,
  History
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
      id: "admin-users",
      icon: Users,
      label: "Usuarios Duoc",
      count: "Sede SJ",
    },
  ];

  const currentMenuItems = role === "store_admin" ? storeAdminItems : superAdminItems;

  return (
    <aside
      className={`${collapsed ? "w-20" : "w-64"} transition-all duration-300 ease-in-out 
      bg-white dark:bg-[#0d0d11]
      border-r border-zinc-200 dark:border-zinc-800/80 
      flex flex-col relative z-20 shrink-0`}
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
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
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

      {/* Perfil del Local Autenticado */}
      {!collapsed && (
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800/80">
          <div className="flex items-center space-x-3 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60">
            <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-zinc-700 to-zinc-900 dark:from-zinc-800 dark:to-zinc-700 border border-zinc-600/30 flex items-center justify-center text-white font-bold text-xs shrink-0">
              {nombreLocal ? nombreLocal.charAt(0).toUpperCase() : "S"}
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
