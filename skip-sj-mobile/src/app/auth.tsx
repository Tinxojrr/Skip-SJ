import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert, LayoutAnimation, UIManager } from 'react-native';
import { BlurView } from 'expo-blur';
import { Mail, Lock, User } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp, LinearTransition } from 'react-native-reanimated';

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
        
        if (data.session) {
          setSession(data.session);
          router.replace('/');
        } else {
          Alert.alert('Registro exitoso', 'Por favor verifica tu correo electrónico.');
          setIsLogin(true);
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Ha ocurrido un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      {/* Background Blobs */}
      <View style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden', zIndex: -10 }}>
        <View style={{ position: 'absolute', top: -150, left: -150, width: 500, height: 500, borderRadius: 250, backgroundColor: '#2ECC71', opacity: 0.2 }} />
        <View style={{ position: 'absolute', top: '20%', right: -200, width: 400, height: 400, borderRadius: 200, backgroundColor: '#c084fc', opacity: 0.2 }} />
        <View style={{ position: 'absolute', bottom: -200, left: -100, width: 600, height: 600, borderRadius: 300, backgroundColor: '#7dd3fc', opacity: 0.2 }} />
      </View>

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 }}>
            
            <View style={{ alignItems: 'center', marginBottom: 40 }}>
              <Text style={{ color: '#1A1A1A', fontSize: 48, fontFamily: 'Inter-Bold', marginBottom: 8 }}>Skip SJ</Text>
              <Text style={{ color: 'rgba(26,26,26,0.6)', fontSize: 16, fontFamily: 'Inter-Regular' }}>Sin filas. Sin espera.</Text>
            </View>

            {/* Glass Card */}
            <Animated.View 
              entering={FadeInUp.duration(500).springify()} 
              style={{ 
                borderRadius: 24, 
                overflow: 'hidden', 
                borderWidth: 1, 
                borderColor: 'rgba(255, 255, 255, 0.6)', 
                shadowColor: '#000', 
                shadowOffset: { width: 0, height: 8 }, 
                shadowOpacity: 0.08, 
                shadowRadius: 24,
                elevation: 10
              }}
            >
              <BlurView intensity={40} tint="light" style={{ padding: 24 }}>
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255, 255, 255, 0.4)' }} />
                
                {/* Toggles */}
                <View style={{ flexDirection: 'row', marginBottom: 32, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 16, padding: 4 }}>
                  <TouchableOpacity 
                    onPress={() => !isLogin && toggleAuthMode()}
                    style={[
                      { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
                      isLogin ? { backgroundColor: 'rgba(255,255,255,0.7)', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 } : {}
                    ]}
                  >
                    <Text style={{ fontFamily: 'Inter-SemiBold', color: isLogin ? '#1A1A1A' : 'rgba(26,26,26,0.5)' }}>Ingresar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => isLogin && toggleAuthMode()}
                    style={[
                      { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
                      !isLogin ? { backgroundColor: 'rgba(255,255,255,0.7)', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 } : {}
                    ]}
                  >
                    <Text style={{ fontFamily: 'Inter-SemiBold', color: !isLogin ? '#1A1A1A' : 'rgba(26,26,26,0.5)' }}>Registro</Text>
                  </TouchableOpacity>
                </View>

                {/* Form Container */}
                <Animated.View layout={LinearTransition}>
                  {!isLogin && (
                    <GlassInput 
                      placeholder="Nombre completo"
                      value={fullName}
                      onChangeText={setFullName}
                      icon={<User color="#6b7280" size={20} />}
                    />
                  )}
                  
                  <GlassInput 
                    placeholder="Correo institucional"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    error={emailError}
                    icon={<Mail color="#6b7280" size={20} />}
                  />

                  <GlassInput 
                    placeholder="Contraseña"
                    value={password}
                    onChangeText={setPassword}
                    isPassword
                    error={passwordError}
                    icon={<Lock color="#6b7280" size={20} />}
                  />

                  {!isLogin && (
                    <GlassInput 
                      placeholder="Confirmar Contraseña"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      isPassword
                      icon={<Lock color="#6b7280" size={20} />}
                    />
                  )}

                  {isLogin && (
                    <TouchableOpacity style={{ alignSelf: 'flex-end', marginBottom: 16 }}>
                      <Text style={{ color: '#2ECC71', fontSize: 14, fontFamily: 'Inter-SemiBold' }}>¿Olvidaste tu contraseña?</Text>
                    </TouchableOpacity>
                  )}
                </Animated.View>

                <GradientButton 
                  title={isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'} 
                  onPress={handleAuth}
                  loading={loading}
                />

              </BlurView>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
