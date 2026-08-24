import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert, LayoutAnimation, UIManager, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { Mail, Lock, User } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp, LinearTransition, useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing } from 'react-native-reanimated';

import { GlassInput } from '../components/GlassInput';
import { GradientButton } from '../components/GradientButton';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function AuthScreen() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Animaciones de Blobs y Logo
  const blob1Y = useSharedValue(0);
  const blob1X = useSharedValue(0);
  const blob1Scale = useSharedValue(1);

  const blob2Y = useSharedValue(0);
  const blob2X = useSharedValue(0);
  const blob2Scale = useSharedValue(1);

  const blob3Y = useSharedValue(0);
  const blob3X = useSharedValue(0);
  const blob3Scale = useSharedValue(1);

  const logoY = useSharedValue(0);

  useEffect(() => {
    const easeInOut = Easing.inOut(Easing.sin);

    // Blob 1: 4000ms
    blob1Y.value = withRepeat(withSequence(withTiming(-15, { duration: 2000, easing: easeInOut }), withTiming(15, { duration: 2000, easing: easeInOut })), -1, true);
    blob1X.value = withRepeat(withSequence(withTiming(10, { duration: 2200, easing: easeInOut }), withTiming(-10, { duration: 2200, easing: easeInOut })), -1, true);
    blob1Scale.value = withRepeat(withSequence(withTiming(1.05, { duration: 2500, easing: easeInOut }), withTiming(1, { duration: 2500, easing: easeInOut })), -1, true);

    // Blob 2: 5500ms
    blob2Y.value = withRepeat(withSequence(withTiming(20, { duration: 2750, easing: easeInOut }), withTiming(-20, { duration: 2750, easing: easeInOut })), -1, true);
    blob2X.value = withRepeat(withSequence(withTiming(-15, { duration: 3000, easing: easeInOut }), withTiming(15, { duration: 3000, easing: easeInOut })), -1, true);
    blob2Scale.value = withRepeat(withSequence(withTiming(1.08, { duration: 3200, easing: easeInOut }), withTiming(0.95, { duration: 3200, easing: easeInOut })), -1, true);

    // Blob 3: 6800ms
    blob3Y.value = withRepeat(withSequence(withTiming(-18, { duration: 3400, easing: easeInOut }), withTiming(18, { duration: 3400, easing: easeInOut })), -1, true);
    blob3X.value = withRepeat(withSequence(withTiming(12, { duration: 3600, easing: easeInOut }), withTiming(-12, { duration: 3600, easing: easeInOut })), -1, true);
    blob3Scale.value = withRepeat(withSequence(withTiming(1.06, { duration: 3800, easing: easeInOut }), withTiming(0.98, { duration: 3800, easing: easeInOut })), -1, true);

    // Logo float: 2500ms
    logoY.value = withRepeat(withSequence(withTiming(-4, { duration: 1250, easing: easeInOut }), withTiming(4, { duration: 1250, easing: easeInOut })), -1, true);
  }, []);

  const b1Style = useAnimatedStyle(() => ({ transform: [{ translateY: blob1Y.value }, { translateX: blob1X.value }, { scale: blob1Scale.value }] }));
  const b2Style = useAnimatedStyle(() => ({ transform: [{ translateY: blob2Y.value }, { translateX: blob2X.value }, { scale: blob2Scale.value }] }));
  const b3Style = useAnimatedStyle(() => ({ transform: [{ translateY: blob3Y.value }, { translateX: blob3X.value }, { scale: blob3Scale.value }] }));
  const logoStyle = useAnimatedStyle(() => ({ transform: [{ translateY: logoY.value }] }));

  const toggleAuthMode = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsLogin(!isLogin);
    setEmailError('');
    setPasswordError('');
  };

  const validateForm = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');

    if (!email) {
      setEmailError('El correo es requerido');
      isValid = false;
    } else if (!email.endsWith('@duocuc.cl') && !email.endsWith('@profesor.duoc.cl')) {
      setEmailError('Debe ser un correo institucional (@duocuc.cl)');
      isValid = false;
    }

    if (!password) {
      setPasswordError('La contraseña es requerida');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Mínimo 6 caracteres');
      isValid = false;
    }

    if (!isLogin && password !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      isValid = false;
    }

    return isValid;
  };

  const handleAuth = async () => {
    if (!validateForm()) return;
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setSession(data.session);
        router.replace('/');
      } else {
        const { data, error } = await supabase.auth.signUp({
          email, password, options: { data: { full_name: fullName } }
        });
        if (error) throw error;

        // Asegurar que el usuario exista en la tabla pública 'usuarios'
        if (data.user) {
          const { data: existingUser } = await supabase.from('usuarios').select('id').eq('id', data.user.id).single();
          if (!existingUser) {
            const names = fullName.trim().split(' ');
            const newUser = {
              id: data.user.id,
              email: data.user.email!,
              p_nombre: names[0] || '',
              apellido_p: names.length > 1 ? names[names.length - 1] : '',
              rol: 'alumno', // Asumiendo rol por defecto para la app móvil
              rut: null,
              s_nombre: null,
              apellido_m: null,
              push_token: null
            };
            await supabase.from('usuarios').insert(newUser as any);
          }
        }

        if (data.session) {
          setSession(data.session);
          router.replace('/');
        } else {
          Alert.alert('Registro exitoso', 'Por favor verifica tu correo electrónico para poder entrar.');
          setIsLogin(true);
        }
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogin = () => {
    const mockSession = {
      access_token: 'test_token',
      refresh_token: 'test_token',
      expires_in: 3600,
      token_type: 'bearer',
      user: {
        id: 'test-user-123',
        aud: 'authenticated',
        role: 'authenticated',
        email: 'alumno.prueba@duocuc.cl',
        app_metadata: { provider: 'email' },
        user_metadata: { full_name: 'Martin Perez' }, // Nombre por defecto o Alumno de Prueba
        created_at: new Date().toISOString(),
      }
    };
    setSession(mockSession as any);
    router.replace('/(tabs)');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      {/* Background Blobs - Paleta Oficial Duoc UC Invertida (Balanceada) */}
      <View style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden' }}>
        <Animated.View style={[b1Style, { position: 'absolute', top: -150, left: -150, width: 500, height: 500, borderRadius: 250, backgroundColor: '#FFCC4D', opacity: 0.35 }]} />
        <Animated.View style={[b2Style, { position: 'absolute', top: '15%', right: -150, width: 450, height: 450, borderRadius: 225, backgroundColor: '#8FBFE0', opacity: 0.32 }]} />
        <Animated.View style={[b3Style, { position: 'absolute', bottom: -200, left: -100, width: 600, height: 600, borderRadius: 300, backgroundColor: '#FFCC4D', opacity: 0.35, shadowColor: '#FFC300', shadowOpacity: 0.1, shadowRadius: 30 }]} />
        {/* Cuarto blob azul oscuro sutil para contraste */}
        <Animated.View style={[b1Style, { position: 'absolute', bottom: -100, right: -100, width: 250, height: 250, borderRadius: 125, backgroundColor: '#8FBFE0', opacity: 0.32 }]} />
      </View>

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 }}>

            <View style={{ alignItems: 'center', marginBottom: 40, marginTop: 40 }}>
              {/* Badge Duoc UC - Color Institucional Translucido */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,61,122,0.08)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginBottom: 16 }}>
                <Image
                  source={require('../../assets/images/Logo_DuocUC.png')}
                  style={{ height: 16, width: 60, resizeMode: 'contain', marginRight: 10 }}
                />
                <Text style={{ fontSize: 11, fontFamily: 'Inter-SemiBold', color: '#003D7A', textTransform: 'uppercase', letterSpacing: 0.5 }}>San Joaquín</Text>
              </View>

              <Text style={{ color: '#1A1A1A', fontSize: 48, fontFamily: 'Inter-Bold', lineHeight: 48, marginBottom: 8 }}>Skip SJ</Text>
              <Text style={{ color: 'rgba(26,26,26,0.6)', fontSize: 16, fontFamily: 'Inter-Regular' }}>Sin filas. Sin espera.</Text>
            </View>

            {/* Glass Card */}
            <Animated.View
              entering={FadeInUp.duration(500).springify()}
              style={{
                borderRadius: 24,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.7)',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.08,
                shadowRadius: 24,
              }}
            >
              <BlurView intensity={40} tint="light" style={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 36 }}>
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255, 255, 255, 0.25)' }} />

                {/* Título de estado */}
                <View style={{ alignItems: 'center', marginBottom: 24 }}>
                  <Text style={{ fontSize: 18, fontFamily: 'Inter-SemiBold', color: '#1A1A1A' }}>
                    {isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
                  </Text>
                </View>

                {/* Form Container */}
                <Animated.View layout={LinearTransition}>
                  {!isLogin && (
                    <GlassInput
                      placeholder="Nombre completo"
                      value={fullName}
                      onChangeText={setFullName}
                      icon={<User color="rgba(0, 50, 90, 0.5)" size={20} />}
                    />
                  )}

                  <GlassInput
                    placeholder="Correo institucional"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    error={emailError}
                    icon={<Mail color="rgba(0, 50, 90, 0.5)" size={20} />}
                  />

                  <GlassInput
                    placeholder="Contraseña"
                    value={password}
                    onChangeText={setPassword}
                    isPassword
                    error={passwordError}
                    icon={<Lock color="rgba(0, 50, 90, 0.5)" size={20} />}
                  />

                  {!isLogin && (
                    <GlassInput
                      placeholder="Confirmar Contraseña"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      isPassword
                      icon={<Lock color="rgba(0, 50, 90, 0.5)" size={20} />}
                    />
                  )}

                  {isLogin && (
                    <TouchableOpacity style={{ alignSelf: 'flex-end', marginBottom: 16 }}>
                      <Text style={{ color: '#0056A3', fontSize: 14, fontFamily: 'Inter-SemiBold' }}>¿Olvidaste tu contraseña?</Text>
                    </TouchableOpacity>
                  )}
                </Animated.View>

                <View style={{ marginBottom: 24 }}>
                  <GradientButton
                    title={isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                    onPress={handleAuth}
                    loading={loading}
                  />

                  {/* Para producción esto se quitaría, pero lo dejamos por si necesitas bypass rápido */}
                  {/* <TouchableOpacity onPress={handleTestLogin} style={{ marginTop: 20, alignItems: 'center', padding: 8 }}>
                    <Text style={{ color: '#0056A3', fontSize: 13, fontFamily: 'Inter-SemiBold', textDecorationLine: 'underline' }}>
                      O continuar con Usuario de Prueba
                    </Text>
                  </TouchableOpacity> */}
                </View>

                {/* Switch Form Link */}
                <TouchableOpacity onPress={toggleAuthMode} style={{ alignItems: 'center' }}>
                  <Text style={{ color: 'rgba(26,26,26,0.6)', fontSize: 14, fontFamily: 'Inter-Regular' }}>
                    {isLogin ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
                    <Text style={{ color: '#0056A3', fontFamily: 'Inter-Bold' }}>
                      {isLogin ? "Regístrate" : "Inicia sesión"}
                    </Text>
                  </Text>
                </TouchableOpacity>

              </BlurView>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
