import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Clock, CheckCircle2, XCircle, ShoppingBag } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

type Order = {
  id: string;
  estado: string;
  monto_total: number;
  created_at: string;
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

// Datos de prueba por si la base de datos está vacía
const MOCK_ORDERS: Order[] = [
  {
    id: 'mock-1',
    estado: 'completado',
    monto_total: 4500,
    created_at: new Date().toISOString(),
    locatarios: { nombre: 'Casino Duoc' },
    pedido_items: [{ cantidad: 1, productos: { nombre_producto: 'Menú Junaeb Tradicional' } }]
  },
  {
    id: 'mock-2',
    estado: 'cancelado',
    monto_total: 2000,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    locatarios: { nombre: 'Cafetería Central' },
    pedido_items: [{ cantidad: 2, productos: { nombre_producto: 'Café Latte' } }]
  },
  {
    id: 'mock-3',
    estado: 'completado',
    monto_total: 3500,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    locatarios: { nombre: 'El Bajón Estudiantil' },
    pedido_items: [{ cantidad: 1, productos: { nombre_producto: 'Sándwich Ave Palta' } }]
  }
];

export default function OrderHistoryScreen() {
  const router = useRouter();
  const { session } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [session]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      if (!session?.user?.id) {
        setOrders(MOCK_ORDERS);
        return;
      }

      // Consulta real a Supabase (join con locatarios y pedido_items -> productos)
      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          id,
          estado,
          monto_total,
          created_at,
          locatarios ( nombre ),
          pedido_items (
            cantidad,
            productos ( nombre_producto )
          )
        `)
        .eq('usuario_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setOrders(data as any);
      } else {
        // Fallback a mock si no hay historial real
        setOrders(MOCK_ORDERS);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders(MOCK_ORDERS);
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
      case 'pendiente':
      case 'pendiente_pago':
      default:
        return { color: '#F2A900', text: 'En proceso', icon: Clock };
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: 'rgba(17,17,17,0.05)' }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8, marginLeft: -8 }}>
          <ArrowLeft color="#111111" size={24} />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontFamily: 'Inter-Bold', color: '#111111', marginLeft: 12 }}>Historial de Pedidos</Text>
      </View>

      {/* Content */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#F2A900" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }}>
          {orders.map((order) => {
            const status = getStatusInfo(order.estado);
            const StatusIcon = status.icon;
            
            // Texto de resumen de items (Ej: "1x Menú Junaeb...")
            const itemsSummary = order.pedido_items
              ?.map(item => `${item.cantidad}x ${item.productos?.nombre_producto || 'Producto'}`)
              .join(', ') || 'Productos varios';

            return (
              <View 
                key={order.id} 
                style={{
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
                {/* Order Header: Local & Price */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 12 }}>
                    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(17,17,17,0.05)', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                      <ShoppingBag color="#111111" size={20} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: 'Inter-Bold', fontSize: 16, color: '#111111' }} numberOfLines={1}>
                        {order.locatarios?.nombre || 'Local Duoc'}
                      </Text>
                      <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: 'rgba(17,17,17,0.5)', marginTop: 2 }}>
                        {formatDate(order.created_at)}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ fontFamily: 'Inter-Bold', fontSize: 16, color: '#111111' }}>
                    ${order.monto_total.toLocaleString('es-CL')}
                  </Text>
                </View>

                {/* Items Summary */}
                <View style={{ paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(17,17,17,0.05)', marginBottom: 12 }}>
                  <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: 'rgba(17,17,17,0.7)', lineHeight: 20 }}>
                    {itemsSummary}
                  </Text>
                </View>

                {/* Footer: Status & Reorder */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: `${status.color}15`, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                    <StatusIcon color={status.color} size={14} />
                    <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 12, color: status.color, marginLeft: 6 }}>
                      {status.text}
                    </Text>
                  </View>

                  <TouchableOpacity style={{ backgroundColor: '#111111', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16 }}>
                    <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 12, color: '#FFFFFF' }}>Volver a pedir</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          {orders.length === 0 && (
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <History color="rgba(17,17,17,0.2)" size={48} />
              <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 16, color: 'rgba(17,17,17,0.5)', marginTop: 16 }}>
                Aún no tienes pedidos
              </Text>
              <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: 'rgba(17,17,17,0.4)', marginTop: 8, textAlign: 'center' }}>
                Cuando pidas comida, tus órdenes aparecerán aquí.
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

