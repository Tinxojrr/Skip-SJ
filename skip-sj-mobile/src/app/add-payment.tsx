import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, CreditCard, ShieldCheck } from 'lucide-react-native';

export default function AddPaymentScreen() {
  const router = useRouter();
  
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const formatCardNumber = (text: string) => {
    // Removemos todo lo que no sea número
    const cleaned = text.replace(/\D/g, '');
    // Insertamos espacios cada 4 dígitos
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    setCardNumber(formatted.substring(0, 19)); // Máximo 16 dígitos + 3 espacios
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length > 2) {
      setExpiry(`${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`);
    } else {
      setExpiry(cleaned);
    }
  };

  const handleSave = () => {
    if (cardNumber.length < 19 || !cardName || expiry.length < 5 || cvv.length < 3) {
      Alert.alert('Error', 'Por favor, completa todos los datos de la tarjeta correctamente.');
      return;
    }
    
    // Aquí iría la lógica real para guardar un token con MercadoPago, Stripe, etc.
    Alert.alert(
      'Tarjeta vinculada', 
      'Tu tarjeta ha sido guardada de forma segura (Simulación).',
      [{ text: 'Aceptar', onPress: () => router.back() }]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: 'rgba(17,17,17,0.05)' }}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 8, marginLeft: -8 }}>
            <ArrowLeft color="#111111" size={24} />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontFamily: 'Inter-Bold', color: '#111111', marginLeft: 12 }}>Agregar Tarjeta</Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: 24 }}>
          
          {/* Tarjeta Visual */}
          <View style={{
            backgroundColor: '#111111',
            borderRadius: 16,
            padding: 24,
            height: 200,
            justifyContent: 'space-between',
            shadowColor: '#111111',
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.2,
            shadowRadius: 16,
            elevation: 8,
            marginBottom: 32
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <CreditCard color="#F2A900" size={32} />
              {cardNumber.startsWith('4') && <Text style={{ color: '#FFFFFF', fontFamily: 'Inter-Bold', fontSize: 18, fontStyle: 'italic' }}>VISA</Text>}
              {cardNumber.startsWith('5') && <Text style={{ color: '#FFFFFF', fontFamily: 'Inter-Bold', fontSize: 18, fontStyle: 'italic' }}>MasterCard</Text>}
            </View>

            <View>
              <Text style={{ fontFamily: 'Inter-Bold', fontSize: 24, color: '#FFFFFF', letterSpacing: 2 }}>
                {cardNumber || '**** **** **** ****'}
              </Text>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
                <View>
                  <Text style={{ fontFamily: 'Inter-Regular', fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Titular</Text>
                  <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 14, color: '#FFFFFF', textTransform: 'uppercase' }} numberOfLines={1}>
                    {cardName || 'NOMBRE APELLIDO'}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontFamily: 'Inter-Regular', fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Vence</Text>
                  <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 14, color: '#FFFFFF' }}>
                    {expiry || 'MM/AA'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Formulario */}
          <View style={{ gap: 20 }}>
            <View>
              <Text style={{ fontSize: 13, fontFamily: 'Inter-SemiBold', color: '#111111', marginBottom: 8 }}>Número de Tarjeta</Text>
              <TextInput
                value={cardNumber}
                onChangeText={formatCardNumber}
                placeholder="0000 0000 0000 0000"
                keyboardType="numeric"
                maxLength={19}
                style={{ backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(17,17,17,0.1)', fontSize: 15, fontFamily: 'Inter-Regular', color: '#111111' }}
              />
            </View>

            <View>
              <Text style={{ fontSize: 13, fontFamily: 'Inter-SemiBold', color: '#111111', marginBottom: 8 }}>Nombre del Titular</Text>
              <TextInput
                value={cardName}
                onChangeText={setCardName}
                placeholder="Tal como aparece en la tarjeta"
                autoCapitalize="characters"
                style={{ backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(17,17,17,0.1)', fontSize: 15, fontFamily: 'Inter-Regular', color: '#111111' }}
              />
            </View>

            <View style={{ flexDirection: 'row', gap: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontFamily: 'Inter-SemiBold', color: '#111111', marginBottom: 8 }}>Vencimiento</Text>
                <TextInput
                  value={expiry}
                  onChangeText={formatExpiry}
                  placeholder="MM/AA"
                  keyboardType="numeric"
                  maxLength={5}
                  style={{ backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(17,17,17,0.1)', fontSize: 15, fontFamily: 'Inter-Regular', color: '#111111' }}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontFamily: 'Inter-SemiBold', color: '#111111', marginBottom: 8 }}>CVV</Text>
                <TextInput
                  value={cvv}
                  onChangeText={(text) => setCvv(text.replace(/\D/g, ''))}
                  placeholder="123"
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                  style={{ backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(17,17,17,0.1)', fontSize: 15, fontFamily: 'Inter-Regular', color: '#111111' }}
                />
              </View>
            </View>
          </View>

          {/* Sello de seguridad */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 24 }}>
            <ShieldCheck color="#00A650" size={16} />
            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: 'rgba(17,17,17,0.5)', marginLeft: 8 }}>
              Tus datos están protegidos y encriptados
            </Text>
          </View>

        </ScrollView>

        {/* Botón flotante para guardar */}
        <View style={{ padding: 24, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: 'rgba(17,17,17,0.05)' }}>
          <TouchableOpacity 
            onPress={handleSave}
            style={{ backgroundColor: '#F2A900', paddingVertical: 16, borderRadius: 16, alignItems: 'center', shadowColor: '#F2A900', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }}
          >
            <Text style={{ fontFamily: 'Inter-Bold', fontSize: 16, color: '#111111' }}>Guardar Tarjeta</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

