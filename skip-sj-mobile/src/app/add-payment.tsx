import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, CreditCard, ShieldCheck, Trash2, CheckCircle2 } from 'lucide-react-native';
import { useThemeStore } from '../store/themeStore';
import { usePaymentStore } from '../store/paymentStore';

export default function AddPaymentScreen() {
  const router = useRouter();
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const { savedCards, addCard, removeCard, setDefaultCard } = usePaymentStore();

  const bg = isDarkMode ? '#09090B' : '#FAFAFA';
  const cardBg = isDarkMode ? '#18181B' : '#FFFFFF';
  const cardAlt = isDarkMode ? '#27272A' : '#F4F4F5';
  const textPrimary = isDarkMode ? '#F4F4F5' : '#111111';
  const textSecondary = isDarkMode ? '#A1A1AA' : 'rgba(17,17,17,0.5)';
  const borderColor = isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(17,17,17,0.08)';

  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    setCardNumber(formatted.substring(0, 19));
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length > 2) {
      setExpiry(`${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`);
    } else {
      setExpiry(cleaned);
    }
  };

  const handleSave = async () => {
    if (cardNumber.length < 19 || !cardName.trim() || expiry.length < 5 || cvv.length < 3) {
      Alert.alert('Datos Incompletos', 'Por favor completa todos los campos de la tarjeta con formato válido.');
      return;
    }

    setIsSaving(true);
    try {
      await addCard({
        cardNumber,
        cardLast4: cardNumber.replace(/\s/g, '').slice(-4),
        cardName: cardName.trim(),
        expiry,
        brand: cardNumber.startsWith('4') ? 'visa' : cardNumber.startsWith('5') ? 'mastercard' : 'otra'
      });

      Alert.alert(
        'Tarjeta Guardada con Éxito',
        'Tu tarjeta ha sido vinculada y guardada de forma segura para tus pagos en la sede.',
        [{ text: 'Aceptar', onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo guardar la tarjeta.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCard = (id: string, last4: string) => {
    Alert.alert(
      'Eliminar Tarjeta',
      `¿Deseas eliminar la tarjeta terminada en ${last4}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => removeCard(id) }
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16, backgroundColor: cardBg, borderBottomWidth: 1, borderBottomColor: borderColor }}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 8, marginLeft: -8 }}>
            <ArrowLeft color={textPrimary} size={24} />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontFamily: 'Inter-Bold', color: textPrimary, marginLeft: 12 }}>Métodos de Pago</Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          
          {/* Tarjetas ya guardadas */}
          {savedCards.length > 0 && (
            <View style={{ marginBottom: 28 }}>
              <Text style={{ fontSize: 15, fontFamily: 'Inter-Bold', color: textPrimary, marginBottom: 12 }}>
                Tus Tarjetas Guardadas
              </Text>
              <View style={{ gap: 10 }}>
                {savedCards.map((c) => (
                  <View 
                    key={c.id}
                    style={{ 
                      flexDirection: 'row', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      backgroundColor: cardBg,
                      padding: 14,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <CreditCard size={20} color={c.brand === 'visa' ? '#1D4ED8' : '#EA580C'} />
                      <View>
                        <Text style={{ color: textPrimary, fontFamily: 'Inter-Bold', fontSize: 14 }}>
                          {c.brand.toUpperCase()} {c.cardNumber}
                        </Text>
                        <Text style={{ color: textSecondary, fontFamily: 'Inter-Regular', fontSize: 11 }}>
                          Vence: {c.expiry} • {c.cardName}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity 
                      onPress={() => handleDeleteCard(c.id, c.cardLast4)}
                      style={{ padding: 6 }}
                    >
                      <Trash2 size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Tarjeta Visual de Previsualización */}
          <Text style={{ fontSize: 15, fontFamily: 'Inter-Bold', color: textPrimary, marginBottom: 12 }}>
            Vincular Nueva Tarjeta
          </Text>

          <View style={{
            backgroundColor: isDarkMode ? '#1E293B' : '#111111',
            borderRadius: 20,
            padding: 24,
            height: 190,
            justifyContent: 'space-between',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: isDarkMode ? 0.4 : 0.2,
            shadowRadius: 16,
            elevation: 8,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'transparent'
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <CreditCard color="#F2A900" size={32} />
              {cardNumber.startsWith('4') && <Text style={{ color: '#FFFFFF', fontFamily: 'Inter-Bold', fontSize: 18, fontStyle: 'italic' }}>VISA</Text>}
              {cardNumber.startsWith('5') && <Text style={{ color: '#FFFFFF', fontFamily: 'Inter-Bold', fontSize: 18, fontStyle: 'italic' }}>MasterCard</Text>}
            </View>

            <View>
              <Text style={{ fontFamily: 'Inter-Bold', fontSize: 22, color: '#FFFFFF', letterSpacing: 2 }}>
                {cardNumber || '•••• •••• •••• ••••'}
              </Text>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 }}>
                <View>
                  <Text style={{ fontFamily: 'Inter-Regular', fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Titular</Text>
                  <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 13, color: '#FFFFFF', textTransform: 'uppercase' }} numberOfLines={1}>
                    {cardName || 'NOMBRE APELLIDO'}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontFamily: 'Inter-Regular', fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Vence</Text>
                  <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 13, color: '#FFFFFF' }}>
                    {expiry || 'MM/AA'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Formulario */}
          <View style={{ gap: 16 }}>
            <View>
              <Text style={{ fontSize: 13, fontFamily: 'Inter-SemiBold', color: textPrimary, marginBottom: 8 }}>Número de Tarjeta</Text>
              <TextInput
                value={cardNumber}
                onChangeText={formatCardNumber}
                placeholder="0000 0000 0000 0000"
                placeholderTextColor={textSecondary}
                keyboardType="numeric"
                maxLength={19}
                style={{ backgroundColor: cardBg, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor, fontSize: 15, fontFamily: 'Inter-Regular', color: textPrimary }}
              />
            </View>

            <View>
              <Text style={{ fontSize: 13, fontFamily: 'Inter-SemiBold', color: textPrimary, marginBottom: 8 }}>Nombre del Titular</Text>
              <TextInput
                value={cardName}
                onChangeText={setCardName}
                placeholder="Tal como aparece en la tarjeta"
                placeholderTextColor={textSecondary}
                autoCapitalize="characters"
                style={{ backgroundColor: cardBg, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor, fontSize: 15, fontFamily: 'Inter-Regular', color: textPrimary }}
              />
            </View>

            <View style={{ flexDirection: 'row', gap: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontFamily: 'Inter-SemiBold', color: textPrimary, marginBottom: 8 }}>Vencimiento</Text>
                <TextInput
                  value={expiry}
                  onChangeText={formatExpiry}
                  placeholder="MM/AA"
                  placeholderTextColor={textSecondary}
                  keyboardType="numeric"
                  maxLength={5}
                  style={{ backgroundColor: cardBg, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor, fontSize: 15, fontFamily: 'Inter-Regular', color: textPrimary }}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontFamily: 'Inter-SemiBold', color: textPrimary, marginBottom: 8 }}>CVV</Text>
                <TextInput
                  value={cvv}
                  onChangeText={(text) => setCvv(text.replace(/\D/g, ''))}
                  placeholder="123"
                  placeholderTextColor={textSecondary}
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                  style={{ backgroundColor: cardBg, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor, fontSize: 15, fontFamily: 'Inter-Regular', color: textPrimary }}
                />
              </View>
            </View>
          </View>

          {/* Sello de seguridad */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20 }}>
            <ShieldCheck color="#00A650" size={16} />
            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: textSecondary, marginLeft: 8 }}>
              Cifrado seguro 256-bit y almacenamiento protegido
            </Text>
          </View>

          {/* Botón Guardar */}
          <TouchableOpacity 
            onPress={handleSave}
            disabled={isSaving}
            style={{ 
              marginTop: 24,
              backgroundColor: '#F2A900', 
              paddingVertical: 16, 
              borderRadius: 16, 
              alignItems: 'center', 
              shadowColor: '#F2A900', 
              shadowOffset: { width: 0, height: 4 }, 
              shadowOpacity: 0.3, 
              shadowRadius: 8, 
              elevation: 4,
              opacity: isSaving ? 0.7 : 1
            }}
          >
            <Text style={{ fontFamily: 'Inter-Bold', fontSize: 16, color: '#111111' }}>
              {isSaving ? 'Guardando...' : 'Guardar y Vincular Tarjeta'}
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
