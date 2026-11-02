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
import { supabase } from "../../lib/supabase";

export const DashboardPage = () => {
  const { role, locatarioId, nombreLocal } = useAuth();
  const isAdmin = role === "super_admin";
  const [periodo, setPeriodo] = useState<"hoy" | "semana" | "mes">("hoy");

  const handleExportReport = async () => {
    try {
      const now = new Date();
      let startDate = new Date();
      if (periodo === "hoy") {
        startDate.setHours(0, 0, 0, 0);
      } else if (periodo === "semana") {
        startDate.setDate(now.getDate() - 7);
      } else if (periodo === "mes") {
        startDate.setDate(now.getDate() - 30);
      }

      let query = supabase
        .from("pedidos")
        .select(`
          id,
          codigo_retiro,
          monto_total,
          metodo_pago,
          estado,
          created_at,
          locatarios ( nombre ),
          usuarios ( p_nombre, apellido_p, email )
        `)
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: false });

      if (!isAdmin && locatarioId) {
        query = query.eq("locatario_id", locatarioId);
      }

      const { data: pedidos, error } = await query;
      if (error) throw error;

      const headers = "ID,CodigoRetiro,Cliente,Local,MontoTotal,MetodoPago,Estado,Fecha\n";
      const rows = (pedidos || [])
        .map((p: any, idx: number) => {
          const u = Array.isArray(p.usuarios) ? p.usuarios[0] : p.usuarios;
          const cliente = u
            ? `${u.p_nombre || ""} ${u.apellido_p || ""}`.trim() || u.email
            : "Alumno";
          const local =
            (Array.isArray(p.locatarios) ? p.locatarios[0]?.nombre : p.locatarios?.nombre) ||
            nombreLocal ||
            "Sede San Joaquín";
          const fecha = new Date(p.created_at).toLocaleString("es-CL");
          return `${idx + 1},${p.codigo_retiro || p.id.substring(0, 6)},"${cliente}","${local}",${p.monto_total},${p.metodo_pago},${p.estado},"${fecha}"`;
        })
        .join("\n");

      const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
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
    } catch (err) {
      console.error("Error al exportar reporte:", err);
    }
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
      <ChartSection periodo={periodo} />

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
