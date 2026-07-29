import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import { CreditCard, History, Heart, Bell, Shield, HelpCircle, LogOut, ChevronRight, Wallet } from 'lucide-react-native';

const MENU_ITEMS = [
  { id: 'history', title: 'Historial de Pedidos', icon: History, color: '#111111' },
  { id: 'favorites', title: 'Mis Favoritos', icon: Heart, color: '#111111' },
  { id: 'notifications', title: 'Notificaciones', icon: Bell, color: '#111111' },
  { id: 'security', title: 'Seguridad', icon: Shield, color: '#111111' },
  { id: 'help', title: 'Soporte y Ayuda', icon: HelpCircle, color: '#111111' },
];

export default function ProfileScreen() {
  const { session, setSession } = useAuthStore();
  const router = useRouter();

  // Extraer iniciales y nombre del usuario
  const email = session?.user?.email || '';
  const fullName = session?.user?.user_metadata?.full_name || 'Alumno Duoc';
  const initials = fullName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const handleLogout = async () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro que deseas cerrar tu sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sí, salir", 
          style: "destructive",
          onPress: async () => {
            await supabase.auth.signOut();
            setSession(null);
            router.replace('/auth');
          }
        }
      ]
    );
  };

  const handlePressSimulate = (title: string) => {
    Alert.alert("Próximamente", `La sección de ${title} estará disponible pronto.`);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        
        {/* Header (Avatar & Info) */}
        <View style={{ alignItems: 'center', paddingTop: 40, paddingBottom: 32 }}>
          <View style={{ 
            width: 100, 
            height: 100, 
            borderRadius: 50, 
            backgroundColor: '#111111', 
            justifyContent: 'center', 
            alignItems: 'center',
            marginBottom: 16,
            shadowColor: '#111111',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 16,
            elevation: 4
          }}>
            <Text style={{ color: '#F2A900', fontSize: 36, fontFamily: 'Inter-Bold' }}>{initials || 'DU'}</Text>
          </View>
          <Text style={{ fontSize: 24, fontFamily: 'Inter-Bold', color: '#111111', marginBottom: 4 }}>{fullName}</Text>
          <Text style={{ fontSize: 14, fontFamily: 'Inter-Regular', color: 'rgba(17,17,17,0.5)' }}>{email}</Text>
          
          <TouchableOpacity 
            onPress={() => handlePressSimulate('Editar Perfil')}
            style={{ marginTop: 16, paddingHorizontal: 20, paddingVertical: 8, backgroundColor: 'rgba(17,17,17,0.05)', borderRadius: 20 }}
          >
            <Text style={{ color: '#111111', fontFamily: 'Inter-SemiBold', fontSize: 13 }}>Editar perfil</Text>
          </TouchableOpacity>
        </View>

        {/* Payment Methods Section */}
        <View style={{ paddingHorizontal: 24, marginBottom: 32 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontFamily: 'Inter-Bold', color: '#111111' }}>Métodos de Pago</Text>
            <TouchableOpacity onPress={() => handlePressSimulate('Agregar Método')}>
              <Text style={{ fontSize: 13, fontFamily: 'Inter-SemiBold', color: '#F2A900' }}>+ Agregar</Text>
            </TouchableOpacity>
          </View>

          <View style={{ gap: 12 }}>
            {/* Junaeb BAES Card */}
            <TouchableOpacity 
              onPress={() => handlePressSimulate('Configurar Junaeb')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#FFFFFF',
                padding: 16,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: 'rgba(0,166,80,0.3)', // Color verde sutil de Junaeb
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.03,
                shadowRadius: 8,
                elevation: 1
              }}
            >
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(0,166,80,0.1)', justifyContent: 'center', alignItems: 'center' }}>
                <Wallet color="#00A650" size={20} />
              </View>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={{ color: '#111111', fontFamily: 'Inter-SemiBold', fontSize: 15, marginBottom: 2 }}>Tarjeta Junaeb BAES</Text>
                <Text style={{ color: 'rgba(17,17,17,0.5)', fontFamily: 'Inter-Regular', fontSize: 12 }}>Saldo disponible: $42.500</Text>
              </View>
              <ChevronRight color="rgba(17,17,17,0.3)" size={20} />
            </TouchableOpacity>

            {/* Credit Card */}
            <TouchableOpacity 
              onPress={() => handlePressSimulate('Configurar Tarjeta')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#FFFFFF',
                padding: 16,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: 'rgba(17,17,17,0.05)',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.03,
                shadowRadius: 8,
                elevation: 1
              }}
            >
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(17,17,17,0.05)', justifyContent: 'center', alignItems: 'center' }}>
                <CreditCard color="#111111" size={20} />
              </View>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={{ color: '#111111', fontFamily: 'Inter-SemiBold', fontSize: 15, marginBottom: 2 }}>Visa Débito</Text>
                <Text style={{ color: 'rgba(17,17,17,0.5)', fontFamily: 'Inter-Regular', fontSize: 12 }}>Terminada en 4242</Text>
              </View>
              <ChevronRight color="rgba(17,17,17,0.3)" size={20} />
            </TouchableOpacity>
          </View>
        </View>

        {/* General Menu Settings */}
        <View style={{ paddingHorizontal: 24, marginBottom: 32 }}>
          <Text style={{ fontSize: 18, fontFamily: 'Inter-Bold', color: '#111111', marginBottom: 16 }}>Mi Cuenta</Text>
          
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 24, paddingHorizontal: 16, borderWidth: 1, borderColor: 'rgba(17,17,17,0.05)' }}>
            {MENU_ITEMS.map((item, index) => {
              const Icon = item.icon;
              const isLast = index === MENU_ITEMS.length - 1;
              return (
                <TouchableOpacity 
                  key={item.id}
                  onPress={() => handlePressSimulate(item.title)}
                  style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    paddingVertical: 16,
                    borderBottomWidth: isLast ? 0 : 1,
                    borderBottomColor: 'rgba(17,17,17,0.05)'
                  }}
                >
                  <Icon color={item.color} size={22} />
                  <Text style={{ flex: 1, marginLeft: 16, color: '#111111', fontFamily: 'Inter-SemiBold', fontSize: 15 }}>{item.title}</Text>
                  <ChevronRight color="rgba(17,17,17,0.2)" size={20} />
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        {/* Logout Button */}
        <View style={{ paddingHorizontal: 24 }}>
          <TouchableOpacity 
            onPress={handleLogout}
            style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: 'rgba(239,68,68,0.1)', 
              paddingVertical: 16, 
              borderRadius: 20 
            }}
          >
            <LogOut color="#EF4444" size={20} />
            <Text style={{ marginLeft: 8, color: '#EF4444', fontFamily: 'Inter-Bold', fontSize: 15 }}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
