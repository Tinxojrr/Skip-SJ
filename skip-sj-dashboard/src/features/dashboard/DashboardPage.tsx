import ActivityFeed from "./components/ActivityFeed"
import ChartSection from "./components/ChartSection"
import StatsGrid from "./components/StatsGrid"
import TableSection from "./components/TableSection"


export const DashboardPage = () => {
  return (
    <div className="space-y-6">
        {/* Stats Grid */}
        <StatsGrid />

        {/* Chart Sections */}
        <ChartSection />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
                <TableSection />
            </div>
            <div>
              <ActivityFeed />
            </div>
        </div>
    </div>
  )
};