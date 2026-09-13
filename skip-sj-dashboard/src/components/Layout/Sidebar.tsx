import {
  BarChart3,
  Calendar,
  ChevronDown,
  CreditCard,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Monitor,
  Package,
  Settings,
  ShoppingBag,
  Users,
} from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";

const menuItems = [
  {
    id: "dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    active: true,
    badge: "New",
  },
  {
    id: "analytics",
    icon: BarChart3,
    label: "Análisis",
    submenu: [
      { id: "overview", label: "Resumen" },
      { id: "reports", label: "Reportes" },
      { id: "insights", label: "Información " },
    ],
  },
  {
    id: "users",
    icon: Users,
    label: "Usuarios",
    count: "2.4k",
    submenu: [
      { id: "all-users", label: "Todos los Usuarios" },
      { id: "roles", label: "Roles & Permisos" },
      { id: "activity", label: "Actividad de Usuarios campus food" },
    ],
  },
  {
    id: "ordering",
    icon: ShoppingBag,
    label: "pedidos de comida",
    submenu: [
      { id: "products", label: "Productos" },
      { id: "orders", label: "Ordenes" },
      { id: "customers", label: "Clientes" },
    ],
  },
  {
    id: "inventory",
    icon: Package,
    label: "Inventario",
    count: "847",
  },
  {
    id: "transactions",
    icon: CreditCard,
    label: "Transacciones",
  },
  {
    id: "messages",
    icon: MessageSquare,
    label: "Mensajes",
    badge: "10",
  },
  {
    id: "calendar",
    icon: Calendar,
    label: "Calendario",
  },
  {
    id: "reports",
    icon: FileText,
    label: "Reportes",
  },
  {
    id: "settings",
    icon: Settings,
    label: "Configuración",
  },
];
interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

function Sidebar({ collapsed }: SidebarProps) {
  const [expandedItems, setExpendedItems] = useState(new Set(["analytics"]));

  const toggleExpanded = (itemid: string) => {
    const newExpanded = new Set(expandedItems);

    if (newExpanded.has(itemid)) {
      newExpanded.delete(itemid);
    } else {
      newExpanded.add(itemid);
    }
    setExpendedItems(newExpanded);
  };
  return (
    <div
      className={`${collapsed ? "w-20" : "w-72"} transition-all duration-300 ease-in-out 
    bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl 
    border-r border-slate-200/50 dark:border-slate-700/50 
    flex flex-col relative z-10`}
    >
      {/* Logo */}
      <div className="p-6 border-slate-200/50 dark:border-slate-700/50 ">
        <div className="flex items-center space-x-3">
          <div
            className="w-10 h-10 bg-linear-to-b from-yellow-500 to-blue-600 rounded-xl
                    flex items-center justify-center shadow-lg"
          >
            <Monitor className="w-6 h-6 text-white" />
          </div>

          {/* Conditional Rendering */}
          {!collapsed && (
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white">
                Skip SJ
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Admin Panel
              </p>
            </div>
          )}
        </div>
      </div>
      {/* Navigation*/}
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-auto">
        {menuItems.map((item) => {
          return (
            <div key={item.id}>
              {item.submenu ? (
                <button
                  className="w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  onClick={() => toggleExpanded(item.id)}
                >
                  <div className="flex items-center space-x-3 dark:text-white flex-1 min-w-0">
                    <item.icon className="w-5 h-5" />
                    {!collapsed && (
                      <span className="font-medium ml-2">{item.label}</span>
                    )}
                  </div>
                  {!collapsed && (
                    <ChevronDown className="w-4 h-4 transition-transform dark:text-white" />
                  )}
                </button>
              ) : (
                <NavLink
                  to={`/${item.id}`}
                  className={({ isActive }) =>
                    `w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-linear-to-r from-yellow-500 to-blue-600 text-white shadow-lg shadow-blue-500/25"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                    }`
                  }
                >
                  <div className="flex items-center space-x-3 dark:text-white flex-1 min-w-0">
                    <item.icon className="w-5 h-5" />
                    {!collapsed && (
                      <>
                        <span className="font-medium ml-2">{item.label}</span>
                        {item.badge && (
                          <span className="px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                            {item.badge}
                          </span>
                        )}
                        {item.count && (
                          <span className="px-2 py-1 text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full">
                            {item.count}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </NavLink>
              )}

              {/* Sub Menus */}
              {!collapsed && item.submenu && expandedItems.has(item.id) && (
                <div className="ml-8 mt-2 space-y-1 dark:text-white">
                  {item.submenu.map((subitem) => (
                    <NavLink
                      key={subitem.id}
                      to={`/${item.id}/${subitem.id}`}
                      className={({ isActive }) =>
                        `block w-full text-left p-2 text-sm rounded-lg transition-all ${
                          isActive
                            ? "text-blue-500 font-bold dark:text-blue-400"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                        }`
                      }
                    >
                      {subitem.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Profile */}
      {!collapsed && (
        <div className="p-4 border-t border-slate-200/50 dark:border-slate-700/50">
          <div
            className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50
                dark:bg-slate-800/50"
          >
            <img
              src="../src/assets/user-profile.png"
              alt="user profile"
              className="w-10 h-10 rounded-full ring-2 ring-blue-500"
            />
            <div className="flex-1 min-w-0">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                  FlixDev
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  Administrator
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
