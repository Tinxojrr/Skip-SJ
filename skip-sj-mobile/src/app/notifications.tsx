import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, ShoppingBag, Tag, Info } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

type Notification = {
  id: string;
  tipo: string;
  created_at: string;
  enviado: boolean;
};

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    tipo: 'pedido_listo',
    created_at: new Date().toISOString(),
    enviado: true
  },
  {
    id: 'n2',
    tipo: 'promo_activa',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    enviado: true
  },
  {
    id: 'n3',
    tipo: 'pedido_recibido',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    enviado: true
  }
];

export default function NotificationsScreen() {
  const router = useRouter();
  const { session } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, [session]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      if (!session?.user?.id) {
        setNotifications(MOCK_NOTIFICATIONS);
        return;
      }

      const { data, error } = await supabase
        .from('notificaciones')
        .select('*')
        .eq('usuario_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setNotifications(data as any);
      } else {
        setNotifications(MOCK_NOTIFICATIONS);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications(MOCK_NOTIFICATIONS);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationDetails = (tipo: string) => {
    switch (tipo?.toLowerCase()) {
      case 'pedido_listo':
        return {
          icon: ShoppingBag,
          color: '#00A650',
          title: '¡Tu pedido está listo!',
          message: 'Acércate al local para retirar tu comida con tu código QR.'
        };
      case 'pedido_recibido':
        return {
          icon: ShoppingBag,
          color: '#F2A900',
          title: 'Pedido recibido',
          message: 'El local ha recibido tu orden y la está preparando.'
        };
      case 'promo_activa':
        return {
          icon: Tag,
          color: '#E53E3E',
          title: '¡Nueva promoción disponible!',
          message: 'Hay un 15% de descuento en colaciones completas en el Casino.'
        };
      default:
        return {
          icon: Info,
          color: '#3B82F6',
          title: 'Notificación',
          message: 'Tienes un nuevo mensaje del sistema.'
        };
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours} horas`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Ayer';
    return `Hace ${diffInDays} días`;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: 'rgba(17,17,17,0.05)' }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8, marginLeft: -8 }}>
          <ArrowLeft color="#111111" size={24} />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontFamily: 'Inter-Bold', color: '#111111', marginLeft: 12 }}>Notificaciones</Text>
      </View>

      {/* Content */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#F2A900" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }}>
          {notifications.map((notif) => {
            const details = getNotificationDetails(notif.tipo);
            const Icon = details.icon;

            return (
              <View 
                key={notif.id}
                style={{
                  flexDirection: 'row',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 20,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: 'rgba(17,17,17,0.05)',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.03,
                  shadowRadius: 8,
                  elevation: 1
                }}
              >
                {/* Icon Wrapper */}
                <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: `${details.color}15`, justifyContent: 'center', alignItems: 'center' }}>
                  <Icon color={details.color} size={24} />
                </View>

                {/* Text Content */}
                <View style={{ flex: 1, marginLeft: 16 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 15, color: '#111111', flex: 1, marginRight: 8 }}>
                      {details.title}
                    </Text>
                    <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 12, color: 'rgba(17,17,17,0.4)' }}>
                      {formatTimeAgo(notif.created_at)}
                    </Text>
                  </View>
                  <Text style={{ fontFamily: 'Inter-Regular', fontSize: 13, color: 'rgba(17,17,17,0.6)', lineHeight: 18 }}>
                    {details.message}
                  </Text>
                </View>
              </View>
            );
          })}

          {notifications.length === 0 && (
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <Bell color="rgba(17,17,17,0.2)" size={48} />
              <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 16, color: 'rgba(17,17,17,0.5)', marginTop: 16 }}>
                Nada por aquí
              </Text>
              <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: 'rgba(17,17,17,0.4)', marginTop: 8, textAlign: 'center' }}>
                Te avisaremos cuando tu comida esté lista o tengamos promociones para ti.
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

