import {
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  Eye,
  ShoppingCart,
  Users,
} from "lucide-react";

const stats = [
  {
    title: "Ingresos totales",
    value: "$120,563",
    change: "+11.5%",
    trend: "up",
    icon: DollarSign,
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
    textColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    title: "Usuarios activos",
    value: "2,563",
    change: "+5.5%",
    trend: "up",
    icon: Users,
    color: "from-blue-500 to-indigo-600",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    textColor: "text-blue-600 dark:text-blue-400",
  },
  {
    title: "Total de pedidos",
    value: "1,563",
    change: "+14.5%",
    trend: "up",
    icon: ShoppingCart,
    color: "from-purple-500 to-pink-600",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
    textColor: "text-purple-600 dark:text-purple-400",
  },
  {
    title: "Visitas a la página",
    value: "30,563",
    change: "-2.5%",
    trend: "down",
    icon: Eye,
    color: "from-orange-500 to-red-600",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
    textColor: "text-orange-600 dark:text-orange-400",
  },
];

function StatsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        return (
          <div
            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6
            border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl hover:shadow-slate-200/20
            dark:hover:shadow-slate-900/20 transition-all duration-300 group"
            key={index}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-slate-800 dark:text-white">
                  {stat.value}
                </p>
              </div>
              <div
                className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-all duration-300`}
              >
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
            </div>

            <div className="flex items-center space-x-2 mt-4">
              {stat.trend === "up" ? (
                <ArrowUpRight className="w-4 h-4 text-emerald-500" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-500" />
              )}
              <span
                className={`text-sm font-semibold ${
                  stat.trend === "up" ? "text-emerald-500" : "text-red-500"
                }`}
              >
                {stat.change}
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                vs Last month
              </span>
            </div>

            {/* Progressbar */}
            <div className="mt-4 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full bg-linear-to-r ${stat.color} rounded-full transition-all duration-500`}
                style={{ width: stat.trend === "up" ? "75%" : "45%" }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default StatsGrid;
