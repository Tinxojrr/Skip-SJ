import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Heart, ShoppingCart, Trash2, Store } from 'lucide-react-native';
import { useFavoritesStore, FavoriteItem } from '../store/favoritesStore';
import { useThemeStore } from '../store/themeStore';
import { getProductImage } from '../utils/productImages';
import { useCartStore } from '../store/cartStore';

export default function FavoritesScreen() {
  const router = useRouter();
  const { favorites, toggleFavorite } = useFavoritesStore();
  const { addItem } = useCartStore();
  const { isDarkMode } = useThemeStore();

  const bg = isDarkMode ? '#09090B' : '#FAFAFA';
  const cardBg = isDarkMode ? '#18181B' : '#FFFFFF';
  const cardAlt = isDarkMode ? '#27272A' : '#F8FAFC';
  const textPrimary = isDarkMode ? '#F4F4F5' : '#111111';
  const textSecondary = isDarkMode ? '#A1A1AA' : 'rgba(17,17,17,0.5)';
  const borderColor = isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(17,17,17,0.05)';

  const handleAddToCart = (item: FavoriteItem) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      storeName: item.storeName
    });
    Alert.alert("¡Agregado al Carrito!", `${item.name} fue añadido a tu pedido.`);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      {/* Header */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        paddingHorizontal: 20, 
        paddingVertical: 16, 
        backgroundColor: cardBg, 
        borderBottomWidth: 1, 
        borderBottomColor: borderColor 
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 6, marginLeft: -6 }}>
            <ArrowLeft color={textPrimary} size={24} />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontFamily: 'Inter-Bold', color: textPrimary, marginLeft: 10 }}>
            Mis Favoritos
          </Text>
        </View>
        <View style={{ backgroundColor: 'rgba(239,68,68,0.12)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
          <Text style={{ fontFamily: 'Inter-Bold', fontSize: 12, color: '#EF4444' }}>
            {favorites.length} {favorites.length === 1 ? 'guardado' : 'guardados'}
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }} showsVerticalScrollIndicator={false}>
        {favorites.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            activeOpacity={0.85}
            onPress={() => {
              router.push(('/product/' + item.id) as any);
            }}
            style={{
              flexDirection: 'row',
              backgroundColor: cardBg,
              borderRadius: 20,
              padding: 14,
              borderWidth: 1,
              borderColor: borderColor,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isDarkMode ? 0.25 : 0.03,
              shadowRadius: 8,
              elevation: 2,
              alignItems: 'center'
            }}
          >
            {/* Imagen */}
            <View style={{ width: 76, height: 76, borderRadius: 16, backgroundColor: cardAlt, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
              {getProductImage({ nombre_producto: item.name, imagen_url: item.imageUrl }) ? (
                <Image 
                  source={{ uri: getProductImage({ nombre_producto: item.name, imagen_url: item.imageUrl })! }} 
                  style={{ width: '100%', height: '100%' }} 
                  resizeMode="cover"
                />
              ) : (
                <Text style={{ fontSize: 32 }}>{item.emoji || '🍔'}</Text>
              )}
            </View>

            {/* Info */}
            <View style={{ flex: 1, marginLeft: 14, justifyContent: 'space-between', minHeight: 76, paddingVertical: 2 }}>
              <View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Text style={{ fontFamily: 'Inter-Bold', fontSize: 15, color: textPrimary, flex: 1, marginRight: 8 }} numberOfLines={2}>
                    {item.name}
                  </Text>
                  
                  {/* Botón Corazón para Desmarcar */}
                  <TouchableOpacity 
                    onPress={() => toggleFavorite(item)} 
                    style={{ padding: 4, marginRight: -4, marginTop: -4 }}
                  >
                    <Heart color="#EF4444" fill="#EF4444" size={20} />
                  </TouchableOpacity>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
                  <Store size={12} color={textSecondary} style={{ marginRight: 4 }} />
                  <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: textSecondary }}>
                    {item.storeName}
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <Text style={{ fontFamily: 'Inter-Bold', fontSize: 15, color: isDarkMode ? '#F2A900' : '#003D7A' }}>
                  ${item.price.toLocaleString('es-CL')}
                </Text>
                
                <TouchableOpacity 
                  onPress={() => handleAddToCart(item)}
                  style={{ 
                    backgroundColor: isDarkMode ? '#27272A' : '#111111', 
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 12, 
                    paddingVertical: 7, 
                    borderRadius: 12,
                    gap: 6
                  }}
                >
                  <ShoppingCart color="#F2A900" size={14} />
                  <Text style={{ color: '#FFFFFF', fontFamily: 'Inter-Bold', fontSize: 12 }}>Pedir</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {favorites.length === 0 && (
          <View style={{ alignItems: 'center', marginTop: 80, paddingHorizontal: 32 }}>
            <View style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: 'rgba(239,68,68,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
              <Heart color="#EF4444" size={40} opacity={0.7} />
            </View>
            <Text style={{ fontFamily: 'Inter-Bold', fontSize: 18, color: textPrimary, marginBottom: 8, textAlign: 'center' }}>
              Tu lista de favoritos está vacía
            </Text>
            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 24 }}>
              Toca el corazón en cualquier producto del menú para guardarlo aquí y pedirlo en un solo toque en tu próximo recreo.
            </Text>
            <TouchableOpacity 
              onPress={() => router.push('/')}
              style={{ backgroundColor: isDarkMode ? '#F2A900' : '#003D7A', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 14 }}
            >
              <Text style={{ color: isDarkMode ? '#111111' : '#FFFFFF', fontFamily: 'Inter-Bold', fontSize: 14 }}>Explorar el Menú</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
