import { MoreHorizontal, TrendingDown, TrendingUp } from "lucide-react";

function TableSection() {
  const recentOrders = [
    {
      id: "#3847",
      customer: "Felipe Crisostomo",
      product: "Empanada Mechada Queso",
      amount: "$2,900",
      status: "completado",
      date: "2026-07-03",
    },
    {
      id: "#3848",
      customer: "Martín Aburto",
      product: "Pizza de Pepperoni",
      amount: "$2,990",
      status: "pendiente",
      date: "2026-07-05",
    },
    {
      id: "#3849",
      customer: "Juan Manuel Pizarro",
      product: "Chaparrita",
      amount: "$2,150",
      status: "pendiente",
      date: "2026-07-08",
    },
    {
      id: "#3850",
      customer: "Amaro Astudillo",
      product: "Empanada Napolitana",
      amount: "$2,350",
      status: "cancelado",
      date: "2026-07-10",
    },
    {
      id: "#3851",
      customer: "Sebastián Núñez",
      product: "Pizza de Pepperoni",
      amount: "$2,990",
      status: "completado",
      date: "2026-07-12",
    },
  ];

  const topProducts = [
    {
      name: "Chaparrita",
      sales: "2,150",
      revenue: "$1,187,550",
      trend: "up",
      change: "+15%",
    },
    {
      name: "Empanada Mechada Queso",
      sales: "2,350",
      revenue: "$5,336,000",
      trend: "up",
      change: "+12%",
    },
    {
      name: "Pizza de Pepperoni",
      sales: "2,990",
      revenue: "$5,742,000",
      trend: "down",
      change: "-4%",
    },
    {
      name: "Empanada Napolitana",
      sales: "2,350",
      revenue: "$3,626,000",
      trend: "up",
      change: "+8%",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completado":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "pendiente":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "cancelado":
        return "bg-red-100 text-slate-700 dark:bg-red-900/30 dark:text-red-400";
    }
  };
  return (
    <div className="space-y-6">
      {/* Recent Order */}
      <div className="bg-white/80' dark:bg-slate-900/80 backdrop-blur-xl rounded-b-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
        <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                Pedidos recientes
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Últimos pedidos de clientes
              </p>
            </div>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Ver todos
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-slate-600">
                  Order ID
                </th>
                <th className="text-left p-4 text-sm font-semibold text-slate-600">
                  Clientes
                </th>
                <th className="text-left p-4 text-sm font-semibold text-slate-600">
                  Productos
                </th>
                <th className="text-left p-4 text-sm font-semibold text-slate-600">
                  monto
                </th>
                <th className="text-left p-4 text-sm font-semibold text-slate-600">
                  Estado
                </th>
                <th className="text-left p-4 text-sm font-semibold text-slate-600">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order, index) => {
                return (
                  <tr className="border-b border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4" key={index}>
                      <span className="text-sm text-slate-800 dark:text-white">
                        {order.id}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-slate-800 dark:text-white">
                        {order.customer}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-slate-800 dark:text-white">
                        {order.product}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-slate-800 dark:text-white">
                        {order.amount}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-slate-400 dark:text-white font-medium text-xs px-3 py-1 rounded-full 
                                    ${getStatusColor(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-slate-400 dark:text-white font-medium text-xs px-3 py-1 rounded-full`}
                      >
                        {order.date}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-slate-800 dark:text-white">
                        <MoreHorizontal className="w-4 h-4" />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {/* Top Products */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
        <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="text-lg font-bold text-slate-800 dark:text-white">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                Productos Destacados
              </h3>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Productos con mejor desempeño
            </p>
          </div>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Ver todos
          </button>
        </div>

        {/* Dynamic Data */}
        <div className="p-6 space-y-4">
          {topProducts.map((product) => {
            return (
              <div
                className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50
               dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-white">
                    {product.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {product.sales}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-400">
                    {product.revenue}
                  </p>
                  <div className="flex items-center space-x-1">
                    {product.trend === "up" ?( <TrendingUp className="w-3 h-3 text-emerald-500"/>
                        ) : (<TrendingDown className="w-3 h-3 text-red-500" />)}
                    <span className={`text-xs font-medium ${product.trend === "up" ? "text-emerald-500" : "text-red-500"}`}>{product.change}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default TableSection;
