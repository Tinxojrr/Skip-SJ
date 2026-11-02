import React, { useState, useMemo, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  Modal, 
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { usePaymentStore, SavedCard } from '../../store/paymentStore';
import { executeDeveloperPayment, PaymentResult } from '../../services/paymentGateway';
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
  Sparkles,
  CreditCard,
  Wallet
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

export interface PaymentOption {
  id: string;
  nombre: string;
  tipoCuenta: string;
  sigla: string;
  colorBg: string;
  colorSecundario: string;
  badge?: string;
  passNombre: string;
  isCard?: boolean;
}

const BASE_BANCOS: PaymentOption[] = [
  {
    id: 'bancoestado',
    nombre: 'BancoEstado',
    tipoCuenta: 'CuentaRUT / Cuenta Pro',
    sigla: 'BE',
    colorBg: '#004B93',
    colorSecundario: '#F58220',
    badge: 'CuentaRUT Oficial',
    passNombre: 'Clave Pass'
  },
  {
    id: 'webpay',
    nombre: 'Webpay Plus (Transbank)',
    tipoCuenta: 'Tarjetas Débito / Crédito',
    sigla: 'TBK',
    colorBg: '#E11938',
    colorSecundario: '#991B1B',
    badge: 'Sandbox Oficial',
    passNombre: 'Autenticación Bancaria'
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
  const { savedCards, selectedCardId } = usePaymentStore();
  const router = useRouter();

  // Helper para convertir una SavedCard en PaymentOption
  const formatCardOption = (c: SavedCard): PaymentOption => ({
    id: c.id,
    nombre: `${c.brand.toUpperCase()} •••• ${c.cardLast4}`,
    tipoCuenta: `Vence ${c.expiry} • ${c.cardName}`,
    sigla: c.brand === 'visa' ? 'VISA' : 'MC',
    colorBg: c.brand === 'visa' ? '#1D4ED8' : '#EA580C',
    colorSecundario: '#1E293B',
    badge: 'Guardada',
    passNombre: 'CVV Seguro',
    isCard: true
  });

  // Opciones completas de pago: TARJETAS GUARDADAS PRIMERO, luego Webpay Plus y bancos
  const paymentOptions = useMemo<PaymentOption[]>(() => {
    const list: PaymentOption[] = [];

    // 1. Tarjetas guardadas del usuario (Prioridad alta)
    savedCards.forEach(c => {
      list.push(formatCardOption(c));
    });

    // 2. Webpay Plus Transbank Developer (Para pagar con cualquier otra tarjeta)
    list.push(BASE_BANCOS[1]);

    // 3. BancoEstado CuentaRUT
    list.push(BASE_BANCOS[0]);

    // 4. Otros bancos chilenos
    BASE_BANCOS.slice(2).forEach(b => list.push(b));

    return list;
  }, [savedCards]);

  // Estados de Pasarela: por defecto la tarjeta guardada si existe
  const [bancoSeleccionado, setBancoSeleccionado] = useState<PaymentOption>(() => {
    if (savedCards.length > 0) {
      const activeCard = savedCards.find(c => c.id === selectedCardId) || savedCards[0];
      return formatCardOption(activeCard);
    }
    return BASE_BANCOS[1]; // Webpay Plus por defecto
  });

  // Mantener sincronizado si el usuario agrega o selecciona una tarjeta en add-payment
  useEffect(() => {
    if (savedCards.length > 0) {
      const activeCard = savedCards.find(c => c.id === selectedCardId) || savedCards[0];
      // Si la opción seleccionada actual ya no existe o es un método genérico anterior
      const isCurrentValidSaved = savedCards.some(c => c.id === bancoSeleccionado.id);
      if (!isCurrentValidSaved) {
        setBancoSeleccionado(formatCardOption(activeCard));
      }
    }
  }, [savedCards, selectedCardId]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalStep, setModalStep] = useState<'seleccionar_banco' | 'confirmar' | 'procesando' | 'exito'>('confirmar');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [codigoRetiroGenerado, setCodigoRetiroGenerado] = useState<string>('');
  const [comprobantePago, setComprobantePago] = useState<PaymentResult | null>(null);
  const [passCode, setPassCode] = useState('••••');

  const [resumenPago, setResumenPago] = useState<{ total: number; subtotal: number; serviceFee: number; storeName: string } | null>(null);

  const subtotal = getTotal();
  const serviceFee = items.length > 0 ? 300 : 0;
  const total = subtotal + serviceFee;
  const storeName = items[0]?.storeName || 'Casino San Joaquín';

  // Abrir Pasarela Directa
  const abrirPasarela = () => {
    if (items.length === 0 || !session || total <= 0) {
      Alert.alert('Carrito Vacío', 'Agrega al menos un producto antes de proceder al pago.');
      return;
    }
    setResumenPago({ total, subtotal, serviceFee, storeName });
    setModalStep('confirmar');
    setModalVisible(true);
  };

  // Abrir selector de bancos
  const cambiarBanco = () => {
    setModalStep('seleccionar_banco');
    setModalVisible(true);
  };

  // Ejecutar Pago Developer Real (Integrado a Supabase y pasarela)
  const autorizarTransferencia = async () => {
    if (!session?.user) {
      Alert.alert('Sesión Requerida', 'Por favor inicia sesión con tu correo institucional.');
      return;
    }

    if (items.length === 0 || total <= 0) {
      Alert.alert('Carrito Vacío', 'Agrega productos antes de autorizar el pago.');
      return;
    }

    setIsCheckingOut(true);
    setModalStep('procesando');

    try {
      const paymentMethodType = 
        bancoSeleccionado.isCard || bancoSeleccionado.id === 'webpay' ? 'card' :
        bancoSeleccionado.id === 'mach' ? 'mach' : 'bancoestado';

      const selectedCardData = savedCards.find(c => c.id === bancoSeleccionado.id);

      // Ejecución legítima con base de datos Supabase
      const result = await executeDeveloperPayment({
        userId: session.user.id,
        userEmail: session.user.email || 'alumno@duocuc.cl',
        userRut: profile?.rut || '20.481.923-K',
        storeId: items[0]?.storeId,
        items: items.map(i => ({
          id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          notes: i.notes
        })),
        total,
        paymentMethod: paymentMethodType,
        cardDetails: selectedCardData,
        passCode
      });

      if (!result.success) {
        throw new Error(result.errorMessage || 'Transacción denegada por la entidad financiera.');
      }

      setCodigoRetiroGenerado(result.codigoRetiro || 'SJ-401');
      setComprobantePago(result);
      setModalStep('exito');

    } catch (error: any) {
      console.error('Error al procesar pago:', error);
      Alert.alert('Pago No Autorizado', error.message || 'No se pudo procesar la transacción bancaria.');
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
    setComprobantePago(null);
    clearCart();
    setResumenPago(null);
    router.push('/history');
  };

  // ESTADO VACÍO
  if (items.length === 0 && (!modalVisible || modalStep !== 'exito')) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
          <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(242,169,0,0.08)', justifyContent: 'center', alignItems: 'center', marginBottom: 24 }}>
            <ShoppingCart color="#F2A900" size={48} opacity={0.8} />
          </View>
          <Text style={{ fontSize: 24, fontFamily: 'Inter-Bold', color: textPrimary, marginBottom: 8, textAlign: 'center' }}>
            Tu carrito está vacío
          </Text>
          <Text style={{ fontSize: 16, fontFamily: 'Inter-Regular', color: textSecondary, textAlign: 'center', marginBottom: 32 }}>
            ¡Es hora de un break! Explora los locales y pide algo rico.
          </Text>
          
          <TouchableOpacity
            onPress={() => router.push('/(tabs)')}
            style={{ backgroundColor: '#F2A900', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 16, shadowColor: '#F2A900', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 }}
          >
            <Text style={{ fontFamily: 'Inter-Bold', fontSize: 16, color: '#111111' }}>Explorar locales</Text>
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
              <Text style={{ fontSize: 14, fontFamily: 'Inter-SemiBold', color: textPrimary }}>${(resumenPago?.subtotal ?? subtotal).toLocaleString('es-CL')}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontFamily: 'Inter-Regular', color: textSecondary }}>Cargo por servicio</Text>
              <Text style={{ fontSize: 14, fontFamily: 'Inter-SemiBold', color: textPrimary }}>${(resumenPago?.serviceFee ?? serviceFee).toLocaleString('es-CL')}</Text>
            </View>
            
            {/* Divider */}
            <View style={{ height: 1, backgroundColor: borderColor, marginBottom: 16 }} />
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 16, fontFamily: 'Inter-Bold', color: textPrimary }}>Total a pagar</Text>
              <Text style={{ fontSize: 20, fontFamily: 'Inter-Bold', color: isDarkMode ? '#F2A900' : '#003D7A' }}>${(resumenPago?.total ?? total).toLocaleString('es-CL')}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Medio de Pago Seleccionado */}
        <Animated.View entering={FadeIn.delay(400)} style={{ marginTop: 24, marginBottom: 120 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Building2 color={textPrimary} size={20} style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 18, fontFamily: 'Inter-Bold', color: textPrimary }}>Método de Pago</Text>
            </View>
            <TouchableOpacity onPress={cambiarBanco}>
              <Text style={{ fontSize: 13, fontFamily: 'Inter-SemiBold', color: isDarkMode ? '#F2A900' : '#004B93' }}>Cambiar método</Text>
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
              {bancoSeleccionado.isCard ? (
                <CreditCard color="#FFFFFF" size={20} />
              ) : (
                <Text style={{ color: '#FFFFFF', fontFamily: 'Inter-Bold', fontSize: 14 }}>
                  {bancoSeleccionado.sigla}
                </Text>
              )}
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
                {bancoSeleccionado.tipoCuenta}
              </Text>
            </View>

            <ChevronRight color={textSecondary} size={20} />
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, paddingHorizontal: 6 }}>
            <Lock size={12} color="#10B981" />
            <Text style={{ fontSize: 11, fontFamily: 'Inter-Regular', color: '#10B981' }}>
              Transacción bancaria directa • Cero comisiones POS
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
            {bancoSeleccionado.isCard || bancoSeleccionado.id === 'webpay' ? (
              <CreditCard size={18} color="#FFFFFF" />
            ) : (
              <Building2 size={18} color="#FFFFFF" />
            )}
            <Text style={{ color: '#FFFFFF', fontFamily: 'Inter-Bold', fontSize: 15 }} numberOfLines={1}>
              Pagar con {bancoSeleccionado.nombre}
            </Text>
          </View>
          <Text style={{ color: '#FFFFFF', fontFamily: 'Inter-Bold', fontSize: 17, marginLeft: 4 }}>
            ${total.toLocaleString('es-CL')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* MODAL DE PASARELA BANCARIA DEVELOPER MODE */}
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

            {/* PANTALLA 1: SELECCIONAR MÉTODO */}
            {modalStep === 'seleccionar_banco' && (
              <View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={{ fontSize: 20, fontFamily: 'Inter-Bold', color: textPrimary }}>
                    Selecciona Medio de Pago
                  </Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 4 }}>
                    <X size={20} color={textSecondary} />
                  </TouchableOpacity>
                </View>
                <Text style={{ fontSize: 13, fontFamily: 'Inter-Regular', color: textSecondary, marginBottom: 20 }}>
                  Pasarela directa para alumnos de Duoc UC Sede San Joaquín
                </Text>

                <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
                  <View style={{ gap: 10 }}>
                    {paymentOptions.map((opt) => {
                      const isSelected = opt.id === bancoSeleccionado.id;
                      return (
                        <TouchableOpacity
                          key={opt.id}
                          onPress={() => {
                            setBancoSeleccionado(opt);
                            setModalStep('confirmar');
                          }}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            padding: 14,
                            borderRadius: 16,
                            backgroundColor: isSelected ? (isDarkMode ? '#1E293B' : '#F0F9FF') : (isDarkMode ? '#27272A' : '#F9FAFB'),
                            borderWidth: 1.5,
                            borderColor: isSelected ? opt.colorBg : borderColor
                          }}
                        >
                          <View style={{ 
                            width: 38, 
                            height: 38, 
                            borderRadius: 10, 
                            backgroundColor: opt.colorBg, 
                            justifyContent: 'center', 
                            alignItems: 'center', 
                            marginRight: 14 
                          }}>
                            {opt.isCard ? (
                              <CreditCard color="#FFFFFF" size={18} />
                            ) : (
                              <Text style={{ color: '#FFFFFF', fontFamily: 'Inter-Bold', fontSize: 13 }}>
                                {opt.sigla}
                              </Text>
                            )}
                          </View>

                          <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                              <Text style={{ fontSize: 14, fontFamily: 'Inter-Bold', color: textPrimary }}>
                                {opt.nombre}
                              </Text>
                              {opt.badge && (
                                <View style={{ backgroundColor: isDarkMode ? '#1E3A8A' : '#DBEAFE', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 }}>
                                  <Text style={{ fontSize: 9, fontFamily: 'Inter-Bold', color: isDarkMode ? '#93C5FD' : '#1E40AF' }}>
                                    {opt.badge}
                                  </Text>
                                </View>
                              )}
                            </View>
                            <Text style={{ fontSize: 12, fontFamily: 'Inter-Regular', color: textSecondary }}>
                              {opt.tipoCuenta}
                            </Text>
                          </View>

                          <ChevronRight size={18} color={isSelected ? opt.colorBg : textSecondary} />
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
                      Pasarela Cifrada 256-bit • Ambiente Developer
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 4 }}>
                    <X size={20} color={textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* Tarjeta del Medio de Pago */}
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
                    Titular / Alumno Registrado
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
                    <Text style={{ fontSize: 14, fontFamily: 'Inter-Bold', color: textPrimary }}>Total a pagar:</Text>
                    <Text style={{ fontSize: 18, fontFamily: 'Inter-Bold', color: isDarkMode ? '#F2A900' : bancoSeleccionado.colorBg }}>
                      ${total.toLocaleString('es-CL')} CLP
                    </Text>
                  </View>
                </View>

                {/* Métodos de Autorización */}
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
                    Usar otro método de pago
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* PANTALLA 3: PROCESANDO */}
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
                  Registrando comanda y verificando autorización en base de datos de {storeName}...
                </Text>
              </View>
            )}

            {/* PANTALLA 4: ÉXITO TOTAL & CÓDIGO DE RETIRO */}
            {modalStep === 'exito' && (
              <View style={{ alignItems: 'center', paddingVertical: 10 }}>
                {/* Check verde */}
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
                  Transacción exitosa procesada vía {bancoSeleccionado.nombre}
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

                  {/* Simulación Código de Barras Tótem */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 26, gap: 2, marginTop: 12, marginBottom: 2 }}>
                    {[2, 4, 1, 3, 5, 2, 1, 4, 2, 3, 1, 5, 2, 3, 1, 4, 2, 1, 3, 4, 2, 3].map((w, i) => (
                      <View 
                        key={i} 
                        style={{ 
                          width: w, 
                          height: 22, 
                          backgroundColor: i % 5 === 0 ? '#38BDF8' : '#FFFFFF', 
                          borderRadius: 1 
                        }} 
                      />
                    ))}
                  </View>
                  <Text style={{ fontSize: 9, fontFamily: 'monospace', color: '#64748B', letterSpacing: 3, marginTop: 2 }}>
                    *{codigoRetiroGenerado}*
                  </Text>

                  <Text style={{ fontSize: 11, fontFamily: 'Inter-Regular', color: '#94A3B8', marginTop: 8, textAlign: 'center' }}>
                    Dicta este código o escanéalo en el tótem de {storeName}
                  </Text>

                  {comprobantePago?.authorizationCode && (
                    <Text style={{ fontSize: 10, fontFamily: 'Inter-Regular', color: '#64748B', marginTop: 6, fontStyle: 'italic' }}>
                      Autorización: {comprobantePago.authorizationCode} • ID: {comprobantePago.transactionId}
                    </Text>
                  )}
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
