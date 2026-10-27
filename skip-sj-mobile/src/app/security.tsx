import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, KeyRound, Smartphone, Fingerprint, ShieldAlert, Trash2, ChevronRight } from 'lucide-react-native';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

export default function SecurityScreen() {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const { session } = useAuthStore();

  const bg = isDarkMode ? '#09090B' : '#FAFAFA';
  const cardBg = isDarkMode ? '#18181B' : '#FFFFFF';
  const cardAlt = isDarkMode ? '#27272A' : '#F4F4F5';
  const textPrimary = isDarkMode ? '#F4F4F5' : '#111111';
  const textSecondary = isDarkMode ? '#A1A1AA' : 'rgba(17,17,17,0.5)';
  const textMuted = isDarkMode ? '#71717A' : 'rgba(17,17,17,0.4)';
  const borderColor = isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(17,17,17,0.05)';

  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handleResetPassword = () => {
    const email = session?.user?.email;
    if (!email) {
      Alert.alert('Error', 'No se encontró un correo institucional asociado a tu sesión.');
      return;
    }

    Alert.alert(
      "Cambiar Contraseña",
      `¿Deseas enviar un enlace de restablecimiento seguro a tu correo institucional?\n\n${email}`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Enviar Enlace", 
          onPress: async () => {
            try {
              const { error } = await supabase.auth.resetPasswordForEmail(email);
              if (error) throw error;
              Alert.alert("Enlace Enviado", "Revisa tu bandeja de entrada en tu correo Duoc UC para continuar.");
            } catch (err: any) {
              Alert.alert("Error", err.message || "No se pudo enviar el correo de recuperación.");
            }
          } 
        }
      ]
    );
  };

  const handleShowDevices = () => {
    const osName = Platform.OS === 'android' ? 'Android' : Platform.OS === 'ios' ? 'iOS' : 'Web';
    Alert.alert(
      "Dispositivos Conectados",
      `• Dispositivo actual: ${osName} (Sesión activa)\n• Ubicación de red: Campus San Joaquín\n• Autenticación: Supabase Auth Tokens`,
      [{ text: "Entendido" }]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Eliminar Cuenta Definitivamente",
      "¿Estás seguro de que deseas eliminar tu cuenta? Perderás todo tu historial de pedidos y métodos de pago guardados. Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sí, eliminar cuenta", 
          style: "destructive", 
          onPress: () => Alert.alert("Proceso iniciado", "Nos pondremos en contacto a tu correo institucional para confirmar la eliminación.") 
        }
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16, backgroundColor: cardBg, borderBottomWidth: 1, borderBottomColor: borderColor }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8, marginLeft: -8 }}>
          <ArrowLeft color={textPrimary} size={24} />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontFamily: 'Inter-Bold', color: textPrimary, marginLeft: 12 }}>Seguridad</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24 }}>
        
        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: textSecondary, marginBottom: 24, lineHeight: 20 }}>
          Mantén tu cuenta protegida y gestiona cómo inicias sesión en la aplicación.
        </Text>

        {/* Sección: Autenticación */}
        <Text style={{ fontSize: 13, fontFamily: 'Inter-Bold', color: textMuted, textTransform: 'uppercase', marginBottom: 12 }}>
          Autenticación y Acceso
        </Text>
        <View style={{ backgroundColor: cardBg, borderRadius: 20, paddingHorizontal: 16, borderWidth: 1, borderColor, marginBottom: 32 }}>
          
          {/* Contraseña */}
          <TouchableOpacity 
            onPress={handleResetPassword}
            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: borderColor }}
          >
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: cardAlt, justifyContent: 'center', alignItems: 'center' }}>
              <KeyRound color={textPrimary} size={18} />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 15, color: textPrimary }}>Cambiar contraseña</Text>
              <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: textSecondary, marginTop: 2 }}>Actualizada hace 2 meses</Text>
            </View>
            <ChevronRight color={textMuted} size={20} />
          </TouchableOpacity>

          {/* Biometría */}
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: borderColor }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: cardAlt, justifyContent: 'center', alignItems: 'center' }}>
              <Fingerprint color={textPrimary} size={18} />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 15, color: textPrimary }}>Huella / Face ID</Text>
              <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: textSecondary, marginTop: 2 }}>Iniciar sesión más rápido</Text>
            </View>
            <Switch 
              value={biometricsEnabled} 
              onValueChange={setBiometricsEnabled} 
              trackColor={{ false: isDarkMode ? '#27272A' : 'rgba(17,17,17,0.1)', true: '#F2A900' }}
              thumbColor={'#FFFFFF'}
            />
          </View>

          {/* 2FA */}
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16 }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: cardAlt, justifyContent: 'center', alignItems: 'center' }}>
              <ShieldAlert color={textPrimary} size={18} />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 15, color: textPrimary }}>Verificación en 2 pasos</Text>
              <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: textSecondary, marginTop: 2 }}>Capa extra de seguridad</Text>
            </View>
            <Switch 
              value={twoFactorEnabled} 
              onValueChange={setTwoFactorEnabled}
              trackColor={{ false: isDarkMode ? '#27272A' : 'rgba(17,17,17,0.1)', true: '#F2A900' }}
              thumbColor={'#FFFFFF'}
            />
          </View>
        </View>

        {/* Sección: Dispositivos */}
        <Text style={{ fontSize: 13, fontFamily: 'Inter-Bold', color: textMuted, textTransform: 'uppercase', marginBottom: 12 }}>
          Dispositivos
        </Text>
        <View style={{ backgroundColor: cardBg, borderRadius: 20, paddingHorizontal: 16, borderWidth: 1, borderColor, marginBottom: 32 }}>
          <TouchableOpacity 
            onPress={handleShowDevices}
            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16 }}
          >
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: cardAlt, justifyContent: 'center', alignItems: 'center' }}>
              <Smartphone color={textPrimary} size={18} />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 15, color: textPrimary }}>Dispositivos conectados</Text>
              <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: '#10B981', marginTop: 2 }}>1 sesión activa (Este dispositivo)</Text>
            </View>
            <ChevronRight color={textMuted} size={20} />
          </TouchableOpacity>
        </View>

        {/* Sección: Peligro */}
        <Text style={{ fontSize: 13, fontFamily: 'Inter-Bold', color: 'rgba(239, 68, 68, 0.7)', textTransform: 'uppercase', marginBottom: 12 }}>
          Zona de Peligro
        </Text>
        <TouchableOpacity 
          onPress={handleDeleteAccount}
          style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.12)' : '#FEF2F2',
            borderRadius: 16, 
            paddingVertical: 16, 
            borderWidth: 1, 
            borderColor: 'rgba(239, 68, 68, 0.25)' 
          }}
        >
          <Trash2 color="#EF4444" size={20} />
          <Text style={{ fontFamily: 'Inter-Bold', fontSize: 15, color: '#EF4444', marginLeft: 12 }}>Eliminar mi cuenta</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
