import { Bell, Menu, Sun, Moon, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

function Header({ darkMode, onToggleDarkMode, onToggleSidebar }: HeaderProps) {
  const { user, role, locatarioId, changeLocatarioId, signOut } = useAuth();
  const navigate = useNavigate();
  const [locales, setLocales] = useState<{id: string, nombre: string}[]>([]);

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
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop:xl border-b border-slate-200/50 dark:border-slate-700/50 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <button
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" 
            onClick={onToggleSidebar}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden md:block">
            <h1 className="text-2xl font-black text-slate-800 dark:text-white">
              Dashboard
            </h1>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Bienvenido a Skip Duoc UC. Aquí está lo que necesitas para administrar el día de hoy.
            </p>
          </div>
        </div>
        
        {/* Center Section - Admin Selector */}
        <div className="flex-1 max-w-md mx-8 flex justify-center">
          {role === 'super_admin' && (
            <div className="flex items-center space-x-2 bg-slate-100 p-2 rounded-lg">
              <span className="text-sm font-bold text-slate-600">Simular Local:</span>
              <select 
                className="bg-white border rounded p-1 text-sm"
                value={locatarioId || ""}
                onChange={(e) => changeLocatarioId(e.target.value)}
              >
                <option value="" disabled>Seleccione local...</option>
                {locales.map(l => (
                  <option key={l.id} value={l.id}>{l.nombre}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          <button className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={onToggleDarkMode}>
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <button className="relative p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Bell className="w-5 h-5" />
          </button>

          {/* User Profile */}
          <div className="flex items-center space-x-3 pl-3 border-l border-slate-200 dark:border-slate-700">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {user?.email || "Usuario"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                {role ? role.replace('_', ' ') : "Cargando..."}
              </p>
            </div>
            
            {/* Botón Logout */}
            <button onClick={handleSignOut} className="p-2 ml-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Cerrar sesión">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
