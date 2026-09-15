import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, MessageCircle, Mail, FileWarning, ChevronRight, HelpCircle, FileText } from 'lucide-react-native';

export default function SupportScreen() {
  const router = useRouter();

  const handleSimulateAction = (title: string) => {
    Alert.alert(title, "Abriendo enlace...");
  };

  const handleWhatsApp = () => {
    Alert.alert("WhatsApp", "Simulando abrir WhatsApp con el soporte de Skip SJ.");
  };

  const handleEmail = () => {
    Alert.alert("Correo Electrónico", "Simulando abrir tu app de correo para escribir a soporte@skipsj.duoc.cl");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: 'rgba(17,17,17,0.05)' }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8, marginLeft: -8 }}>
          <ArrowLeft color="#111111" size={24} />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontFamily: 'Inter-Bold', color: '#111111', marginLeft: 12 }}>Soporte y Ayuda</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24 }}>
        
        <View style={{ alignItems: 'center', marginVertical: 24 }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(242, 169, 0, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
            <HelpCircle color="#F2A900" size={40} />
          </View>
          <Text style={{ fontFamily: 'Inter-Bold', fontSize: 20, color: '#111111', marginBottom: 8 }}>¿En qué te podemos ayudar?</Text>
          <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: 'rgba(17,17,17,0.5)', textAlign: 'center', paddingHorizontal: 20 }}>
            Nuestro equipo está disponible para resolver tus dudas y problemas con tus pedidos.
          </Text>
        </View>

        {/* Sección: Contacto Rápido */}
        <Text style={{ fontSize: 13, fontFamily: 'Inter-Bold', color: 'rgba(17,17,17,0.4)', textTransform: 'uppercase', marginBottom: 12 }}>Contacto Rápido</Text>
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, paddingHorizontal: 16, borderWidth: 1, borderColor: 'rgba(17,17,17,0.05)', marginBottom: 32 }}>
          
          <TouchableOpacity 
            onPress={handleWhatsApp}
            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(17,17,17,0.05)' }}
          >
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(37, 211, 102, 0.1)', justifyContent: 'center', alignItems: 'center' }}>
              <MessageCircle color="#25D366" size={18} />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 15, color: '#111111' }}>Chat por WhatsApp</Text>
              <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: 'rgba(17,17,17,0.5)', marginTop: 2 }}>Respuesta en menos de 5 min</Text>
            </View>
            <ChevronRight color="rgba(17,17,17,0.2)" size={20} />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleEmail}
            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16 }}
          >
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(17,17,17,0.05)', justifyContent: 'center', alignItems: 'center' }}>
              <Mail color="#111111" size={18} />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 15, color: '#111111' }}>Correo Institucional</Text>
              <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: 'rgba(17,17,17,0.5)', marginTop: 2 }}>soporte@skipsj.duoc.cl</Text>
            </View>
            <ChevronRight color="rgba(17,17,17,0.2)" size={20} />
          </TouchableOpacity>
        </View>

        {/* Sección: Recursos */}
        <Text style={{ fontSize: 13, fontFamily: 'Inter-Bold', color: 'rgba(17,17,17,0.4)', textTransform: 'uppercase', marginBottom: 12 }}>Recursos</Text>
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, paddingHorizontal: 16, borderWidth: 1, borderColor: 'rgba(17,17,17,0.05)', marginBottom: 32 }}>
          
          <TouchableOpacity 
            onPress={() => handleSimulateAction('Preguntas Frecuentes')}
            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(17,17,17,0.05)' }}
          >
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(17,17,17,0.05)', justifyContent: 'center', alignItems: 'center' }}>
              <HelpCircle color="#111111" size={18} />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 15, color: '#111111' }}>Preguntas Frecuentes</Text>
            </View>
            <ChevronRight color="rgba(17,17,17,0.2)" size={20} />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => handleSimulateAction('Términos y Condiciones')}
            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16 }}
          >
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(17,17,17,0.05)', justifyContent: 'center', alignItems: 'center' }}>
              <FileText color="#111111" size={18} />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 15, color: '#111111' }}>Términos y Condiciones</Text>
            </View>
            <ChevronRight color="rgba(17,17,17,0.2)" size={20} />
          </TouchableOpacity>
        </View>

        {/* Sección: Problemas */}
        <Text style={{ fontSize: 13, fontFamily: 'Inter-Bold', color: 'rgba(229, 62, 62, 0.6)', textTransform: 'uppercase', marginBottom: 12 }}>Inconvenientes</Text>
        <TouchableOpacity 
          onPress={() => handleSimulateAction('Reportar un problema')}
          style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            backgroundColor: '#FFFFFF',
            borderRadius: 16, 
            paddingVertical: 16, 
            paddingHorizontal: 16,
            borderWidth: 1, 
            borderColor: 'rgba(229, 62, 62, 0.2)' 
          }}
        >
          <FileWarning color="#E53E3E" size={20} />
          <Text style={{ fontFamily: 'Inter-Bold', fontSize: 15, color: '#E53E3E', marginLeft: 12, flex: 1 }}>Reportar un problema</Text>
          <ChevronRight color="rgba(229, 62, 62, 0.3)" size={20} />
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

