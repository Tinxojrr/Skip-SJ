import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Minus, Plus, ShoppingBag } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { useCartStore } from '../../store/cartStore';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { addItem } = useCartStore();

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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAFA' }}>
        <ActivityIndicator size="large" color="#F2A900" />
      </View>
    );
  }

  if (!product) return null;

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }} bounces={false} showsVerticalScrollIndicator={false}>
          {/* Header Image */}
          <View style={{ width: '100%', height: 300, backgroundColor: 'rgba(17,17,17,0.05)', position: 'relative' }}>
            {product.imagen_url ? (
              <Image source={{ uri: product.imagen_url }} style={{ width: '100%', height: '100%' }} />
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
                backgroundColor: 'rgba(255,255,255,0.9)', 
                justifyContent: 'center', 
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8
              }}
            >
              <ArrowLeft color="#111111" size={24} />
            </TouchableOpacity>
          </View>

          {/* Details Section */}
          <View style={{ padding: 24, backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, marginTop: -32, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.05, shadowRadius: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ backgroundColor: 'rgba(242,169,0,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                <Text style={{ color: '#F2A900', fontFamily: 'Inter-SemiBold', fontSize: 12, textTransform: 'uppercase' }}>
                  {product.locatarios?.nombre}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <Text style={{ flex: 1, fontSize: 26, fontFamily: 'Inter-Bold', color: '#111111', lineHeight: 32 }}>{product.nombre_producto}</Text>
              <Text style={{ fontSize: 24, fontFamily: 'Inter-Bold', color: '#003D7A', marginLeft: 16 }}>
                ${product.precio.toLocaleString('es-CL')}
              </Text>
            </View>

            {product.descripcion ? (
              <Text style={{ fontSize: 15, fontFamily: 'Inter-Regular', color: 'rgba(17,17,17,0.6)', lineHeight: 24, marginBottom: 32 }}>
                {product.descripcion}
              </Text>
            ) : null}

            {/* Separator */}
            <View style={{ height: 1, backgroundColor: 'rgba(17,17,17,0.05)', marginBottom: 24 }} />

            {/* Special Instructions */}
            <Text style={{ fontSize: 16, fontFamily: 'Inter-Bold', color: '#111111', marginBottom: 12 }}>Instrucciones especiales</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Ej: Sin mayonesa, papas bien doradas..."
              placeholderTextColor="rgba(17,17,17,0.3)"
              multiline
              numberOfLines={3}
              style={{
                backgroundColor: 'rgba(17,17,17,0.02)',
                borderWidth: 1,
                borderColor: 'rgba(17,17,17,0.05)',
                borderRadius: 16,
                padding: 16,
                fontSize: 15,
                fontFamily: 'Inter-Regular',
                color: '#111111',
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
          backgroundColor: '#FFFFFF', 
          paddingHorizontal: 24, 
          paddingTop: 16, 
          paddingBottom: 32, 
          borderTopWidth: 1, 
          borderTopColor: 'rgba(17,17,17,0.05)',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Quantity Controls */}
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 16, overflow: 'hidden' }}>
            <TouchableOpacity 
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              style={{ padding: 14 }}
            >
              <Minus color="#111111" size={20} />
            </TouchableOpacity>
            
            <Text style={{ fontFamily: 'Inter-Bold', fontSize: 16, color: '#111111', minWidth: 24, textAlign: 'center' }}>
              {quantity}
            </Text>
            
            <TouchableOpacity 
              onPress={() => setQuantity(quantity + 1)}
              style={{ padding: 14 }}
            >
              <Plus color="#111111" size={20} />
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
              shadowRadius: 12
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

