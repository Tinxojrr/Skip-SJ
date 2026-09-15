import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, KeyRound, Smartphone, Fingerprint, ShieldAlert, Trash2, ChevronRight } from 'lucide-react-native';

export default function SecurityScreen() {
  const router = useRouter();
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handleSimulateAction = (title: string) => {
    Alert.alert(title, "Esta función estará disponible en la próxima actualización de seguridad.");
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: 'rgba(17,17,17,0.05)' }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8, marginLeft: -8 }}>
          <ArrowLeft color="#111111" size={24} />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontFamily: 'Inter-Bold', color: '#111111', marginLeft: 12 }}>Seguridad</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24 }}>
        
        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: 'rgba(17,17,17,0.6)', marginBottom: 24, lineHeight: 20 }}>
          Mantén tu cuenta protegida y gestiona cómo inicias sesión en la aplicación.
        </Text>

        {/* Sección: Autenticación */}
        <Text style={{ fontSize: 13, fontFamily: 'Inter-Bold', color: 'rgba(17,17,17,0.4)', textTransform: 'uppercase', marginBottom: 12 }}>Autenticación y Acceso</Text>
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, paddingHorizontal: 16, borderWidth: 1, borderColor: 'rgba(17,17,17,0.05)', marginBottom: 32 }}>
          
          {/* Contraseña */}
          <TouchableOpacity 
            onPress={() => handleSimulateAction('Cambiar contraseña')}
            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(17,17,17,0.05)' }}
          >
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(17,17,17,0.05)', justifyContent: 'center', alignItems: 'center' }}>
              <KeyRound color="#111111" size={18} />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 15, color: '#111111' }}>Cambiar contraseña</Text>
              <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: 'rgba(17,17,17,0.5)', marginTop: 2 }}>Actualizada hace 2 meses</Text>
            </View>
            <ChevronRight color="rgba(17,17,17,0.2)" size={20} />
          </TouchableOpacity>

          {/* Biometría */}
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(17,17,17,0.05)' }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(17,17,17,0.05)', justifyContent: 'center', alignItems: 'center' }}>
              <Fingerprint color="#111111" size={18} />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 15, color: '#111111' }}>Huella / Face ID</Text>
              <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: 'rgba(17,17,17,0.5)', marginTop: 2 }}>Iniciar sesión más rápido</Text>
            </View>
            <Switch 
              value={biometricsEnabled} 
              onValueChange={setBiometricsEnabled} 
              trackColor={{ false: 'rgba(17,17,17,0.1)', true: '#F2A900' }}
              thumbColor={'#FFFFFF'}
            />
          </View>

          {/* 2FA */}
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16 }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(17,17,17,0.05)', justifyContent: 'center', alignItems: 'center' }}>
              <ShieldAlert color="#111111" size={18} />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 15, color: '#111111' }}>Verificación en 2 pasos</Text>
              <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: 'rgba(17,17,17,0.5)', marginTop: 2 }}>Capa extra de seguridad</Text>
            </View>
            <Switch 
              value={twoFactorEnabled} 
              onValueChange={setTwoFactorEnabled}
              trackColor={{ false: 'rgba(17,17,17,0.1)', true: '#F2A900' }}
              thumbColor={'#FFFFFF'}
            />
          </View>
        </View>

        {/* Sección: Dispositivos */}
        <Text style={{ fontSize: 13, fontFamily: 'Inter-Bold', color: 'rgba(17,17,17,0.4)', textTransform: 'uppercase', marginBottom: 12 }}>Dispositivos</Text>
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, paddingHorizontal: 16, borderWidth: 1, borderColor: 'rgba(17,17,17,0.05)', marginBottom: 32 }}>
          <TouchableOpacity 
            onPress={() => handleSimulateAction('Dispositivos conectados')}
            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16 }}
          >
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(17,17,17,0.05)', justifyContent: 'center', alignItems: 'center' }}>
              <Smartphone color="#111111" size={18} />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 15, color: '#111111' }}>Dispositivos conectados</Text>
              <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: '#00A650', marginTop: 2 }}>1 sesión activa (Este dispositivo)</Text>
            </View>
            <ChevronRight color="rgba(17,17,17,0.2)" size={20} />
          </TouchableOpacity>
        </View>

        {/* Sección: Peligro */}
        <Text style={{ fontSize: 13, fontFamily: 'Inter-Bold', color: 'rgba(229, 62, 62, 0.6)', textTransform: 'uppercase', marginBottom: 12 }}>Zona de Peligro</Text>
        <TouchableOpacity 
          onPress={handleDeleteAccount}
          style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: '#FEF2F2', // Fondo rojo muy clarito
            borderRadius: 16, 
            paddingVertical: 16, 
            borderWidth: 1, 
            borderColor: 'rgba(229, 62, 62, 0.2)' 
          }}
        >
          <Trash2 color="#E53E3E" size={20} />
          <Text style={{ fontFamily: 'Inter-Bold', fontSize: 15, color: '#E53E3E', marginLeft: 12 }}>Eliminar mi cuenta</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

