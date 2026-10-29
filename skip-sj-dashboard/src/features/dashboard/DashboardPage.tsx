import { useState } from "react";
import ActivityFeed from "./components/ActivityFeed";
import ChartSection from "./components/ChartSection";
import StatsGrid from "./components/StatsGrid";
import TableSection from "./components/TableSection";
import SalesPeriodHeader from "./components/SalesPeriodHeader";
import TopProductsWidget from "./components/TopProductsWidget";
import PaymentBreakdownWidget from "./components/PaymentBreakdownWidget";
import CampusStoresOverview from "./components/CampusStoresOverview";
import StockAlertsBanner from "./components/StockAlertsBanner";
import CopilotoIABtn from "./components/CopilotoIABtn";
import { useAuth } from "../../context/AuthContext";

export const DashboardPage = () => {
  const { role, nombreLocal } = useAuth();
  const isAdmin = role === "super_admin";
  const [periodo, setPeriodo] = useState<"hoy" | "semana" | "mes">("hoy");

  const handleExportReport = () => {
    // Generación dinámica de CSV de cuadratura de caja para la sede
    const headers = "ID,CodigoRetiro,Cliente,Local,MontoTotal,MetodoPago,Estado,Fecha\n";
    const sampleRows = [
      `1,SJ-401,Martin Aburto,${nombreLocal || "Paradiso"},6200,BancoEstado (CuentaRUT),Completado,2026-10-28 12:45`,
      `2,SJ-402,Ignacio Valenzuela,${nombreLocal || "Paradiso"},5700,Tarjeta Junaeb BAES,Completado,2026-10-28 12:51`,
      `3,SJ-403,Camila Rojas,${nombreLocal || "Paradiso"},4500,BancoEstado (CuentaRUT),Completado,2026-10-28 13:02`,
      `4,SJ-404,Matías Soto,${nombreLocal || "Paradiso"},4800,MACH / Bci,Completado,2026-10-28 13:10`,
      `5,SJ-405,Fernanda Díaz,${nombreLocal || "Paradiso"},3200,Tarjeta Junaeb BAES,En Cocina,2026-10-28 13:15`,
    ].join("\n");

    const blob = new Blob([headers + sampleRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `Cuadratura_Ventas_${nombreLocal ? nombreLocal.replace(/\s+/g, "_") : "SkipSJ"}_${periodo}_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header de Período, Turno y Cuadratura */}
      <SalesPeriodHeader
        periodo={periodo}
        setPeriodo={setPeriodo}
        onExportReport={handleExportReport}
      />

      {/* 2. Banner de Alertas de Stock y Demanda */}
      <StockAlertsBanner />

      {/* 3. Grid de Métricas Principales (6 KPIs Clave adaptados a Admin o Vendedor) */}
      <StatsGrid periodo={periodo} />

      {/* 4. Gráficos de Recaudación y Embudo de Cocina */}
      <ChartSection />

      {/* 5. Widgets de Alto Impacto: Top 5 Productos del Local/Sede & Desglose de Pago */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopProductsWidget />
        <PaymentBreakdownWidget />
      </div>

      {/* 6. Monitoreo Multi-Local del Campus San Joaquín (SOLO VISTA ADMIN GENERAL) */}
      {isAdmin && <CampusStoresOverview />}

      {/* 7. Registro de Últimas Comandas & Feed de Actividad */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <TableSection />
        </div>
        <div>
          <ActivityFeed />
        </div>
      </div>

      {/* 8. Botón Flotante Asistente Copiloto IA (Gemini Flash) */}
      <CopilotoIABtn />
    </div>
  );
};

export default DashboardPage;
