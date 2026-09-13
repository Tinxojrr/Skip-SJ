import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Heart, ShoppingCart } from 'lucide-react-native';

const MOCK_FAVORITES = [
  {
    id: 'f1',
    nombre: 'Menú Junaeb Tradicional',
    local: 'Casino Duoc',
    precio: 2500,
    imagen: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=300&auto=format&fit=crop'
  },
  {
    id: 'f2',
    nombre: 'Café Latte Grande',
    local: 'Cafetería Central',
    precio: 2200,
    imagen: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=300&auto=format&fit=crop'
  },
  {
    id: 'f3',
    nombre: 'Sándwich Ave Palta',
    local: 'El Bajón Estudiantil',
    precio: 3500,
    imagen: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=300&auto=format&fit=crop'
  }
];

export default function FavoritesScreen() {
  const router = useRouter();
  const [favorites, setFavorites] = useState(MOCK_FAVORITES);

  const toggleFavorite = (id: string) => {
    // Para el mockup, simplemente lo removemos de la lista visual
    setFavorites(prev => prev.filter(item => item.id !== id));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: 'rgba(17,17,17,0.05)' }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8, marginLeft: -8 }}>
          <ArrowLeft color="#111111" size={24} />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontFamily: 'Inter-Bold', color: '#111111', marginLeft: 12 }}>Mis Favoritos</Text>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }}>
        {favorites.map((item) => (
          <View 
            key={item.id} 
            style={{
              flexDirection: 'row',
              backgroundColor: '#FFFFFF',
              borderRadius: 20,
              padding: 12,
              borderWidth: 1,
              borderColor: 'rgba(17,17,17,0.05)',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.03,
              shadowRadius: 8,
              elevation: 1,
              alignItems: 'center'
            }}
          >
            {/* Imagen */}
            <Image 
              source={{ uri: item.imagen }} 
              style={{ width: 80, height: 80, borderRadius: 16 }} 
              resizeMode="cover"
            />

            {/* Info */}
            <View style={{ flex: 1, marginLeft: 16, justifyContent: 'space-between', height: 80, paddingVertical: 2 }}>
              <View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Text style={{ fontFamily: 'Inter-Bold', fontSize: 15, color: '#111111', flex: 1, marginRight: 8 }} numberOfLines={2}>
                    {item.nombre}
                  </Text>
                  <TouchableOpacity onPress={() => toggleFavorite(item.id)} style={{ padding: 4, marginRight: -4, marginTop: -4 }}>
                    <Heart color="#E53E3E" fill="#E53E3E" size={20} />
                  </TouchableOpacity>
                </View>
                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 13, color: 'rgba(17,17,17,0.5)', marginTop: 2 }}>
                  {item.local}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontFamily: 'Inter-Bold', fontSize: 15, color: '#F2A900' }}>
                  ${item.precio.toLocaleString('es-CL')}
                </Text>
                
                <TouchableOpacity style={{ backgroundColor: '#111111', width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' }}>
                  <ShoppingCart color="#FFFFFF" size={16} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        {favorites.length === 0 && (
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Heart color="rgba(17,17,17,0.2)" size={48} />
            <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 16, color: 'rgba(17,17,17,0.5)', marginTop: 16 }}>
              Aún no tienes favoritos
            </Text>
            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: 'rgba(17,17,17,0.4)', marginTop: 8, textAlign: 'center' }}>
              Guarda los productos que más te gustan para pedirlos más rápido.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

