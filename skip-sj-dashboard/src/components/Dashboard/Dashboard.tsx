import ActivityFeed from "./ActivityFeed"
import ChartSection from "./ChartSection"
import StatsGrid from "./StatsGrid"
import TableSection from "./TableSection"


function Dashboard() {
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
}

export default Dashboard