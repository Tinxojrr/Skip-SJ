import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCartStore } from '../../store/cartStore';
import { useRouter } from 'expo-router';
import { Minus, Plus, Trash2, ShoppingCart, Receipt, Store } from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

export default function CartScreen() {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();
  const router = useRouter();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const subtotal = getTotal();
  const serviceFee = items.length > 0 ? 300 : 0; // $300 fijo
  const total = subtotal + serviceFee;

  const handleCheckout = () => {
    setIsCheckingOut(true);
    // Simular un retraso corto y mostrar "Éxito"
    setTimeout(() => {
      setIsCheckingOut(false);
      Alert.alert(
        "¡Pedido Confirmado! 🎉",
        "Tu pago fue exitoso y el local ya está preparando tu comida. Te avisaremos cuando esté listo.",
        [
          { 
            text: "Genial", 
            onPress: () => {
              clearCart();
              router.push('/');
            } 
          }
        ]
      );
    }, 1500);
  };

  // ESTADO VACÍO
  if (items.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
          <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(0,61,122,0.05)', justifyContent: 'center', alignItems: 'center', marginBottom: 24 }}>
            <ShoppingCart color="#003D7A" size={48} opacity={0.5} />
          </View>
          <Text style={{ fontSize: 24, fontFamily: 'Inter-Bold', color: '#111111', marginBottom: 8, textAlign: 'center' }}>Tu carrito está vacío</Text>
          <Text style={{ fontSize: 16, fontFamily: 'Inter-Regular', color: 'rgba(17,17,17,0.5)', textAlign: 'center', marginBottom: 32 }}>
            ¡Es hora de un break! Explora los locales y pide algo rico.
          </Text>
          
          <TouchableOpacity 
            onPress={() => router.push('/')}
            style={{ backgroundColor: '#FFBF00', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 16, shadowColor: '#FFBF00', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8 }}
          >
            <Text style={{ color: '#111111', fontFamily: 'Inter-Bold', fontSize: 16 }}>Explorar locales</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ESTADO CON PRODUCTOS
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      
      {/* Header Fijo */}
      <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(17,17,17,0.05)', backgroundColor: '#FAFAFA' }}>
        <Text style={{ fontSize: 24, fontFamily: 'Inter-Bold', color: '#111111' }}>Mi Pedido</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        
        {/* Lista de Items */}
        <View style={{ gap: 16, marginBottom: 32 }}>
          {items.map((item, index) => (
            <Animated.View 
              entering={FadeInDown.delay(index * 100).springify()}
              key={item.id} 
              style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  {item.storeName && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <Store color="rgba(17,17,17,0.4)" size={12} style={{ marginRight: 4 }} />
                      <Text style={{ fontSize: 11, fontFamily: 'Inter-SemiBold', color: 'rgba(17,17,17,0.5)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {item.storeName}
                      </Text>
                    </View>
                  )}
                  <Text style={{ fontSize: 15, fontFamily: 'Inter-SemiBold', color: '#111111', marginBottom: 4 }}>{item.name}</Text>
                  <Text style={{ fontSize: 15, fontFamily: 'Inter-Bold', color: '#003D7A' }}>${item.price.toLocaleString('es-CL')}</Text>
                </View>
                
                {/* Botón Eliminar */}
                <TouchableOpacity onPress={() => removeItem(item.id)} style={{ padding: 4 }}>
                  <Trash2 color="#EF4444" size={20} opacity={0.7} />
                </TouchableOpacity>
              </View>

              {/* Controles de cantidad */}
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 12, overflow: 'hidden' }}>
                  <TouchableOpacity 
                    onPress={() => item.quantity > 1 ? updateQuantity(item.id, 'decrease') : removeItem(item.id)}
                    style={{ padding: 10, paddingHorizontal: 14 }}
                  >
                    <Minus color="#111111" size={16} />
                  </TouchableOpacity>
                  
                  <Text style={{ fontFamily: 'Inter-Bold', fontSize: 15, color: '#111111', minWidth: 20, textAlign: 'center' }}>
                    {item.quantity}
                  </Text>
                  
                  <TouchableOpacity 
                    onPress={() => updateQuantity(item.id, 'increase')}
                    style={{ padding: 10, paddingHorizontal: 14 }}
                  >
                    <Plus color="#111111" size={16} />
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          ))}
        </View>

        {/* Resumen */}
        <Animated.View entering={FadeIn.delay(300)}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Receipt color="#111111" size={20} style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 18, fontFamily: 'Inter-Bold', color: '#111111' }}>Resumen</Text>
          </View>
          
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ fontSize: 14, fontFamily: 'Inter-Regular', color: 'rgba(17,17,17,0.6)' }}>Subtotal</Text>
              <Text style={{ fontSize: 14, fontFamily: 'Inter-SemiBold', color: '#111111' }}>${subtotal.toLocaleString('es-CL')}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontFamily: 'Inter-Regular', color: 'rgba(17,17,17,0.6)' }}>Cargo por servicio</Text>
              <Text style={{ fontSize: 14, fontFamily: 'Inter-SemiBold', color: '#111111' }}>${serviceFee.toLocaleString('es-CL')}</Text>
            </View>
            
            {/* Divider */}
            <View style={{ height: 1, backgroundColor: 'rgba(17,17,17,0.05)', marginBottom: 16 }} />
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 16, fontFamily: 'Inter-Bold', color: '#111111' }}>Total a pagar</Text>
              <Text style={{ fontSize: 20, fontFamily: 'Inter-Bold', color: '#003D7A' }}>${total.toLocaleString('es-CL')}</Text>
            </View>
          </View>
        </Animated.View>

      </ScrollView>

      {/* CTA Pagar Sticky */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FAFAFA', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32, borderTopWidth: 1, borderTopColor: 'rgba(17,17,17,0.05)' }}>
        <TouchableOpacity 
          onPress={handleCheckout}
          disabled={isCheckingOut}
          style={{ 
            backgroundColor: '#FFBF00', 
            borderRadius: 16, 
            paddingVertical: 18, 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            paddingHorizontal: 24,
            shadowColor: '#FFBF00',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 12
          }}
        >
          <Text style={{ color: '#111111', fontFamily: 'Inter-Bold', fontSize: 16 }}>Ir a Pagar</Text>
          <Text style={{ color: '#111111', fontFamily: 'Inter-Bold', fontSize: 18 }}>${total.toLocaleString('es-CL')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
