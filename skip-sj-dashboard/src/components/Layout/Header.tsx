import { Menu, Sun, Moon, LogOut, Store } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";
import { CopilotoIABtn } from "../../features/dashboard/components/CopilotoIABtn";

interface HeaderProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export function Header({ darkMode, onToggleDarkMode, onToggleSidebar }: HeaderProps) {
  const { user, role, locatarioId, nombreLocal, changeLocatarioId, signOut } = useAuth();
  const navigate = useNavigate();
  const [locales, setLocales] = useState<{ id: string; nombre: string }[]>([]);

  useEffect(() => {
    if (role === 'super_admin') {
      supabase.from('locatarios').select('id, nombre').then(({ data }) => {
        if (data) setLocales(data);
      });
    }
  }, [role]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth/signin");
  };

  return (
    <header className="bg-white/80 dark:bg-[#0d0d11]/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800/80 px-6 py-3.5 z-10 shrink-0">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-3">
          <button
            className="p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors"
            onClick={onToggleSidebar}
            aria-label="Alternar menú"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-tight text-zinc-900 dark:text-white">
                {role === "store_admin" ? (nombreLocal || "Mi Local") : "Panel Central Duoc UC"}
              </span>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/60">
                Sede San Joaquín
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-normal">
              {role === "store_admin" 
                ? "Gestión de pedidos en cocina y caja" 
                : "Monitoreo general de la red de casinos"}
            </p>
          </div>
        </div>

        {/* Center Section - Admin Selector (solo para Super Admin) */}
        <div className="flex-1 max-w-xs mx-4 hidden md:flex justify-center">
          {role === 'super_admin' && (
            <div className="flex items-center space-x-2 bg-zinc-100 dark:bg-zinc-800/80 p-1.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700/60">
              <Store className="w-3.5 h-3.5 text-zinc-500" />
              <select
                className="bg-transparent text-xs font-medium text-zinc-800 dark:text-zinc-200 outline-none cursor-pointer"
                value={locatarioId || ""}
                onChange={(e) => changeLocatarioId(e.target.value)}
              >
                <option value="" disabled className="dark:bg-zinc-900">Seleccionar local...</option>
                {locales.map((l) => (
                  <option key={l.id} value={l.id} className="dark:bg-zinc-900">
                    {l.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2.5">
          {/* Botón Copiloto IA */}
          <CopilotoIABtn />

          {/* Dark Mode Toggle */}
          <button
            className="p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors"
            onClick={onToggleDarkMode}
            title={darkMode ? "Activar modo claro" : "Activar modo oscuro"}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User & Logout */}
          <div className="flex items-center space-x-3 pl-3 border-l border-zinc-200 dark:border-zinc-800">
            <div className="hidden lg:block text-right">
              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[150px]">
                {user?.email || "Usuario"}
              </p>
              <p className="text-[10px] text-zinc-400 font-mono">
                {role === "store_admin" ? "Cajero / Cocina" : "Super Admin"}
              </p>
            </div>

            <button
              onClick={handleSignOut}
              className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
