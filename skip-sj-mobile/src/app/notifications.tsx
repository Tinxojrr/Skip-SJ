import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, ShoppingBag, Tag, Info, CheckCircle2, Clock, Sparkles } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

type Notification = {
  id: string;
  tipo: string;
  titulo?: string;
  mensaje?: string;
  created_at: string;
  enviado?: boolean;
};

export default function NotificationsScreen() {
  const router = useRouter();
  const { session } = useAuthStore();
  const { isDarkMode } = useThemeStore();

  const bg = isDarkMode ? '#09090B' : '#FAFAFA';
  const cardBg = isDarkMode ? '#18181B' : '#FFFFFF';
  const cardAlt = isDarkMode ? '#27272A' : '#F4F4F5';
  const textPrimary = isDarkMode ? '#F4F4F5' : '#111111';
  const textSecondary = isDarkMode ? '#A1A1AA' : 'rgba(17,17,17,0.5)';
  const borderColor = isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(17,17,17,0.05)';

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();

    // Suscripción en Tiempo Real para recibir notificaciones al instante
    const channel = supabase
      .channel('notificaciones-live')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pedidos',
          filter: session?.user?.id ? `usuario_id=eq.${session.user.id}` : undefined
        },
        (payload) => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const notifsList: Notification[] = [];

      // 1. Obtener pedidos recientes del usuario para generar notificaciones inteligentes
      if (session?.user?.id) {
        const { data: pedidosData } = await supabase
          .from('pedidos')
          .select('id, estado, codigo_retiro, created_at, updated_at, locatarios(nombre)')
          .eq('usuario_id', session.user.id)
          .order('updated_at', { ascending: false })
          .limit(10);

        if (pedidosData && pedidosData.length > 0) {
          pedidosData.forEach((p: any) => {
            const locName = p.locatarios?.nombre || 'Casino';
            const code = p.codigo_retiro || '----';

            if (p.estado === 'listo_retiro') {
              notifsList.push({
                id: `p-${p.id}-listo`,
                tipo: 'pedido_listo',
                titulo: '¡Tu pedido está listo para retiro! 🎉',
                mensaje: `Dirígete al mesón de ${locName} y dicta tu código ${code}.`,
                created_at: p.updated_at || p.created_at
              });
            } else if (p.estado === 'en_preparacion') {
              notifsList.push({
                id: `p-${p.id}-cocina`,
                tipo: 'en_preparacion',
                titulo: '👨‍🍳 Pedido en preparación',
                mensaje: `${locName} está cocinando tu orden (Código: ${code}).`,
                created_at: p.updated_at || p.created_at
              });
            } else if (p.estado === 'pagado') {
              notifsList.push({
                id: `p-${p.id}-recibido`,
                tipo: 'pedido_recibido',
                titulo: 'Pedido recibido y pagado',
                mensaje: `Tu orden para ${locName} está en la cola de cocina. Código: ${code}.`,
                created_at: p.created_at
              });
            } else if (p.estado === 'completado') {
              notifsList.push({
                id: `p-${p.id}-completado`,
                tipo: 'completado',
                titulo: 'Pedido entregado en mesón',
                mensaje: `¡Que disfrutes tu comida! Pedido ${code} finalizado con éxito.`,
                created_at: p.updated_at || p.created_at
              });
            }
          });
        }
      }

      // 2. Notificaciones promocionales institucionales de Duoc UC
      notifsList.push({
        id: 'promo-junaeb-1',
        tipo: 'promo_activa',
        titulo: 'Beneficio BAES habilitado 🥗',
        mensaje: 'Aceptamos Tarjeta Junaeb Sodexo / Edenred en Casino Central San Joaquín.',
        created_at: new Date(Date.now() - 3600000 * 2).toISOString()
      });

      notifsList.push({
        id: 'welcome-skip-1',
        tipo: 'info',
        titulo: '¡Bienvenido a SKIP Duoc UC! 🚀',
        mensaje: 'Olvídate de las filas en tus recreos. Pide con anticipación y retira en 1 minuto.',
        created_at: new Date(Date.now() - 86400000 * 3).toISOString()
      });

      // Ordenar por fecha descendente
      notifsList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setNotifications(notifsList);

    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationDetails = (notif: Notification) => {
    switch (notif.tipo?.toLowerCase()) {
      case 'pedido_listo':
        return {
          icon: ShoppingBag,
          color: '#16A34A',
          bgColor: 'rgba(22, 163, 74, 0.1)',
          title: notif.titulo || '¡Tu pedido está listo!',
          message: notif.mensaje || 'Acércate al mesón señalizado para retirar tu comida.'
        };
      case 'en_preparacion':
        return {
          icon: Clock,
          color: '#0284C7',
          bgColor: 'rgba(2, 132, 199, 0.1)',
          title: notif.titulo || 'En preparación',
          message: notif.mensaje || 'El local está preparando tu pedido.'
        };
      case 'pedido_recibido':
        return {
          icon: ShoppingBag,
          color: '#F2A900',
          bgColor: 'rgba(242, 169, 0, 0.12)',
          title: notif.titulo || 'Pedido recibido',
          message: notif.mensaje || 'El local ha recibido tu orden y entrará a cocina.'
        };
      case 'completado':
        return {
          icon: CheckCircle2,
          color: '#6B7280',
          bgColor: 'rgba(107, 114, 128, 0.1)',
          title: notif.titulo || 'Pedido completado',
          message: notif.mensaje || 'Tu orden fue entregada en mesón.'
        };
      case 'promo_activa':
        return {
          icon: Tag,
          color: '#E53E3E',
          bgColor: 'rgba(229, 62, 62, 0.1)',
          title: notif.titulo || '¡Nueva promoción disponible!',
          message: notif.mensaje || 'Aprovecha descuentos exclusivos para la sede San Joaquín.'
        };
      default:
        return {
          icon: Info,
          color: '#003D7A',
          bgColor: 'rgba(0, 61, 122, 0.08)',
          title: notif.titulo || 'Notificación',
          message: notif.mensaje || 'Tienes un nuevo mensaje del sistema.'
        };
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diffInMinutes < 1) return 'Ahora mismo';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours} h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Ayer';
    return `Hace ${diffInDays} d`;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      
      {/* Header */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingHorizontal: 20, 
        paddingVertical: 16, 
        backgroundColor: cardBg, 
        borderBottomWidth: 1, 
        borderBottomColor: borderColor 
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 6, marginLeft: -6 }}>
            <ArrowLeft color={textPrimary} size={24} />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontFamily: 'Inter-Bold', color: textPrimary, marginLeft: 10 }}>
            Notificaciones
          </Text>
        </View>

        <View style={{ backgroundColor: isDarkMode ? 'rgba(242,169,0,0.18)' : 'rgba(242,169,0,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
          <Text style={{ color: isDarkMode ? '#F2A900' : '#B45309', fontFamily: 'Inter-Bold', fontSize: 12 }}>
            {notifications.length} {notifications.length === 1 ? 'activa' : 'activas'}
          </Text>
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#F2A900" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }} showsVerticalScrollIndicator={false}>
          {notifications.map((notif) => {
            const details = getNotificationDetails(notif);
            const Icon = details.icon;

            return (
              <View 
                key={notif.id}
                style={{
                  flexDirection: 'row',
                  backgroundColor: cardBg,
                  borderRadius: 20,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: borderColor,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: isDarkMode ? 0.25 : 0.03,
                  shadowRadius: 8,
                  elevation: 2
                }}
              >
                {/* Icon Wrapper */}
                <View style={{ 
                  width: 44, 
                  height: 44, 
                  borderRadius: 14, 
                  backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : details.bgColor, 
                  justifyContent: 'center', 
                  alignItems: 'center' 
                }}>
                  <Icon color={details.color} size={22} />
                </View>

                {/* Text Content */}
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: textPrimary, flex: 1, marginRight: 8 }}>
                      {details.title}
                    </Text>
                    <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 11, color: textSecondary }}>
                      {formatTimeAgo(notif.created_at)}
                    </Text>
                  </View>
                  <Text style={{ fontFamily: 'Inter-Regular', fontSize: 13, color: textSecondary, lineHeight: 18 }}>
                    {details.message}
                  </Text>
                </View>
              </View>
            );
          })}

          {notifications.length === 0 && (
            <View style={{ alignItems: 'center', marginTop: 80 }}>
              <Bell color={textSecondary} size={48} />
              <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 16, color: textPrimary, marginTop: 16 }}>
                Nada por aquí
              </Text>
              <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: textSecondary, marginTop: 8, textAlign: 'center' }}>
                Te avisaremos cuando tu comida esté lista o tengamos promociones para ti.
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
