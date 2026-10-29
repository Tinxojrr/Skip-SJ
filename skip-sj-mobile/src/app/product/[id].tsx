import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Minus, Plus, ShoppingBag, Heart } from 'lucide-react-native';
import { useFavoritesStore } from '../../store/favoritesStore';
import { useThemeStore } from '../../store/themeStore';
import { supabase } from '../../lib/supabase';
import { useCartStore } from '../../store/cartStore';
import { getProductImage } from '../../utils/productImages';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { addItem } = useCartStore();
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const { isDarkMode } = useThemeStore();

  const bg = isDarkMode ? '#09090B' : '#FAFAFA';
  const cardBg = isDarkMode ? '#18181B' : '#FFFFFF';
  const cardAlt = isDarkMode ? '#27272A' : '#F4F4F5';
  const textPrimary = isDarkMode ? '#F4F4F5' : '#111111';
  const textSecondary = isDarkMode ? '#A1A1AA' : 'rgba(17,17,17,0.6)';
  const borderColor = isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(17,17,17,0.05)';

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!id) return;
    
    const fetchProduct = async () => {
      try {
        const { data, error } = await supabase
          .from('productos')
          .select(`
            *,
            locatarios ( nombre ),
            categorias_menu ( nombre )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        setProduct(data);
      } catch (error) {
        console.error("Error al cargar producto:", error);
        Alert.alert('Error', 'No pudimos cargar la información de este producto.');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    
    addItem({
      id: product.id,
      name: product.nombre_producto,
      price: product.precio,
      quantity: quantity,
      storeId: product.locatario_id,
      storeName: product.locatarios?.nombre || 'Local',
      notes: notes.trim()
    });
    
    router.back();
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: bg }}>
        <ActivityIndicator size="large" color="#F2A900" />
      </View>
    );
  }

  if (!product) return null;

  const favorited = isFavorite(product.id);

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 130 }} bounces={false} showsVerticalScrollIndicator={false}>
          {/* Header Image */}
          <View style={{ width: '100%', height: 300, backgroundColor: isDarkMode ? '#18181B' : 'rgba(17,17,17,0.05)', position: 'relative' }}>
            {getProductImage(product) ? (
              <Image source={{ uri: getProductImage(product)! }} style={{ width: '100%', height: '100%' }} />
            ) : (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                 <Text style={{ fontSize: 64 }}>🍽️</Text>
              </View>
            )}

            {/* Back Button Overlay */}
            <TouchableOpacity 
              onPress={() => router.back()}
              style={{ 
                position: 'absolute', 
                top: 48, 
                left: 24, 
                width: 44, 
                height: 44, 
                borderRadius: 22, 
                backgroundColor: isDarkMode ? 'rgba(24,24,27,0.92)' : 'rgba(255,255,255,0.92)', 
                justifyContent: 'center', 
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 4
              }}
            >
              <ArrowLeft color={textPrimary} size={22} />
            </TouchableOpacity>

            {/* Favorite Button Overlay */}
            <TouchableOpacity 
              onPress={() => {
                toggleFavorite({
                  id: product.id,
                  name: product.nombre_producto,
                  price: product.precio,
                  storeName: product.locatarios?.nombre || 'Local',
                  imageUrl: getProductImage(product) || product.imagen_url,
                  emoji: product.emoji
                });
              }}
              style={{ 
                position: 'absolute', 
                top: 48, 
                right: 24, 
                width: 44, 
                height: 44, 
                borderRadius: 22, 
                backgroundColor: isDarkMode ? 'rgba(24,24,27,0.92)' : 'rgba(255,255,255,0.92)', 
                justifyContent: 'center', 
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 4
              }}
            >
              <Heart 
                color={favorited ? '#EF4444' : textSecondary} 
                fill={favorited ? '#EF4444' : 'transparent'} 
                size={22} 
              />
            </TouchableOpacity>
          </View>

          {/* Details Section */}
          <View style={{ 
            padding: 24, 
            backgroundColor: cardBg, 
            borderTopLeftRadius: 32, 
            borderTopRightRadius: 32, 
            marginTop: -32, 
            shadowColor: '#000', 
            shadowOffset: { width: 0, height: -4 }, 
            shadowOpacity: isDarkMode ? 0.3 : 0.05, 
            shadowRadius: 16 
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ backgroundColor: isDarkMode ? 'rgba(242,169,0,0.18)' : 'rgba(242,169,0,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                <Text style={{ color: '#F2A900', fontFamily: 'Inter-SemiBold', fontSize: 12, textTransform: 'uppercase' }}>
                  {product.locatarios?.nombre}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <Text style={{ flex: 1, fontSize: 26, fontFamily: 'Inter-Bold', color: textPrimary, lineHeight: 32 }}>
                {product.nombre_producto}
              </Text>
              <Text style={{ fontSize: 24, fontFamily: 'Inter-Bold', color: isDarkMode ? '#F2A900' : '#003D7A', marginLeft: 16 }}>
                ${product.precio.toLocaleString('es-CL')}
              </Text>
            </View>

            {product.descripcion ? (
              <Text style={{ fontSize: 15, fontFamily: 'Inter-Regular', color: textSecondary, lineHeight: 24, marginBottom: 32 }}>
                {product.descripcion}
              </Text>
            ) : null}

            {/* Separator */}
            <View style={{ height: 1, backgroundColor: borderColor, marginBottom: 24 }} />

            {/* Special Instructions */}
            <Text style={{ fontSize: 16, fontFamily: 'Inter-Bold', color: textPrimary, marginBottom: 12 }}>
              Instrucciones especiales
            </Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Ej: Sin mayonesa, papas bien doradas..."
              placeholderTextColor={textSecondary}
              multiline
              numberOfLines={3}
              style={{
                backgroundColor: cardAlt,
                borderWidth: 1,
                borderColor: borderColor,
                borderRadius: 16,
                padding: 16,
                fontSize: 15,
                fontFamily: 'Inter-Regular',
                color: textPrimary,
                height: 100,
                textAlignVertical: 'top'
              }}
            />
          </View>
        </ScrollView>

        {/* Floating Add to Cart Bar */}
        <View style={{ 
          position: 'absolute', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          backgroundColor: bg, 
          paddingHorizontal: 24, 
          paddingTop: 16, 
          paddingBottom: 32, 
          borderTopWidth: 1, 
          borderTopColor: borderColor,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Quantity Controls */}
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: cardAlt, borderRadius: 16, overflow: 'hidden' }}>
            <TouchableOpacity 
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              style={{ padding: 14 }}
            >
              <Minus color={textPrimary} size={20} />
            </TouchableOpacity>
            
            <Text style={{ fontFamily: 'Inter-Bold', fontSize: 16, color: textPrimary, minWidth: 24, textAlign: 'center' }}>
              {quantity}
            </Text>
            
            <TouchableOpacity 
              onPress={() => setQuantity(quantity + 1)}
              style={{ padding: 14 }}
            >
              <Plus color={textPrimary} size={20} />
            </TouchableOpacity>
          </View>

          {/* Add Button */}
          <TouchableOpacity 
            onPress={handleAddToCart}
            style={{ 
              flex: 1,
              marginLeft: 16,
              backgroundColor: '#FFBF00', 
              borderRadius: 16, 
              paddingVertical: 18, 
              flexDirection: 'row', 
              justifyContent: 'center', 
              alignItems: 'center', 
              shadowColor: '#FFBF00',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 12,
              elevation: 4
            }}
          >
            <ShoppingBag color="#111111" size={20} style={{ marginRight: 8 }} />
            <Text style={{ color: '#111111', fontFamily: 'Inter-Bold', fontSize: 16 }}>
              Agregar ${(product.precio * quantity).toLocaleString('es-CL')}
            </Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </View>
  );
}
