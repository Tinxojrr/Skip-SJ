import { DarkTheme, DefaultTheme, ThemeProvider, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useThemeStore } from '../store/themeStore';
import '../global.css';

export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    // Forzamos esconder el splash screen inmediatamente
    SplashScreen.hideAsync().catch(() => {});
    SystemUI.setBackgroundColorAsync(isDarkMode ? '#09090B' : '#FAFAFA').catch(() => {});
  }, [fontsLoaded, isDarkMode]);

  const customDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: '#09090B',
      card: '#121217',
      text: '#F4F4F5',
      border: 'rgba(255,255,255,0.08)',
      primary: '#F2A900',
    },
  };

  return (
    <SafeAreaProvider style={{ backgroundColor: isDarkMode ? '#09090B' : '#FAFAFA' }}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <ThemeProvider value={isDarkMode ? customDarkTheme : DefaultTheme}>
        <Stack screenOptions={{ 
          headerShown: false,
          contentStyle: { backgroundColor: isDarkMode ? '#09090B' : '#FAFAFA' }
        }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="auth" options={{ presentation: 'modal' }} />
          <Stack.Screen name="edit-profile" options={{ presentation: 'modal' }} />
          <Stack.Screen name="product/[id]" />
        </Stack>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
