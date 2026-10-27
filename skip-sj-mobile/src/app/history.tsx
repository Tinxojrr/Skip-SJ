import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Clock, CheckCircle2, XCircle, ShoppingBag, History } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

type Order = {
  id: string;
  estado: string;
  monto_total: number;
  created_at: string;
  codigo_retiro?: string;
  locatarios: {
    nombre: string;
  } | null;
  pedido_items: {
    cantidad: number;
    productos: {
      nombre_producto: string;
    } | null;
  }[];
};

export default function OrderHistoryScreen() {
  const router = useRouter();
  const { session } = useAuthStore();
  const { isDarkMode } = useThemeStore();

  const bg = isDarkMode ? '#09090B' : '#FAFAFA';
  const cardBg = isDarkMode ? '#18181B' : '#FFFFFF';
  const cardAlt = isDarkMode ? '#27272A' : '#F4F4F5';
  const textPrimary = isDarkMode ? '#F4F4F5' : '#111111';
  const textSecondary = isDarkMode ? '#A1A1AA' : 'rgba(17,17,17,0.5)';
  const borderColor = isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(17,17,17,0.05)';

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();

    if (!session?.user?.id) return;

    // Escuchar cambios de estado en tiempo real
    const channel = supabase
      .channel('public:pedidos')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pedidos',
          filter: `usuario_id=eq.${session.user.id}`
        },
        (payload) => {
          setOrders(prevOrders => prevOrders.map(order => {
            if (order.id === payload.new.id) {
              return { ...order, estado: payload.new.estado };
            }
            return order;
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      if (!session?.user?.id) return;

      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          id,
          estado,
          monto_total,
          created_at,
          codigo_retiro,
          locatarios ( nombre ),
          pedido_items (
            cantidad,
            productos ( nombre_producto )
          )
        `)
        .eq('usuario_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setOrders(data as any);
      
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'completado':
      case 'entregado':
        return { color: '#00A650', text: 'Entregado', icon: CheckCircle2 };
      case 'cancelado':
      case 'rechazada':
        return { color: '#E53E3E', text: 'Cancelado', icon: XCircle };
      case 'listo_retiro':
      case 'listo para retiro':
        return { color: '#003D7A', text: '¡Listo para Retiro!', icon: CheckCircle2 };
      case 'en_preparacion':
      case 'en preparacion':
      case 'preparando':
        return { color: '#FFBF00', text: 'En preparación', icon: Clock };
      case 'pagado':
      default:
        return { color: '#F2A900', text: 'Esperando al local...', icon: Clock };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16, backgroundColor: cardBg, borderBottomWidth: 1, borderBottomColor: borderColor }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8, marginLeft: -8 }}>
          <ArrowLeft color={textPrimary} size={24} />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontFamily: 'Inter-Bold', color: textPrimary, marginLeft: 12 }}>Historial de Pedidos</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#F2A900" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }}>
          {orders.map((order) => {
            const status = getStatusInfo(order.estado);
            const StatusIcon = status.icon;
            
            const itemsSummary = order.pedido_items
              ?.map(item => `${item.cantidad}x ${item.productos?.nombre_producto || 'Producto'}`)
              .join(', ') || 'Productos varios';

            return (
              <View 
                key={order.id} 
                style={{
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
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 12 }}>
                    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: cardAlt, justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                      <ShoppingBag color={textPrimary} size={20} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: 'Inter-Bold', fontSize: 16, color: textPrimary }} numberOfLines={1}>
                        {order.locatarios?.nombre || 'Local Duoc'}
                      </Text>
                      <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: textSecondary, marginTop: 2 }}>
                        {formatDate(order.created_at)}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ fontFamily: 'Inter-Bold', fontSize: 16, color: isDarkMode ? '#F2A900' : '#111111' }}>
                    ${order.monto_total.toLocaleString('es-CL')}
                  </Text>
                </View>

                {order.codigo_retiro && (
                  <View style={{ backgroundColor: isDarkMode ? '#1E293B' : 'rgba(0,61,122,0.05)', borderRadius: 12, padding: 12, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: isDarkMode ? '#38BDF8' : 'transparent' }}>
                    <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: textSecondary }}>CÓDIGO DE RETIRO</Text>
                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 24, color: isDarkMode ? '#38BDF8' : '#003D7A', marginTop: 2, letterSpacing: 2 }}>{order.codigo_retiro}</Text>
                  </View>
                )}

                <View style={{ paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: borderColor, marginBottom: 12 }}>
                  <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: textSecondary, lineHeight: 20 }}>
                    {itemsSummary}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: `${status.color}18`, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 }}>
                    <StatusIcon color={status.color} size={14} />
                    <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 13, color: status.color, marginLeft: 6 }}>
                      {status.text}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}

          {orders.length === 0 && (
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <History color={textSecondary} size={48} />
              <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 16, color: textPrimary, marginTop: 16 }}>
                Aún no tienes pedidos
              </Text>
              <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: textSecondary, marginTop: 8, textAlign: 'center' }}>
                Cuando pidas comida, tus órdenes aparecerán aquí.
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
