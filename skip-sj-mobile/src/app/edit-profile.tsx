import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Save, Camera } from 'lucide-react-native';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, profile, fetchProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    apodo: '',
    avatar_url: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        apodo: profile.apodo || '', 
        avatar_url: profile.avatar_url || '',
      });
    }
  }, [profile]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      if (user.id === 'mock-uuid-1234') {
        useAuthStore.setState((state) => ({
          profile: {
            ...(state.profile || {}),
            apodo: formData.apodo.trim() || null,
            avatar_url: formData.avatar_url || null,
          } as any
        }));
      } else {
        const { data, error } = await supabase
          .from('usuarios')
          .upsert({
            id: user.id,
            email: user.email,
            apodo: formData.apodo.trim() || null,
            avatar_url: formData.avatar_url || null,
            rol: profile?.rol || 'alumno',
            ...(profile ? {} : {
               p_nombre: user.user_metadata?.full_name?.split(' ')[0] || null,
            })
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

        useAuthStore.setState((state) => ({
          profile: data || {
            ...(state.profile || {}),
            apodo: formData.apodo.trim() || null,
            avatar_url: formData.avatar_url || null,
          } as any
        }));
        await fetchProfile();
      }

      Alert.alert('Éxito', 'Perfil actualizado correctamente');
      router.back();
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.message || 'No se pudo actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePhoto = () => {
    Alert.alert('Próximamente', 'Para subir fotos necesitamos instalar expo-image-picker.');
  };

  // Nombres institucionales fijos
  const fullName = `${profile?.p_nombre || ''} ${profile?.apellido_p || ''}`.trim();
  const initials = fullName ? fullName.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() : 'DU';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(17,17,17,0.05)', backgroundColor: '#FFFFFF' }}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 8, marginLeft: -8 }}>
            <X color="#111111" size={24} />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontFamily: 'Inter-Bold', color: '#111111' }}>Editar Perfil</Text>
          <TouchableOpacity onPress={handleSave} disabled={loading} style={{ padding: 8, marginRight: -8, opacity: loading ? 0.5 : 1 }}>
            {loading ? <ActivityIndicator size="small" color="#F2A900" /> : <Save color="#F2A900" size={24} />}
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
          
          {/* Foto de Perfil */}
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <View style={{ position: 'relative' }}>
              <View style={{ 
                width: 120, 
                height: 120, 
                borderRadius: 60, 
                backgroundColor: '#111111', 
                justifyContent: 'center', 
                alignItems: 'center',
                shadowColor: '#111111',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.15,
                shadowRadius: 16,
                elevation: 4
              }}>
                <Text style={{ color: '#F2A900', fontSize: 40, fontFamily: 'Inter-Bold' }}>{initials}</Text>
              </View>
              <TouchableOpacity 
                onPress={handleSimulatePhoto}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: '#F2A900',
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 3,
                  borderColor: '#FAFAFA'
                }}
              >
                <Camera color="#111111" size={18} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ gap: 20 }}>
            {/* Apodo Editable */}
            <View>
              <Text style={{ fontSize: 13, fontFamily: 'Inter-SemiBold', color: '#111111', marginBottom: 8 }}>Apodo</Text>
              <TextInput
                value={formData.apodo}
                onChangeText={(val) => handleChange('apodo', val)}
                placeholder="¿Cómo te gustaría que te llamemos?"
                style={{ backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(17,17,17,0.1)', fontSize: 15, fontFamily: 'Inter-Regular', color: '#111111' }}
              />
              <Text style={{ fontSize: 11, fontFamily: 'Inter-Regular', color: 'rgba(17,17,17,0.5)', marginTop: 6 }}>
                Este nombre será visible para los locatarios.
              </Text>
            </View>

            {/* Datos Institucionales Fijos */}
            <View style={{ marginTop: 16 }}>
              <Text style={{ fontSize: 15, fontFamily: 'Inter-Bold', color: '#111111', marginBottom: 16 }}>Datos Institucionales</Text>
              
              <View style={{ gap: 16 }}>
                <View>
                  <Text style={{ fontSize: 13, fontFamily: 'Inter-SemiBold', color: 'rgba(17,17,17,0.5)', marginBottom: 8 }}>Nombre Completo</Text>
                  <TextInput
                    value={fullName || 'No registrado'}
                    editable={false}
                    style={{ backgroundColor: 'rgba(17,17,17,0.03)', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(17,17,17,0.05)', fontSize: 15, fontFamily: 'Inter-Regular', color: 'rgba(17,17,17,0.5)' }}
                  />
                </View>

                <View>
                  <Text style={{ fontSize: 13, fontFamily: 'Inter-SemiBold', color: 'rgba(17,17,17,0.5)', marginBottom: 8 }}>Correo Institucional</Text>
                  <TextInput
                    value={profile?.email || ''}
                    editable={false}
                    style={{ backgroundColor: 'rgba(17,17,17,0.03)', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(17,17,17,0.05)', fontSize: 15, fontFamily: 'Inter-Regular', color: 'rgba(17,17,17,0.5)' }}
                  />
                </View>

                <View>
                  <Text style={{ fontSize: 13, fontFamily: 'Inter-SemiBold', color: 'rgba(17,17,17,0.5)', marginBottom: 8 }}>RUT</Text>
                  <TextInput
                    value={profile?.rut || 'No registrado'}
                    editable={false}
                    style={{ backgroundColor: 'rgba(17,17,17,0.03)', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(17,17,17,0.05)', fontSize: 15, fontFamily: 'Inter-Regular', color: 'rgba(17,17,17,0.5)' }}
                  />
                </View>
              </View>
            </View>
          </View>
          
          <TouchableOpacity 
            onPress={handleSave}
            disabled={loading}
            style={{ 
              marginTop: 32,
              backgroundColor: '#111111',
              paddingVertical: 16,
              borderRadius: 16,
              alignItems: 'center',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? (
              <ActivityIndicator color="#F2A900" />
            ) : (
              <Text style={{ color: '#F2A900', fontFamily: 'Inter-Bold', fontSize: 16 }}>Guardar Cambios</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
