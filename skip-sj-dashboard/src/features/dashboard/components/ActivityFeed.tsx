import { Bell, Clock, CreditCard, Settings, ShoppingCart, User } from "lucide-react";

function ActivityFeed() {

    const activities = [
        {
            id: 1,
            type: "user",
            icon: User,
            title: "Nuevo Usuario Registrado",
            description: "Felipe Crisostomo a creado una cuenta",
            time: "Hace 2 minutos",
            color: "text-blue-500",
            bgColor: "bg-blue-100 dark:bg-blue-900/30"
        },
        {
            id: 2,
            type: "order",
            icon: ShoppingCart,
            title: "Nueva Orden Recibida",
            description: "Orden #3847 de $2,990 Empanada Mechada Queso",
            time: "Hace 5 minutos",
            color: "text-emerald-500",
            bgColor: "bg-emerald-100 dark:bg-emerald-900/30"
        },
        {
            id: 3,
            type: "payment",
            icon: CreditCard,
            title: "Pago procesado",
            description: "Pago de $2,990 completado",
            time: "Hace 12 minutos",
            color: "text-purple-500",
            bgColor: "bg-purple-100 dark:bg-purple-900/30"
        },
        {
            id: 4,
            type: "system",
            icon: Settings,
            title: "Sistema Actualizado",
            description: "* Respaldo de base de datos completada *",
            time: "Hace 1 hora",
            color: "text-orange-500",
            bgColor: "bg-orange-100 dark:bg-orange-900/30"
        },
        {
            id: 5,
            type: "notification",
            icon: Bell,
            title: "Alerta de stock bajo",
            description: "Stock bajo de Empanadas Mechada Queso",
            time: "Hace 30 minutos",
            color: "text-red-500",
            bgColor: "bg-red-100 dark:bg-red-900/30"
        },
    ]
  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
      <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
        <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                historial de actividad
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
                Actividades Recientes del Sistema
            </p>
        </div>
        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Ver todos
        </button>
      </div>
      <div className="p-6 ">
        <div className="space-y-4">
            {activities.map((activity)=>{
                return(
                    <div className="flex items-start space-x-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className={`p-2 rounded-lg ${activity.bgColor}`}>
                            <activity.icon className={`w-4 h-4 ${activity.color}`}/>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-slate-800 dark:text-white">
                                {activity.title}
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                                {activity.description}
                            </p>
                            <div className="flex items-center-safe space-x-1 mt-1">
                                <Clock className="w-3 h-3 text-slate-400"/>
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                    {activity.time} 
                                </span>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
      </div>
    </div>
  );
}

export default ActivityFeed;
