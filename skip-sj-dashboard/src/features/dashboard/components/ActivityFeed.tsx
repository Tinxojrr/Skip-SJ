import { useEffect, useState, useCallback } from "react";
import { ShoppingCart, CheckCircle2, ChefHat, Bell } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../context/AuthContext";

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: any;
  color: string;
  bgColor: string;
}

export function ActivityFeed() {
  const { locatarioId, role } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    if (!locatarioId && role !== 'super_admin') return;
    try {
      let query = supabase
        .from('pedidos')
        .select(`
          id,
          codigo_retiro,
          estado,
          monto_total,
          created_at,
          updated_at,
          usuarios ( p_nombre, apodo )
        `)
        .order('updated_at', { ascending: false })
        .limit(5);

      if (role !== 'super_admin' && locatarioId) {
        query = query.eq('locatario_id', locatarioId);
      }

      const { data, error } = await query;
      if (!error && data) {
        const mapped = data.map((p: any) => {
          const u = Array.isArray(p.usuarios) ? p.usuarios[0] : p.usuarios;
          const clientName = u?.apodo || u?.p_nombre || "Alumno";
          const codigo = p.codigo_retiro ? `[${p.codigo_retiro}]` : `#${p.id.substring(0, 5)}`;
          const time = new Date(p.updated_at || p.created_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });

          if (p.estado === 'completado') {
            return {
              id: p.id,
              title: "Pedido Entregado",
              description: `Pedido ${codigo} retirado por ${clientName}`,
              time,
              icon: CheckCircle2,
              color: "text-emerald-400",
              bgColor: "bg-emerald-500/10 border border-emerald-500/20",
            };
          } else if (p.estado === 'listo_retiro') {
            return {
              id: p.id,
              title: "Listo en Mostrador",
              description: `${codigo} esperando retiro de ${clientName}`,
              time,
              icon: Bell,
              color: "text-blue-400",
              bgColor: "bg-blue-500/10 border border-blue-500/20",
            };
          } else if (p.estado === 'en_preparacion') {
            return {
              id: p.id,
              title: "Preparando en Cocina",
              description: `${codigo} entró a cocina`,
              time,
              icon: ChefHat,
              color: "text-amber-400",
              bgColor: "bg-amber-500/10 border border-amber-500/20",
            };
          } else {
            return {
              id: p.id,
              title: "Nuevo Pedido Pagado",
              description: `${clientName} pagó $${p.monto_total.toLocaleString('es-CL')} ${codigo}`,
              time,
              icon: ShoppingCart,
              color: "text-purple-400",
              bgColor: "bg-purple-500/10 border border-purple-500/20",
            };
          }
        });

        setActivities(mapped);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [locatarioId, role]);

  useEffect(() => {
    fetchActivities();

    const channel = supabase.channel('activity-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, () => {
        fetchActivities();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchActivities]);

  return (
    <div className="bg-white dark:bg-[#111116] rounded-2xl border border-zinc-200 dark:border-zinc-800/80 p-5 shadow-xs">
      <div className="border-b border-zinc-200 dark:border-zinc-800/80 pb-3.5 mb-3.5">
        <h3 className="text-base font-bold text-zinc-900 dark:text-white">
          Actividad Reciente
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Eventos en tiempo real
        </p>
      </div>

      <div className="space-y-2.5">
        {loading ? (
          <p className="text-xs text-zinc-400 text-center py-4">Cargando...</p>
        ) : activities.length === 0 ? (
          <p className="text-xs text-zinc-400 text-center py-4">Sin actividad reciente</p>
        ) : (
          activities.map((act) => {
            const IconComponent = act.icon;
            return (
              <div 
                key={act.id} 
                className="flex items-start space-x-3 p-2.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
              >
                <div className={`p-2 rounded-lg shrink-0 ${act.bgColor}`}>
                  <IconComponent className={`w-3.5 h-3.5 ${act.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                      {act.title}
                    </h4>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {act.time}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                    {act.description}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default ActivityFeed;
