import RevenueChart from "./RevenueChart";
import SalesChart from "./SalesChart";

interface ChartSectionProps {
  periodo?: "hoy" | "semana" | "mes";
}

export function ChartSection({ periodo = "hoy" }: ChartSectionProps) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2">
        <RevenueChart periodo={periodo} />
      </div>
      <div className="space-y-6">
        <SalesChart />
      </div>
    </div>
  );
}

export default ChartSection;
