import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Image, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import { 
  CreditCard, 
  History, 
  Heart, 
  Bell, 
  Shield, 
  HelpCircle, 
  LogOut, 
  ChevronRight, 
  Wallet,
  Moon
} from 'lucide-react-native';

const MENU_ITEMS = [
  { id: 'history', title: 'Historial de Pedidos', icon: History },
  { id: 'favorites', title: 'Mis Favoritos', icon: Heart },
  { id: 'notifications', title: 'Notificaciones', icon: Bell },
  { id: 'security', title: 'Seguridad', icon: Shield },
  { id: 'help', title: 'Soporte y Ayuda', icon: HelpCircle },
];

export default function ProfileScreen() {
  const { session, profile, setSession } = useAuthStore();
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const router = useRouter();

  // Variables de tema dinámico
  const bg = isDarkMode ? '#09090B' : '#FAFAFA';
  const cardBg = isDarkMode ? '#18181B' : '#FFFFFF';
  const textPrimary = isDarkMode ? '#F4F4F5' : '#111111';
  const textSecondary = isDarkMode ? '#A1A1AA' : 'rgba(17,17,17,0.5)';
  const borderColor = isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(17,17,17,0.05)';
  const iconColor = isDarkMode ? '#E4E4E7' : '#111111';

  // Extraer iniciales y nombre del usuario
  const email = session?.user?.email || '';
  
  let fullName = 'Alumno Duoc';
  if (profile && profile.p_nombre) {
    fullName = `${profile.p_nombre} ${profile.apellido_p || ''}`.trim();
  } else if (session?.user?.user_metadata?.full_name) {
    fullName = session.user.user_metadata.full_name;
  }
  
  const displayName = profile?.apodo || fullName;
  
  const initials = displayName
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

  const handlePressJunaeb = () => {
    Alert.alert(
      "Tarjeta Junaeb BAES",
      `Estado: Activa y vinculada\nBeneficiario: ${displayName}\nConvenio: Sede San Joaquín\n\nPuedes utilizar tu saldo BAES para pagar de forma presencial o validar tu compra en los tótems y cajas de la sede.`,
      [
        { text: "Administrar", onPress: () => router.push('/add-payment') },
        { text: "Cerrar", style: "cancel" }
      ]
    );
  };

  const handlePressBank = () => {
    Alert.alert(
      "BancoEstado (CuentaRUT)",
      `Estado: Vinculado vía Open Banking\nTitular: ${displayName}\n\nPermite transferencias inmediatas de pago sin costo adicional en el casino.`,
      [
        { text: "Administrar Métodos", onPress: () => router.push('/add-payment') },
        { text: "Cerrar", style: "cancel" }
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        
        {/* Header (Avatar & Info) */}
        <View style={{ alignItems: 'center', paddingTop: 40, paddingBottom: 32 }}>
          {profile?.avatar_url ? (
            <Image 
              source={{ uri: profile.avatar_url }}
              style={{
                width: 100, 
                height: 100, 
                borderRadius: 50,
                marginBottom: 16,
                borderWidth: 2,
                borderColor: isDarkMode ? '#F2A900' : 'rgba(17,17,17,0.1)'
              }}
            />
          ) : (
            <View style={{ 
              width: 100, 
              height: 100, 
              borderRadius: 50, 
              backgroundColor: isDarkMode ? '#1E1E24' : '#111111', 
              justifyContent: 'center', 
              alignItems: 'center',
              marginBottom: 16,
              borderWidth: isDarkMode ? 1 : 0,
              borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'transparent',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.15,
              shadowRadius: 16,
              elevation: 4
            }}>
              <Text style={{ color: '#F2A900', fontSize: 36, fontFamily: 'Inter-Bold' }}>{initials || 'DU'}</Text>
            </View>
          )}
          <Text style={{ fontSize: 24, fontFamily: 'Inter-Bold', color: textPrimary, marginBottom: 4 }}>
            {displayName}
          </Text>
          {profile?.apodo && (
            <Text style={{ fontSize: 13, fontFamily: 'Inter-Regular', color: textSecondary, marginBottom: 2 }}>
              {fullName}
            </Text>
          )}
          <Text style={{ fontSize: 14, fontFamily: 'Inter-Regular', color: textSecondary }}>
            {email}
          </Text>
          
          <TouchableOpacity 
            onPress={() => router.push('/edit-profile')}
            style={{ 
              marginTop: 16, 
              paddingHorizontal: 20, 
              paddingVertical: 8, 
              backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(17,17,17,0.05)', 
              borderRadius: 20 
            }}
          >
            <Text style={{ color: textPrimary, fontFamily: 'Inter-SemiBold', fontSize: 13 }}>
              Editar perfil
            </Text>
          </TouchableOpacity>
        </View>

        {/* Métodos de Pago Section */}
        <View style={{ paddingHorizontal: 24, marginBottom: 32 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontFamily: 'Inter-Bold', color: textPrimary }}>
              Métodos de Pago
            </Text>
            <TouchableOpacity onPress={() => router.push('/add-payment')}>
              <Text style={{ fontSize: 13, fontFamily: 'Inter-SemiBold', color: '#F2A900' }}>
                + Agregar
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ gap: 12 }}>
            {/* Junaeb BAES Card */}
            <TouchableOpacity 
              onPress={handlePressJunaeb}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: cardBg,
                padding: 16,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: isDarkMode ? 'rgba(0,166,80,0.4)' : 'rgba(0,166,80,0.3)',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.03,
                shadowRadius: 8,
                elevation: 1
              }}
            >
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(0,166,80,0.12)', justifyContent: 'center', alignItems: 'center' }}>
                <Wallet color="#00A650" size={20} />
              </View>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={{ color: textPrimary, fontFamily: 'Inter-SemiBold', fontSize: 15, marginBottom: 2 }}>
                  Tarjeta Junaeb BAES
                </Text>
                <Text style={{ color: textSecondary, fontFamily: 'Inter-Regular', fontSize: 12 }}>
                  Saldo disponible: $42.500
                </Text>
              </View>
              <ChevronRight color={textSecondary} size={20} />
            </TouchableOpacity>

            {/* Banco Directo */}
            <TouchableOpacity 
              onPress={handlePressBank}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: cardBg,
                padding: 16,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: borderColor,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.03,
                shadowRadius: 8,
                elevation: 1
              }}
            >
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: isDarkMode ? 'rgba(0,61,122,0.2)' : 'rgba(17,17,17,0.05)', justifyContent: 'center', alignItems: 'center' }}>
                <CreditCard color={iconColor} size={20} />
              </View>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={{ color: textPrimary, fontFamily: 'Inter-SemiBold', fontSize: 15, marginBottom: 2 }}>
                  BancoEstado (CuentaRUT)
                </Text>
                <Text style={{ color: textSecondary, fontFamily: 'Inter-Regular', fontSize: 12 }}>
                  Open Banking directo vinculado
                </Text>
              </View>
              <ChevronRight color={textSecondary} size={20} />
            </TouchableOpacity>
          </View>
        </View>

        {/* General Menu Settings: MI CUENTA */}
        <View style={{ paddingHorizontal: 24, marginBottom: 32 }}>
          <Text style={{ fontSize: 18, fontFamily: 'Inter-Bold', color: textPrimary, marginBottom: 16 }}>
            Mi Cuenta
          </Text>
          
          <View style={{ backgroundColor: cardBg, borderRadius: 24, paddingHorizontal: 16, borderWidth: 1, borderColor }}>
            
            {/* TOGGLE MODO OSCURO */}
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: borderColor
            }}>
              <View style={{ 
                width: 36, 
                height: 36, 
                borderRadius: 10, 
                backgroundColor: isDarkMode ? 'rgba(242,169,0,0.15)' : 'rgba(17,17,17,0.05)', 
                justifyContent: 'center', 
                alignItems: 'center' 
              }}>
                <Moon color={isDarkMode ? '#F2A900' : '#111111'} size={20} />
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={{ color: textPrimary, fontFamily: 'Inter-SemiBold', fontSize: 15 }}>
                  Modo Oscuro
                </Text>
                <Text style={{ color: textSecondary, fontFamily: 'Inter-Regular', fontSize: 11, marginTop: 1 }}>
                  {isDarkMode ? 'Tema Obsidian nocturno' : 'Tema claro estándar'}
                </Text>
              </View>
              <Switch 
                value={isDarkMode} 
                onValueChange={toggleDarkMode}
                trackColor={{ false: '#E4E4E7', true: '#003D7A' }}
                thumbColor={isDarkMode ? '#F2A900' : '#FFFFFF'}
              />
            </View>

            {/* LISTA DE OPCIONES DE CUENTA */}
            {MENU_ITEMS.map((item, index) => {
              const Icon = item.icon;
              const isLast = index === MENU_ITEMS.length - 1;
              return (
                <TouchableOpacity 
                  key={item.id}
                  onPress={() => {
                    if (item.id === 'history') {
                      router.push('/history');
                    } else if (item.id === 'favorites') {
                      router.push('/favorites');
                    } else if (item.id === 'notifications') {
                      router.push('/notifications');
                    } else if (item.id === 'security') {
                      router.push('/security');
                    } else if (item.id === 'help') {
                      router.push('/support');
                    }
                  }}
                  style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    paddingVertical: 16,
                    borderBottomWidth: isLast ? 0 : 1,
                    borderBottomColor: borderColor
                  }}
                >
                  <Icon color={iconColor} size={22} />
                  <Text style={{ flex: 1, marginLeft: 16, color: textPrimary, fontFamily: 'Inter-SemiBold', fontSize: 15 }}>
                    {item.title}
                  </Text>
                  <ChevronRight color={textSecondary} size={20} />
                </TouchableOpacity>
              );
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
            <Text style={{ marginLeft: 8, color: '#EF4444', fontFamily: 'Inter-Bold', fontSize: 15 }}>
              Cerrar Sesión
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
