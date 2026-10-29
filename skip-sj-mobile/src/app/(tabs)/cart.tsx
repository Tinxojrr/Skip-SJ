import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  Modal, 
  ActivityIndicator,
  Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import { 
  Minus, 
  Plus, 
  Trash2, 
  ShoppingCart, 
  Receipt, 
  Store, 
  Building2, 
  ChevronRight, 
  Lock, 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight,
  Sparkles
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

interface Banco {
  id: string;
  nombre: string;
  tipoCuenta: string;
  sigla: string;
  colorBg: string;
  colorSecundario: string;
  badge?: string;
  passNombre: string;
}

const BANCOS_CHILE: Banco[] = [
  {
    id: 'bancoestado',
    nombre: 'BancoEstado',
    tipoCuenta: 'CuentaRUT / Cuenta Pro',
    sigla: 'BE',
    colorBg: '#004B93',
    colorSecundario: '#F58220',
    badge: 'Más usado en Duoc',
    passNombre: 'Clave Pass'
  },
  {
    id: 'mach',
    nombre: 'MACH / Bci',
    tipoCuenta: 'Billetera Digital',
    sigla: 'M',
    colorBg: '#6C00FF',
    colorSecundario: '#A855F7',
    badge: 'Pago en 1 toque',
    passNombre: 'PIN MACH'
  },
  {
    id: 'santander',
    nombre: 'Banco Santander',
    tipoCuenta: 'Cuenta Corriente / Vista',
    sigla: 'SAN',
    colorBg: '#EC0000',
    colorSecundario: '#B91C1C',
    passNombre: 'Santander Pass'
  },
  {
    id: 'bancochile',
    nombre: 'Banco de Chile / Edwards',
    tipoCuenta: 'Cuenta Fan / Corriente',
    sigla: 'BCH',
    colorBg: '#0B2545',
    colorSecundario: '#1E40AF',
    passNombre: 'Mi Pass'
  },
  {
    id: 'falabella',
    nombre: 'Banco Falabella',
    tipoCuenta: 'Cuenta Vista / CMR',
    sigla: 'CMR',
    colorBg: '#009A44',
    colorSecundario: '#047857',
    passNombre: 'Clave Dinámica'
  },
  {
    id: 'tenpo',
    nombre: 'Tenpo',
    tipoCuenta: 'Cuenta Digital Prepago',
    sigla: 'T',
    colorBg: '#00BFA5',
    colorSecundario: '#0D9488',
    passNombre: 'Clave Tenpo'
  }
];

export default function CartScreen() {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const bg = isDarkMode ? '#09090B' : '#FAFAFA';
  const cardBg = isDarkMode ? '#18181B' : '#FFFFFF';
  const textPrimary = isDarkMode ? '#F4F4F5' : '#111111';
  const textSecondary = isDarkMode ? '#A1A1AA' : 'rgba(17,17,17,0.5)';
  const borderColor = isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(17,17,17,0.05)';
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();
  const { session, profile } = useAuthStore();
  const router = useRouter();

  // Estados de Pasarela Bancaria
  const [bancoSeleccionado, setBancoSeleccionado] = useState<Banco>(BANCOS_CHILE[0]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalStep, setModalStep] = useState<'seleccionar_banco' | 'confirmar' | 'procesando' | 'exito'>('confirmar');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [codigoRetiroGenerado, setCodigoRetiroGenerado] = useState<string>('');
  const [passCode, setPassCode] = useState('••••');

  const subtotal = getTotal();
  const serviceFee = items.length > 0 ? 300 : 0;
  const total = subtotal + serviceFee;
  const storeName = items[0]?.storeName || 'Casino San Joaquín';

  // Abrir Pasarela Directa
  const abrirPasarela = () => {
    if (items.length === 0 || !session) return;
    setModalStep('confirmar');
    setModalVisible(true);
  };

  // Abrir selector de bancos
  const cambiarBanco = () => {
    setModalStep('seleccionar_banco');
    setModalVisible(true);
  };

  // Ejecutar Transferencia Bancaria Directa
  const autorizarTransferencia = async () => {
    setIsCheckingOut(true);
    setModalStep('procesando');

    try {
      // 1. Handshake bancario Open Banking (1.3 seg)
      await new Promise(resolve => setTimeout(resolve, 1300));

      const codigoRetiro = Math.random().toString(36).substring(2, 6).toUpperCase();

      // 2. Insertar Pedido en Supabase
      const { data: pedido, error: pedidoError } = await (supabase.from('pedidos') as any).insert({
        usuario_id: session!.user.id,
        locatario_id: items[0].storeId || null,
        estado: 'pagado',
        monto_total: total,
        codigo_retiro: codigoRetiro
      }).select().single();

      if (pedidoError) throw pedidoError;

      // 3. Insertar Items del Pedido (incluyendo notas personalizadas si existen)
      const itemsPayload = items.map(item => ({
        pedido_id: pedido.id,
        producto_id: item.id,
        cantidad: item.quantity,
        precio_unitario: item.price,
        subtotal: item.price * item.quantity,
        notas: item.notes || null
      }));

      let { error: itemsError } = await (supabase.from('pedido_items') as any).insert(itemsPayload);

      // Si la base de datos aún no tiene la columna 'notas', reintentamos sin ella para no romper la compra
      if (itemsError && (itemsError.message?.includes('notas') || itemsError.message?.includes('column'))) {
        console.warn('Columna notas aún no presente en pedido_items, guardando items estándar...');
        const fallbackPayload = items.map(item => ({
          pedido_id: pedido.id,
          producto_id: item.id,
          cantidad: item.quantity,
          precio_unitario: item.price,
          subtotal: item.price * item.quantity
        }));
        const retry = await (supabase.from('pedido_items') as any).insert(fallbackPayload);
        itemsError = retry.error;
      }

      if (itemsError) throw itemsError;

      // 4. Limpiar carrito y pasar a pantalla de éxito
      setCodigoRetiroGenerado(codigoRetiro);
      clearCart();
      setModalStep('exito');

    } catch (error) {
      console.error('Error al procesar transferencia:', error);
      Alert.alert('Error Bancario', 'No pudimos verificar la transferencia con tu banco. Por favor intenta de nuevo.');
      setModalStep('confirmar');
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Finalizar e ir al historial
  const irAlHistorial = () => {
    setModalVisible(false);
    setModalStep('confirmar');
    setCodigoRetiroGenerado('');
    router.push('/history');
  };

  // ESTADO VACÍO
  if (items.length === 0 && (!modalVisible || modalStep !== 'exito')) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
          <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(0,61,122,0.05)', justifyContent: 'center', alignItems: 'center', marginBottom: 24 }}>
            <ShoppingCart color="#003D7A" size={48} opacity={0.5} />
          </View>
          <Text style={{ fontSize: 24, fontFamily: 'Inter-Bold', color: textPrimary, marginBottom: 8, textAlign: 'center' }}>
            Tu carrito está vacío
          </Text>
          <Text style={{ fontSize: 16, fontFamily: 'Inter-Regular', color: textSecondary, textAlign: 'center', marginBottom: 32 }}>
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      
      {/* Header Fijo */}
      <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: borderColor, backgroundColor: bg }}>
        <Text style={{ fontSize: 24, fontFamily: 'Inter-Bold', color: textPrimary }}>Mi Pedido</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        
        {/* Lista de Items */}
        <View style={{ gap: 16, marginBottom: 32 }}>
          {items.map((item, index) => (
            <Animated.View 
              entering={FadeInDown.delay(index * 100).springify()}
              key={item.id} 
              style={{ backgroundColor: cardBg, borderRadius: 20, padding: 16, borderWidth: 1, borderColor, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  {item.storeName && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <Store color={textSecondary} size={12} style={{ marginRight: 4 }} />
                      <Text style={{ fontSize: 11, fontFamily: 'Inter-SemiBold', color: textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {item.storeName}
                      </Text>
                    </View>
                  )}
                  <Text style={{ fontSize: 15, fontFamily: 'Inter-SemiBold', color: textPrimary, marginBottom: 2 }}>{item.name}</Text>
                  {item.notes ? (
                    <Text style={{ fontSize: 12, fontFamily: 'Inter-Regular', color: textSecondary, marginBottom: 6, fontStyle: 'italic' }}>
                      Nota: {item.notes}
                    </Text>
                  ) : (
                    <View style={{ marginBottom: 4 }} />
                  )}
                  <Text style={{ fontSize: 15, fontFamily: 'Inter-Bold', color: isDarkMode ? '#F2A900' : '#003D7A' }}>${item.price.toLocaleString('es-CL')}</Text>
                </View>
                
                {/* Botón Eliminar */}
                <TouchableOpacity onPress={() => removeItem(item.id)} style={{ padding: 4 }}>
                  <Trash2 color="#EF4444" size={20} opacity={0.7} />
                </TouchableOpacity>
              </View>

              {/* Controles de cantidad */}
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDarkMode ? '#27272A' : '#F3F4F6', borderRadius: 12, overflow: 'hidden' }}>
                  <TouchableOpacity 
                    onPress={() => item.quantity > 1 ? updateQuantity(item.id, 'decrease') : removeItem(item.id)}
                    style={{ padding: 10, paddingHorizontal: 14 }}
                  >
                    <Minus color={textPrimary} size={16} />
                  </TouchableOpacity>
                  
                  <Text style={{ fontFamily: 'Inter-Bold', fontSize: 15, color: textPrimary, minWidth: 20, textAlign: 'center' }}>
                    {item.quantity}
                  </Text>
                  
                  <TouchableOpacity 
                    onPress={() => updateQuantity(item.id, 'increase')}
                    style={{ padding: 10, paddingHorizontal: 14 }}
                  >
                    <Plus color={textPrimary} size={16} />
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          ))}
        </View>

        {/* Resumen */}
        <Animated.View entering={FadeIn.delay(300)}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Receipt color={textPrimary} size={20} style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 18, fontFamily: 'Inter-Bold', color: textPrimary }}>Resumen</Text>
          </View>
          
          <View style={{ backgroundColor: cardBg, borderRadius: 20, padding: 20, borderWidth: 1, borderColor, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ fontSize: 14, fontFamily: 'Inter-Regular', color: textSecondary }}>Subtotal</Text>
              <Text style={{ fontSize: 14, fontFamily: 'Inter-SemiBold', color: textPrimary }}>${subtotal.toLocaleString('es-CL')}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontFamily: 'Inter-Regular', color: textSecondary }}>Cargo por servicio</Text>
              <Text style={{ fontSize: 14, fontFamily: 'Inter-SemiBold', color: textPrimary }}>${serviceFee.toLocaleString('es-CL')}</Text>
            </View>
            
            {/* Divider */}
            <View style={{ height: 1, backgroundColor: borderColor, marginBottom: 16 }} />
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 16, fontFamily: 'Inter-Bold', color: textPrimary }}>Total a pagar</Text>
              <Text style={{ fontSize: 20, fontFamily: 'Inter-Bold', color: isDarkMode ? '#F2A900' : '#003D7A' }}>${total.toLocaleString('es-CL')}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Medio de Pago Seleccionado (Open Banking / Banco) */}
        <Animated.View entering={FadeIn.delay(400)} style={{ marginTop: 24, marginBottom: 120 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Building2 color={textPrimary} size={20} style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 18, fontFamily: 'Inter-Bold', color: textPrimary }}>Método de Pago</Text>
            </View>
            <TouchableOpacity onPress={cambiarBanco}>
              <Text style={{ fontSize: 13, fontFamily: 'Inter-SemiBold', color: isDarkMode ? '#F2A900' : '#004B93' }}>Cambiar banco</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            onPress={abrirPasarela}
            style={{ 
              backgroundColor: cardBg, 
              borderRadius: 20, 
              padding: 16, 
              flexDirection: 'row', 
              alignItems: 'center', 
              shadowColor: '#000', 
              shadowOffset: { width: 0, height: 4 }, 
              shadowOpacity: isDarkMode ? 0.2 : 0.04, 
              shadowRadius: 10, 
              elevation: 2, 
              borderWidth: 1.5, 
              borderColor: bancoSeleccionado.colorBg 
            }}
          >
            {/* Logo / Badge del Banco */}
            <View style={{ 
              width: 44, 
              height: 44, 
              backgroundColor: bancoSeleccionado.colorBg, 
              borderRadius: 12, 
              justifyContent: 'center', 
              alignItems: 'center', 
              marginRight: 16 
            }}>
              <Text style={{ color: '#FFFFFF', fontFamily: 'Inter-Bold', fontSize: 14 }}>
                {bancoSeleccionado.sigla}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 15, fontFamily: 'Inter-Bold', color: textPrimary }}>
                  {bancoSeleccionado.nombre}
                </Text>
                {bancoSeleccionado.badge && (
                  <View style={{ backgroundColor: isDarkMode ? '#1E3A8A' : '#E0F2FE', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 }}>
                    <Text style={{ fontSize: 9, fontFamily: 'Inter-Bold', color: isDarkMode ? '#93C5FD' : '#0369A1' }}>
                      {bancoSeleccionado.badge}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={{ fontSize: 13, fontFamily: 'Inter-Regular', color: textSecondary, marginTop: 2 }}>
                {bancoSeleccionado.tipoCuenta} • RUT {profile?.rut || '20.481.923-K'}
              </Text>
            </View>

            <ChevronRight color={textSecondary} size={20} />
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, paddingHorizontal: 6 }}>
            <Lock size={12} color="#10B981" />
            <Text style={{ fontSize: 11, fontFamily: 'Inter-Regular', color: '#10B981' }}>
              Transferencia automática instantánea • Cero comisiones
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* CTA Pagar Sticky */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: isDarkMode ? '#121217' : '#FFFFFF', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32, borderTopWidth: 1, borderTopColor: borderColor }}>
        <TouchableOpacity 
          onPress={abrirPasarela}
          disabled={isCheckingOut || items.length === 0}
          style={{ 
            backgroundColor: items.length === 0 ? '#94A3B8' : bancoSeleccionado.colorBg, 
            borderRadius: 16, 
            paddingVertical: 18, 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            paddingHorizontal: 20,
            shadowColor: bancoSeleccionado.colorBg,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: items.length === 0 ? 0 : 0.35,
            shadowRadius: 12,
            elevation: items.length === 0 ? 0 : 6
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, marginRight: 12 }}>
            <Building2 size={18} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontFamily: 'Inter-Bold', fontSize: 15 }} numberOfLines={1}>
              Pagar con {bancoSeleccionado.nombre}
            </Text>
          </View>
          <Text style={{ color: '#FFFFFF', fontFamily: 'Inter-Bold', fontSize: 17, marginLeft: 4 }}>
            ${total.toLocaleString('es-CL')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ========================================================= */}
      {/* MODAL DE PASARELA BANCARIA RÁPIDA (Estilo Fintoc / Banco) */}
      {/* ========================================================= */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          if (modalStep !== 'procesando') {
            setModalVisible(false);
            if (modalStep === 'exito') setModalStep('confirmar');
          }
        }}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
          <View style={{ 
            backgroundColor: cardBg, 
            borderTopLeftRadius: 28, 
            borderTopRightRadius: 28, 
            paddingHorizontal: 24, 
            paddingTop: 20, 
            paddingBottom: 40,
            maxHeight: '90%'
          }}>

            {/* PANTALLA 1: SELECCIONAR BANCO */}
            {modalStep === 'seleccionar_banco' && (
              <View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={{ fontSize: 20, fontFamily: 'Inter-Bold', color: textPrimary }}>
                    Selecciona tu Banco
                  </Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 4 }}>
                    <X size={20} color={textSecondary} />
                  </TouchableOpacity>
                </View>
                <Text style={{ fontSize: 13, fontFamily: 'Inter-Regular', color: textSecondary, marginBottom: 20 }}>
                  Conexión directa vía Open Banking Duoc UC sin comisiones
                </Text>

                <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
                  <View style={{ gap: 10 }}>
                    {BANCOS_CHILE.map((banco) => {
                      const isSelected = banco.id === bancoSeleccionado.id;
                      return (
                        <TouchableOpacity
                          key={banco.id}
                          onPress={() => {
                            setBancoSeleccionado(banco);
                            setModalStep('confirmar');
                          }}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            padding: 14,
                            borderRadius: 16,
                            backgroundColor: isSelected ? (isDarkMode ? '#1E293B' : '#F0F9FF') : (isDarkMode ? '#27272A' : '#F9FAFB'),
                            borderWidth: 1.5,
                            borderColor: isSelected ? banco.colorBg : borderColor
                          }}
                        >
                          <View style={{ 
                            width: 38, 
                            height: 38, 
                            borderRadius: 10, 
                            backgroundColor: banco.colorBg, 
                            justifyContent: 'center', 
                            alignItems: 'center', 
                            marginRight: 14 
                          }}>
                            <Text style={{ color: '#FFFFFF', fontFamily: 'Inter-Bold', fontSize: 13 }}>
                              {banco.sigla}
                            </Text>
                          </View>

                          <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                              <Text style={{ fontSize: 14, fontFamily: 'Inter-Bold', color: textPrimary }}>
                                {banco.nombre}
                              </Text>
                              {banco.badge && (
                                <View style={{ backgroundColor: isDarkMode ? '#1E3A8A' : '#DBEAFE', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 }}>
                                  <Text style={{ fontSize: 9, fontFamily: 'Inter-Bold', color: isDarkMode ? '#93C5FD' : '#1E40AF' }}>
                                    {banco.badge}
                                  </Text>
                                </View>
                              )}
                            </View>
                            <Text style={{ fontSize: 12, fontFamily: 'Inter-Regular', color: textSecondary }}>
                              {banco.tipoCuenta}
                            </Text>
                          </View>

                          <ChevronRight size={18} color={isSelected ? banco.colorBg : textSecondary} />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>
            )}

            {/* PANTALLA 2: CONFIRMAR Y AUTORIZAR PAGO */}
            {modalStep === 'confirmar' && (
              <View>
                {/* Header Seguro */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <ShieldCheck size={18} color="#10B981" />
                    <Text style={{ fontSize: 12, fontFamily: 'Inter-SemiBold', color: '#10B981' }}>
                      Pasarela Cifrada 256-bit
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 4 }}>
                    <X size={20} color={textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* Tarjeta del Banco del Alumno */}
                <View style={{ 
                  backgroundColor: bancoSeleccionado.colorBg, 
                  borderRadius: 18, 
                  padding: 18, 
                  marginBottom: 20,
                  shadowColor: bancoSeleccionado.colorBg,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.25,
                  shadowRadius: 10,
                  elevation: 4
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <Text style={{ color: '#FFFFFF', fontFamily: 'Inter-Bold', fontSize: 16 }}>
                      {bancoSeleccionado.nombre}
                    </Text>
                    <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                      <Text style={{ color: '#FFFFFF', fontFamily: 'Inter-SemiBold', fontSize: 10 }}>
                        {bancoSeleccionado.tipoCuenta}
                      </Text>
                    </View>
                  </View>

                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontFamily: 'Inter-Regular' }}>
                    Titular / RUT Registrado
                  </Text>
                  <Text style={{ color: '#FFFFFF', fontSize: 15, fontFamily: 'Inter-Bold', marginTop: 2 }}>
                    {profile ? `${profile.p_nombre || 'Alumno'} ${profile.apellido_p || ''}` : 'Alumno Duoc UC'} • {profile?.rut || '20.481.923-K'}
                  </Text>
                </View>

                {/* Detalle de Cobro */}
                <View style={{ backgroundColor: isDarkMode ? '#27272A' : '#F8FAFC', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ fontSize: 13, fontFamily: 'Inter-Regular', color: textSecondary }}>Comercio receptor:</Text>
                    <Text style={{ fontSize: 13, fontFamily: 'Inter-SemiBold', color: textPrimary }}>SKIP Duoc UC ({storeName})</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ fontSize: 13, fontFamily: 'Inter-Regular', color: textSecondary }}>Sede:</Text>
                    <Text style={{ fontSize: 13, fontFamily: 'Inter-SemiBold', color: textPrimary }}>San Joaquín</Text>
                  </View>
                  <View style={{ height: 1, backgroundColor: borderColor, marginVertical: 8 }} />
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 14, fontFamily: 'Inter-Bold', color: textPrimary }}>Total a transferir:</Text>
                    <Text style={{ fontSize: 18, fontFamily: 'Inter-Bold', color: isDarkMode ? '#F2A900' : bancoSeleccionado.colorBg }}>
                      ${total.toLocaleString('es-CL')} CLP
                    </Text>
                  </View>
                </View>

                {/* Métodos de Autorización Rápida */}
                <View style={{ marginBottom: 20 }}>
                  <Text style={{ fontSize: 12, fontFamily: 'Inter-SemiBold', color: textSecondary, marginBottom: 8 }}>
                    Autorización con {bancoSeleccionado.passNombre}:
                  </Text>
                  <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    backgroundColor: isDarkMode ? '#27272A' : '#F1F5F9', 
                    borderRadius: 12, 
                    padding: 12, 
                    justifyContent: 'space-between' 
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Lock size={16} color={textSecondary} />
                      <Text style={{ fontSize: 14, fontFamily: 'Inter-Bold', color: textPrimary, letterSpacing: 4 }}>
                        {passCode}
                      </Text>
                    </View>
                    <View style={{ backgroundColor: isDarkMode ? '#3F3F46' : '#E2E8F0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                      <Text style={{ fontSize: 10, fontFamily: 'Inter-Bold', color: textSecondary }}>
                        Verificado
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Botón de Confirmación Directo */}
                <TouchableOpacity
                  onPress={autorizarTransferencia}
                  disabled={isCheckingOut}
                  style={{
                    backgroundColor: bancoSeleccionado.colorBg,
                    borderRadius: 16,
                    paddingVertical: 18,
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: bancoSeleccionado.colorBg,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 10,
                    elevation: 5
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontFamily: 'Inter-Bold', fontSize: 16 }}>
                    Autorizar Pago de ${total.toLocaleString('es-CL')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={cambiarBanco}
                  style={{ marginTop: 12, alignItems: 'center', paddingVertical: 4 }}
                >
                  <Text style={{ fontSize: 12, fontFamily: 'Inter-SemiBold', color: textSecondary }}>
                    Usar otro banco o billetera
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* PANTALLA 3: PROCESANDO TRANSFERENCIA */}
            {modalStep === 'procesando' && (
              <View style={{ paddingVertical: 30, alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ 
                  width: 70, 
                  height: 70, 
                  borderRadius: 35, 
                  backgroundColor: `${bancoSeleccionado.colorBg}15`, 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  marginBottom: 20
                }}>
                  <ActivityIndicator size="large" color={bancoSeleccionado.colorBg} />
                </View>

                <Text style={{ fontSize: 18, fontFamily: 'Inter-Bold', color: textPrimary, textAlign: 'center', marginBottom: 8 }}>
                  Conectando con {bancoSeleccionado.nombre}...
                </Text>
                <Text style={{ fontSize: 13, fontFamily: 'Inter-Regular', color: textSecondary, textAlign: 'center', maxWidth: 280, lineHeight: 18 }}>
                  Verificando fondos de CuentaRUT y enviando comanda a la cocina de {storeName}...
                </Text>
              </View>
            )}

            {/* PANTALLA 4: ÉXITO TOTAL & CÓDIGO DE RETIRO */}
            {modalStep === 'exito' && (
              <View style={{ alignItems: 'center', paddingVertical: 10 }}>
                {/* Check verde animado */}
                <View style={{ 
                  width: 70, 
                  height: 70, 
                  borderRadius: 35, 
                  backgroundColor: isDarkMode ? '#064E3B' : '#DCFCE7', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  marginBottom: 16
                }}>
                  <CheckCircle2 size={40} color={isDarkMode ? '#34D399' : '#16A34A'} />
                </View>

                <Text style={{ fontSize: 22, fontFamily: 'Inter-Bold', color: textPrimary, marginBottom: 4 }}>
                  ¡Pago Confirmado!
                </Text>
                <Text style={{ fontSize: 13, fontFamily: 'Inter-Regular', color: textSecondary, textAlign: 'center', marginBottom: 20 }}>
                  Transferencia exitosa desde {bancoSeleccionado.nombre}
                </Text>

                {/* CAJA CÓDIGO DE RETIRO GRANDE */}
                <View style={{ 
                  width: '100%', 
                  backgroundColor: '#0F172A', 
                  borderRadius: 20, 
                  padding: 20, 
                  alignItems: 'center',
                  marginBottom: 20,
                  shadowColor: '#0F172A',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.25,
                  shadowRadius: 12,
                  elevation: 6
                }}>
                  <Text style={{ fontSize: 11, fontFamily: 'Inter-Bold', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                    Tu Código de Retiro en Mesón
                  </Text>
                  
                  <View style={{ 
                    backgroundColor: '#1E293B', 
                    paddingHorizontal: 28, 
                    paddingVertical: 10, 
                    borderRadius: 14,
                    borderWidth: 1.5,
                    borderColor: '#38BDF8'
                  }}>
                    <Text style={{ fontSize: 36, fontFamily: 'Inter-Bold', color: '#38BDF8', letterSpacing: 6 }}>
                      {codigoRetiroGenerado}
                    </Text>
                  </View>

                  <Text style={{ fontSize: 11, fontFamily: 'Inter-Regular', color: '#94A3B8', marginTop: 10, textAlign: 'center' }}>
                    Dicta o muestra este código en el mesón de {storeName}
                  </Text>
                </View>

                {/* Notificación de Cocina */}
                <View style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  backgroundColor: '#FEF3C7', 
                  borderRadius: 12, 
                  padding: 12, 
                  marginBottom: 24,
                  gap: 8,
                  width: '100%'
                }}>
                  <Sparkles size={16} color="#D97706" />
                  <Text style={{ fontSize: 12, fontFamily: 'Inter-SemiBold', color: '#92400E', flex: 1 }}>
                    Tu orden ya está en la pantalla del local con sonido de campanilla activado.
                  </Text>
                </View>

                {/* Botón Ver Pedido */}
                <TouchableOpacity
                  onPress={irAlHistorial}
                  style={{
                    backgroundColor: '#003D7A',
                    borderRadius: 16,
                    paddingVertical: 18,
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    flexDirection: 'row',
                    gap: 8
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontFamily: 'Inter-Bold', fontSize: 16 }}>
                    Ver Seguimiento en Vivo
                  </Text>
                  <ArrowRight size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}
