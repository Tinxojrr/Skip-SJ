import { Tabs } from 'expo-router';
import { Home, ShoppingCart, User } from 'lucide-react-native';
import { useThemeStore } from '../../store/themeStore';

export default function TabsLayout() {
  const { isDarkMode } = useThemeStore();

  return (
    <Tabs screenOptions={{ 
      headerShown: false,
      tabBarActiveTintColor: isDarkMode ? '#F2A900' : '#111111',
      tabBarInactiveTintColor: isDarkMode ? '#71717A' : '#94A3B8',
      tabBarStyle: {
        backgroundColor: isDarkMode ? '#121217' : '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
        height: 60,
        paddingBottom: 8,
        paddingTop: 6
      }
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Carrito',
          tabBarIcon: ({ color }) => <ShoppingCart size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <User size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
