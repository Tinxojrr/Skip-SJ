import RevenueChart from "../components/RevenueChart"
import SalesChart from "../components/SalesChart"

function ChartSection() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2">
        <RevenueChart />
      </div>
      <div className="space-y-6">
        <SalesChart />
      </div>
    </div>
  )
}

export default ChartSection