import Dashboard from "./features/dashboard/DashboardPage";
import Header from "./components/Layout/Header";
import Sidebar from "./components/Layout/Sidebar";
import { useState, useEffect } from "react";

function App() {
  const [sideBarCollapsed, setSideBarCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");
  
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : true;
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
    <div
      className="min-h-screen bg-linear-to-b from-slate-50 via-blue-50
     to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 
     transition-all duration-500"
    >
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          collapsed={sideBarCollapsed}
          onToggle={() => setSideBarCollapsed(!sideBarCollapsed)}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            sidebarCollapsed={sideBarCollapsed}
            onToggleSidebar={() => setSideBarCollapsed(!sideBarCollapsed)}
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode(!darkMode)}
          />
          <main className="flex-1 overflow-auto bg-transparent">
            <div className="p-6 space-y-6">
              {currentPage === "dashboard" && <Dashboard />}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
