import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Search, Plus, MapPin } from 'lucide-react-native';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { useRouter, useFocusEffect } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  const [activeStore, setActiveStore] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('Todos');
  
  const [stores, setStores] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [activePromo, setActivePromo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const { session, profile } = useAuthStore();
  
  let shortName = 'Estudiante';
  if (profile && profile.apodo) {
    shortName = profile.apodo;
  } else if (profile && profile.p_nombre) {
    shortName = profile.p_nombre;
  } else if (session?.user?.user_metadata?.full_name && typeof session.user.user_metadata.full_name === 'string') {
    shortName = session.user.user_metadata.full_name.split(' ')[0];
  }

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        setLoading(true);
        try {
          // Fetch locales activos
          const { data: locatariosData } = await supabase
            .from('locatarios')
            .select('*')
            .eq('activo', true);
          
          // Fetch categorias
          const { data: categoriasData } = await supabase
            .from('categorias_menu')
            .select('*')
            .order('orden', { ascending: true });

          // Fetch productos
          const { data: productosData } = await supabase
            .from('productos')
            .select('*, locatarios ( nombre ), categorias_menu ( nombre )')
            .eq('disponible', true);

          // Fetch promociones
          const { data: promoData } = await supabase
            .from('promociones')
            .select('*, productos ( nombre_producto, descripcion, imagen_url, precio ), locatarios ( nombre )')
            .eq('activa', true)
            .limit(1)
            .single();

          if (promoData) setActivePromo(promoData);
          else setActivePromo(null);

          // Fetch active order
          let currentOrder = null;
          if (session?.user?.id) {
            const { data: orderData } = await supabase
              .from('pedidos')
              .select('*, locatarios(nombre)')
              .eq('usuario_id', session.user.id)
              .in('estado', ['pendiente_pago', 'pagado', 'en_preparacion', 'listo_retiro'])
              .order('created_at', { ascending: false })
              .limit(1)
              .single();
              
            if (orderData) {
              setActiveOrder(orderData);
              currentOrder = orderData;
            } else {
              setActiveOrder(null);
            }
          }

          if (locatariosData) setStores(locatariosData);
          if (categoriasData) setCategories(categoriasData);
          if (productosData) setProducts(productosData);
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();

      // Suscripción a cambios en Tiempo Real
      let orderSubscription: any = null;
      if (session?.user?.id) {
        orderSubscription = supabase
          .channel('pedidos-channel')
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'pedidos',
              filter: 'usuario_id=eq.' + session.user.id
            },
            (payload) => {
              console.log('Cambio en tiempo real recibido!', payload);
              setActiveOrder((prevOrder: any) => {
                if (prevOrder && prevOrder.id === payload.new.id) {
                  return { ...prevOrder, estado: payload.new.estado };
                }
                return prevOrder;
              });
            }
          )
          .subscribe();
      }

      return () => {
        if (orderSubscription) {
          supabase.removeChannel(orderSubscription);
        }
      };
    }, [session])
  );

  const filteredProducts = products.filter(p => {
    const matchStore = activeStore ? p.locatario_id === activeStore : true;
    const matchCategory = activeCategory === 'Todos' ? true : p.categorias_menu?.nombre === activeCategory;
    return matchStore && matchCategory;
  });

  const getGreetingSubtitle = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'Recarga energía para tus primeras clases.';
    if (hour >= 12 && hour < 16) return 'Pausa para almorzar y seguir estudiando.';
    if (hour >= 16 && hour < 20) return 'Un snack para sobrevivir al último bloque.';
    return '¿Estudiando hasta tarde? Date un gusto.';
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAFA', paddingTop: 40 }}>
      {loading && products.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#F2A900" />
          <Text style={{ marginTop: 16, fontFamily: 'Inter-Regular', color: '#111111' }}>Cargando menús...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          
          <View style={{ paddingHorizontal: 24, paddingTop: 32, paddingBottom: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1, paddingRight: 16 }}>
              <Text style={{ color: '#111111', fontSize: 30, fontFamily: 'Inter-Bold', marginBottom: 6 }} numberOfLines={2}>Hola, {shortName} 👋</Text>
              <Text style={{ color: 'rgba(17,17,17,0.6)', fontSize: 15, fontFamily: 'Inter-Regular', lineHeight: 22, flexWrap: 'wrap', flexShrink: 1 }}>{getGreetingSubtitle()}</Text>
            </View>
            <View style={{ backgroundColor: '#111111', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, flexShrink: 0, marginTop: 4 }}>
              <Text style={{ color: '#F2A900', fontSize: 10, fontFamily: 'Inter-Bold', textTransform: 'uppercase', letterSpacing: 0.5 }}>Duoc UC</Text>
            </View>
          </View>

          {activeOrder && (
            <TouchableOpacity 
              onPress={() => router.push('/history')}
              style={{ 
                marginHorizontal: 24, 
                marginBottom: 28, 
                backgroundColor: '#003D7A', 
                borderRadius: 20, 
                padding: 20,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                shadowColor: '#003D7A',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 4
              }}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#00FF66', marginRight: 8 }} />
                  <Text style={{ color: '#FFFFFF', fontSize: 13, fontFamily: 'Inter-SemiBold', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {activeOrder.estado === 'pendiente_pago' ? 'Pendiente de pago' : 
                     activeOrder.estado === 'pagado' ? 'Pedido recibido' :
                     activeOrder.estado === 'en_preparacion' ? 'En preparación' : 'Listo para retirar'}
                  </Text>
                </View>
                <Text style={{ color: '#FFFFFF', fontSize: 18, fontFamily: 'Inter-Bold', marginBottom: 4 }}>
                  {activeOrder.locatarios?.nombre}
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontFamily: 'Inter-Regular' }}>
                  Código: <Text style={{ color: '#F2A900', fontFamily: 'Inter-Bold' }}>{activeOrder.codigo_retiro}</Text>
                </Text>
              </View>
              <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: 12, borderRadius: 16 }}>
                <Text style={{ fontSize: 24 }}>🛵</Text>
              </View>
            </TouchableOpacity>
          )}

          {activePromo ? (
            <TouchableOpacity onPress={() => router.push('/product/' + activePromo.producto_id)} style={{ paddingHorizontal: 24, marginBottom: 28 }}>
              <View style={{ 
                backgroundColor: '#111111', 
                borderRadius: 24, 
                padding: 20,
                flexDirection: 'row',
                alignItems: 'center',
                overflow: 'hidden'
              }}>
                <View style={{ flex: 1, zIndex: 10 }}>
                  <View style={{ backgroundColor: '#F2A900', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginBottom: 8 }}>
                    <Text style={{ fontSize: 10, fontFamily: 'Inter-Bold', color: '#111111', textTransform: 'uppercase' }}>-{activePromo.descuento_porcentaje}% DCTO</Text>
                  </View>
                  <Text style={{ color: '#FFFFFF', fontSize: 20, fontFamily: 'Inter-Bold', marginBottom: 4 }}>{activePromo.productos?.nombre_producto}</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontFamily: 'Inter-Regular' }}>En {activePromo.locatarios?.nombre}</Text>
                </View>
                {activePromo.productos?.imagen_url ? (
                   <Image source={{ uri: activePromo.productos.imagen_url }} style={{ width: 80, height: 80, borderRadius: 40, position: 'absolute', right: -10, bottom: -10 }} />
                ) : (
                  <View style={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.8 }}>
                    <Text style={{ fontSize: 100 }}>🔥</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ) : (
            <View style={{ paddingHorizontal: 24, marginBottom: 28 }}>
              <View style={{ 
                backgroundColor: '#111111', 
                borderRadius: 24, 
                padding: 20,
                flexDirection: 'row',
                alignItems: 'center',
                overflow: 'hidden'
              }}>
                <View style={{ flex: 1, zIndex: 10 }}>
                  <View style={{ backgroundColor: '#F2A900', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginBottom: 8 }}>
                    <Text style={{ fontSize: 10, fontFamily: 'Inter-Bold', color: '#111111', textTransform: 'uppercase' }}>Promoción</Text>
                  </View>
                  <Text style={{ color: '#FFFFFF', fontSize: 20, fontFamily: 'Inter-Bold', marginBottom: 4 }}>Almuerzos Junaeb</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontFamily: 'Inter-Regular' }}>Pide rápido sin filas en el Casino</Text>
                </View>
                <View style={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.8 }}>
                  <Text style={{ fontSize: 100 }}>🍔</Text>
                </View>
              </View>
            </View>
          )}

          <View style={{ paddingHorizontal: 24, marginBottom: 28 }}>
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              backgroundColor: '#FFFFFF', 
              paddingHorizontal: 20, 
              paddingVertical: 16, 
              borderRadius: 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.05,
              shadowRadius: 12,
              elevation: 2,
              borderWidth: 1,
              borderColor: 'rgba(17,17,17,0.05)'
            }}>
              <Search color="#F2A900" size={20} />
              <Text style={{ marginLeft: 12, color: 'rgba(17,17,17,0.4)', fontSize: 16, fontFamily: 'Inter-Regular' }}>Buscar comida, snacks...</Text>
            </View>
          </View>

          <View style={{ marginBottom: 32 }}>
            <Text style={{ color: '#111111', fontSize: 18, fontFamily: 'Inter-Bold', marginBottom: 16, paddingHorizontal: 24 }}>¿De dónde quieres pedir?</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}>
              <TouchableOpacity 
                onPress={() => setActiveStore(null)}
                style={{ alignItems: 'center' }}
              >
                <View style={{ 
                  width: 72, 
                  height: 72, 
                  borderRadius: 24, 
                  backgroundColor: activeStore === null ? '#111111' : '#FFFFFF',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: 'rgba(17,17,17,0.05)',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.05,
                  shadowRadius: 12,
                  elevation: 2,
                  marginBottom: 8
                }}>
                  <Text style={{ fontSize: 28 }}>🌟</Text>
                </View>
                <Text style={{ color: '#111111', fontSize: 13, fontFamily: activeStore === null ? 'Inter-Bold' : 'Inter-SemiBold', textAlign: 'center' }}>Todos</Text>
              </TouchableOpacity>

              {stores.map((store) => (
                <TouchableOpacity 
                  key={store.id} 
                  onPress={() => setActiveStore(store.id)}
                  style={{ alignItems: 'center', width: 76 }}
                >
                  <View style={{ 
                    width: 72, 
                    height: 72, 
                    borderRadius: 24, 
                    backgroundColor: activeStore === store.id ? '#111111' : '#FFFFFF',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: 'rgba(17,17,17,0.05)',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.05,
                    shadowRadius: 12,
                    elevation: 2,
                    marginBottom: 8,
                    overflow: 'hidden'
                  }}>
                    {store.imagen_url ? (
                      <Image source={{ uri: store.imagen_url }} style={{ width: '100%', height: '100%' }} />
                    ) : (
                      <Text style={{ fontSize: 28 }}>{store.emoji || '🏪'}</Text>
                    )}
                  </View>
                  <Text style={{ color: '#111111', fontSize: 13, fontFamily: activeStore === store.id ? 'Inter-Bold' : 'Inter-Regular', textAlign: 'center' }} numberOfLines={1}>
                    {store.nombre}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={{ marginBottom: 32 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}>
              <TouchableOpacity 
                onPress={() => setActiveCategory('Todos')}
                style={{ 
                  backgroundColor: activeCategory === 'Todos' ? '#111111' : '#FFFFFF', 
                  paddingHorizontal: 20, 
                  paddingVertical: 10, 
                  borderRadius: 100,
                  borderWidth: 1,
                  borderColor: 'rgba(17,17,17,0.05)'
                }}
              >
                <Text style={{ color: activeCategory === 'Todos' ? '#FFFFFF' : 'rgba(17,17,17,0.6)', fontSize: 14, fontFamily: activeCategory === 'Todos' ? 'Inter-Bold' : 'Inter-SemiBold' }}>Todos</Text>
              </TouchableOpacity>
              
              {categories.map((cat) => (
                <TouchableOpacity 
                  key={cat.id}
                  onPress={() => setActiveCategory(cat.nombre)}
                  style={{ 
                    backgroundColor: activeCategory === cat.nombre ? '#111111' : '#FFFFFF', 
                    paddingHorizontal: 20, 
                    paddingVertical: 10, 
                    borderRadius: 100,
                    borderWidth: 1,
                    borderColor: 'rgba(17,17,17,0.05)'
                  }}
                >
                  <Text style={{ color: activeCategory === cat.nombre ? '#FFFFFF' : 'rgba(17,17,17,0.6)', fontSize: 14, fontFamily: activeCategory === cat.nombre ? 'Inter-Bold' : 'Inter-SemiBold' }}>
                    {cat.nombre}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={{ paddingHorizontal: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ color: '#111111', fontSize: 20, fontFamily: 'Inter-Bold' }}>
                {activeCategory === 'Todos' ? 'Todos los productos 🔥' : activeCategory}
              </Text>
              <Text style={{ color: 'rgba(17,17,17,0.4)', fontSize: 14, fontFamily: 'Inter-Regular' }}>{filteredProducts.length} items</Text>
            </View>

            <View style={{ gap: 20 }}>
              {filteredProducts.map((product) => (
                <TouchableOpacity 
                  key={product.id}
                  onPress={() => router.push('/product/' + product.id)}
                  style={{ 
                    flexDirection: 'row', 
                    backgroundColor: '#FFFFFF', 
                    borderRadius: 24, 
                    padding: 16,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.05,
                    shadowRadius: 24,
                    elevation: 4,
                    borderWidth: 1,
                    borderColor: 'rgba(17,17,17,0.03)'
                  }}>
                  <View style={{ width: 100, height: 100, borderRadius: 16, backgroundColor: '#FAFAFA', justifyContent: 'center', alignItems: 'center', marginRight: 16, overflow: 'hidden' }}>
                    {product.imagen_url ? (
                      <Image source={{ uri: product.imagen_url }} style={{ width: '100%', height: '100%' }} />
                    ) : (
                      <Text style={{ fontSize: 40 }}>{product.emoji || '🍔'}</Text>
                    )}
                  </View>
                  <View style={{ flex: 1, justifyContent: 'space-between', paddingVertical: 4 }}>
                    <View>
                      <Text style={{ color: 'rgba(17,17,17,0.4)', fontSize: 11, fontFamily: 'Inter-Bold', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                        {product.locatarios?.nombre || 'Local'} • {product.categorias_menu?.nombre || 'General'}
                      </Text>
                      <Text style={{ color: '#111111', fontSize: 16, fontFamily: 'Inter-Bold', marginBottom: 4 }} numberOfLines={2}>
                        {product.nombre_producto}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ backgroundColor: 'rgba(242,169,0,0.15)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 }}>
                        <Text style={{ color: '#000000', fontSize: 15, fontFamily: 'Inter-Bold' }}>${product.precio}</Text>
                      </View>
                      <View style={{ backgroundColor: '#111111', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' }}>
                        <Plus color="#F2A900" size={20} />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            
            {filteredProducts.length === 0 && (
              <View style={{ alignItems: 'center', paddingVertical: 40, backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(17,17,17,0.05)' }}>
                <Text style={{ fontSize: 48, marginBottom: 16 }}>🔍</Text>
                <Text style={{ fontFamily: 'Inter-Bold', fontSize: 18, color: '#111111', marginBottom: 8 }}>No hay productos</Text>
                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: 'rgba(17,17,17,0.5)', textAlign: 'center', paddingHorizontal: 32 }}>
                  Intenta seleccionando otra categoría o local.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
