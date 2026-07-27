import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Mail, Lock, User } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { useAnimatedStyle, withTiming, useSharedValue } from 'react-native-reanimated';

import { GlassInput } from '../components/GlassInput';
import { GradientButton } from '../components/GradientButton';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export default function AuthScreen() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  // Errors
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Animación suave de altura para el cambio de tab
  const formHeight = useSharedValue(isLogin ? 250 : 400);

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    formHeight.value = withTiming(!isLogin ? 250 : 400, { duration: 300 });
    // Reset errors
    setEmailError('');
    setPasswordError('');
  };

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      minHeight: formHeight.value,
    };
  });

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
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        setSession(data.session);
        router.replace('/'); // Redirige al index tras loguear
        
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
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
    <View className="flex-1 bg-[#FAFAFA]">
      {/* Background Glass Blobs */}
      <View className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-emerald-400/30 blur-3xl" />
      <View className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-purple-300/30 blur-3xl" />
      <View className="absolute -bottom-32 left-10 w-96 h-96 rounded-full bg-sky-300/30 blur-3xl" />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
          
          <View className="items-center mb-10">
            <Text className="text-[#1A1A1A] text-5xl font-[Inter-Bold] tracking-tight mb-2">Skip SJ</Text>
            <Text className="text-[#1A1A1A]/60 text-base font-[Inter-Regular]">Sin filas. Sin espera.</Text>
          </View>

          {/* Glass Card */}
          <View className="rounded-[24px] overflow-hidden border border-white/60" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 15 }, shadowOpacity: 0.1, shadowRadius: 30 }}>
            <BlurView intensity={40} tint="light" className="p-6 bg-white/55">
              
              {/* Toggles */}
              <View className="flex-row mb-8 bg-black/5 rounded-2xl p-1">
                <TouchableOpacity 
                  onPress={() => !isLogin && toggleAuthMode()}
                  className={`flex-1 py-3 items-center rounded-xl ${isLogin ? 'bg-white/70 shadow-sm' : ''}`}
                >
                  <Text className={`font-[Inter-SemiBold] ${isLogin ? 'text-[#1A1A1A]' : 'text-[#1A1A1A]/50'}`}>Ingresar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => isLogin && toggleAuthMode()}
                  className={`flex-1 py-3 items-center rounded-xl ${!isLogin ? 'bg-white/70 shadow-sm' : ''}`}
                >
                  <Text className={`font-[Inter-SemiBold] ${!isLogin ? 'text-[#1A1A1A]' : 'text-[#1A1A1A]/50'}`}>Registro</Text>
                </TouchableOpacity>
              </View>

              {/* Form Container */}
              <Animated.View style={animatedContainerStyle}>
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
                  <TouchableOpacity className="self-end mb-4">
                    <Text className="text-[#2ECC71] text-sm font-[Inter-SemiBold]">¿Olvidaste tu contraseña?</Text>
                  </TouchableOpacity>
                )}
              </Animated.View>

              <GradientButton 
                title={isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'} 
                onPress={handleAuth}
                loading={loading}
              />

            </BlurView>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
