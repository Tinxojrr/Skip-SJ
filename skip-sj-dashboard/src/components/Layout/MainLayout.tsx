import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

export const MainLayout = () => {
  const [sideBarCollapsed, setSideBarCollapsed] = useState(false);
  // Por defecto forzar el modo oscuro
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved !== null ? saved === "dark" : true;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-zinc-200/80 dark:bg-[#070709] text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          collapsed={sideBarCollapsed}
          onToggle={() => setSideBarCollapsed(!sideBarCollapsed)}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header
            sidebarCollapsed={sideBarCollapsed}
            onToggleSidebar={() => setSideBarCollapsed(!sideBarCollapsed)}
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode(!darkMode)}
          />

          <main className="flex-1 overflow-auto bg-zinc-100/60 dark:bg-[#070709] p-6 sm:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
