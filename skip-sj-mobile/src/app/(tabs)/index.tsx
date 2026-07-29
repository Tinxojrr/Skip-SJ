import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Plus } from 'lucide-react-native';
import { useCartStore } from '../../store/cartStore';

// Data simulada de Tiendas/Locales
const STORES = [
  { id: '1', name: 'Comedor', emoji: '🍽️', logoUrl: null, time: '5-10 min' },
  { id: '2', name: 'Achoclonado', emoji: null, logoUrl: 'https://scontent-scl2-1.xx.fbcdn.net/v/t39.30808-6/280540866_168868078877543_8217311145119934254_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=8x2qKk-_XzcQ7kNvgEQC1rE&_nc_zt=23&_nc_ht=scontent-scl2-1.xx&_nc_gid=AJXg8V5D0219J9q3s6vM7z5&oh=00_AYBqG36r7w9hL8z35y3_m3Q1_73822qK_zQ_83_x_x_x_x&oe=66D88B57', time: '10-15 min' }, // Placeholder real si funciona, o pueden poner su require
  { id: '3', name: 'Paradiso', emoji: '🍕', logoUrl: null, time: '15-20 min' },
  { id: '4', name: 'Castaño', emoji: '🥐', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Logo_Casta%C3%B1o.svg/1200px-Logo_Casta%C3%B1o.svg.png', time: '5 min' },
  { id: '5', name: 'Local -1', emoji: '🏪', logoUrl: null, time: '5-10 min' },
];

const CATEGORIES = ['Todos', 'Almuerzos', 'Snacks', 'Bebidas'];

// Data simulada de Productos vinculada a Locales
const PRODUCTS = [
  { id: '1', name: 'Completo Italiano', price: 2500, category: 'Almuerzos', storeId: '2', storeName: 'Achoclonado', emoji: '🌭' },
  { id: '2', name: 'Café Latte', price: 1800, category: 'Bebidas', storeId: '4', storeName: 'Castaño', emoji: '☕' },
  { id: '3', name: 'Muffin de Chocolate', price: 1500, category: 'Snacks', storeId: '4', storeName: 'Castaño', emoji: '🧁' },
  { id: '4', name: 'Promo Chaparrita + Bebida', price: 3500, category: 'Almuerzos', storeId: '1', storeName: 'Comedor', emoji: '🥪' },
  { id: '5', name: 'Papas Fritas Medianas', price: 2000, category: 'Snacks', storeId: '3', storeName: 'Paradiso', emoji: '🍟' },
  { id: '6', name: 'Porción de Choclo', price: 2200, category: 'Snacks', storeId: '2', storeName: 'Achoclonado', emoji: '🌽' },
  { id: '7', name: 'Pizza Pepperoni', price: 1500, category: 'Almuerzos', storeId: '3', storeName: 'Paradiso', emoji: '🍕' },
];

export default function HomeScreen() {
  const [activeStore, setActiveStore] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const { addItem } = useCartStore();

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      storeName: product.storeName
    });
  };

  const filteredProducts = PRODUCTS.filter(p => {
    const matchStore = activeStore ? p.storeId === activeStore : true;
    const matchCategory = activeCategory === 'Todos' ? true : p.category === activeCategory;
    return matchStore && matchCategory;
  });

  const getGreetingSubtitle = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'Recarga energía para tus primeras clases.';
    if (hour >= 12 && hour < 16) return 'Pausa para almorzar y seguir estudiando.';
    if (hour >= 16 && hour < 20) return 'Un snack para sobrevivir al último bloque.';
    return '¿Estudiando hasta tarde? Date un gusto.';
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        
        {/* Header Section */}
        <View style={{ paddingHorizontal: 24, paddingTop: 32, paddingBottom: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ color: '#111111', fontSize: 32, fontFamily: 'Inter-Bold', marginBottom: 4 }}>Hola, Alumno 👋</Text>
            <Text style={{ color: 'rgba(17,17,17,0.6)', fontSize: 16, fontFamily: 'Inter-Regular' }}>{getGreetingSubtitle()}</Text>
          </View>
          
          {/* Badge Duoc UC */}
          <View style={{ backgroundColor: '#111111', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 }}>
            <Text style={{ color: '#F2A900', fontSize: 10, fontFamily: 'Inter-Bold', textTransform: 'uppercase', letterSpacing: 0.5 }}>Duoc UC</Text>
          </View>
        </View>

        {/* Publicidad / Promos (Ads Section) */}
        <View style={{ paddingHorizontal: 24, marginBottom: 28 }}>
          <View style={{ 
            backgroundColor: '#111111', 
            borderRadius: 24, 
            padding: 20,
            flexDirection: 'row',
            alignItems: 'center',
            overflow: 'hidden'
          }}>
            <View style={{ flex: 1, zIndex: 10 }}>
              <View style={{ backgroundColor: '#F2A900', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginBottom: 8 }}>
                <Text style={{ fontSize: 10, fontFamily: 'Inter-Bold', color: '#111111', textTransform: 'uppercase' }}>Promo Exclusiva</Text>
              </View>
              <Text style={{ color: '#FFFFFF', fontSize: 20, fontFamily: 'Inter-Bold', marginBottom: 4 }}>2x1 en Completos</Text>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontFamily: 'Inter-Regular' }}>Solo por hoy en Achoclonado</Text>
            </View>
            <View style={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.8 }}>
              <Text style={{ fontSize: 100 }}>🌭</Text>
            </View>
          </View>
        </View>

        {/* Search Bar (Fake) */}
        <View style={{ paddingHorizontal: 24, marginBottom: 28 }}>
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            backgroundColor: '#FFFFFF', 
            paddingHorizontal: 20, 
            paddingVertical: 16, 
            borderRadius: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.05,
            shadowRadius: 12,
            elevation: 2,
            borderWidth: 1,
            borderColor: 'rgba(17,17,17,0.05)'
          }}>
            <Search color="#F2A900" size={20} />
            <Text style={{ marginLeft: 12, color: 'rgba(17,17,17,0.4)', fontSize: 16, fontFamily: 'Inter-Regular' }}>Buscar comida, snacks...</Text>
          </View>
        </View>

        {/* Stores Carousel (Locales) */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ color: '#111111', fontSize: 18, fontFamily: 'Inter-Bold', marginBottom: 16, paddingHorizontal: 24 }}>¿De dónde quieres pedir?</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
          >
            {/* Botón para quitar filtro de local */}
            <TouchableOpacity 
              onPress={() => setActiveStore(null)}
              style={{
                width: 90,
                height: 110,
                backgroundColor: activeStore === null ? '#111111' : '#FFFFFF',
                borderRadius: 20,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: activeStore === null ? '#111111' : 'rgba(17,17,17,0.1)',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: activeStore === null ? 'rgba(255,255,255,0.1)' : 'rgba(242,169,0,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
                 <Text style={{ fontSize: 24 }}>🌟</Text>
              </View>
              <Text style={{ color: activeStore === null ? '#FFFFFF' : '#111111', fontFamily: 'Inter-SemiBold', fontSize: 13 }}>Todos</Text>
              <Text style={{ color: activeStore === null ? 'rgba(255,255,255,0.6)' : 'rgba(17,17,17,0.5)', fontFamily: 'Inter-Regular', fontSize: 10, marginTop: 2 }}>Locales</Text>
            </TouchableOpacity>

            {STORES.map((store) => {
              const isActive = activeStore === store.id;
              return (
                <TouchableOpacity 
                  key={store.id}
                  onPress={() => setActiveStore(store.id)}
                  style={{
                    width: 90,
                    height: 110,
                    backgroundColor: isActive ? '#F2A900' : '#FFFFFF',
                    borderRadius: 20,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: isActive ? '#F2A900' : 'rgba(17,17,17,0.1)',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 2,
                  }}
                >
                  <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: isActive ? 'rgba(17,17,17,0.1)' : 'rgba(242,169,0,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 8, overflow: 'hidden' }}>
                    {store.logoUrl ? (
                      <Image source={{ uri: store.logoUrl }} style={{ width: 48, height: 48 }} resizeMode="contain" />
                    ) : (
                      <Text style={{ fontSize: 24 }}>{store.emoji}</Text>
                    )}
                  </View>
                  <Text style={{ color: '#111111', fontFamily: 'Inter-SemiBold', fontSize: 13 }} numberOfLines={1}>{store.name}</Text>
                  <Text style={{ color: isActive ? 'rgba(17,17,17,0.6)' : 'rgba(17,17,17,0.5)', fontFamily: 'Inter-Regular', fontSize: 10, marginTop: 2 }}>{store.time}</Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>

        {/* Categories */}
        <View style={{ marginBottom: 32 }}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
          >
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <TouchableOpacity 
                  key={cat}
                  onPress={() => setActiveCategory(cat)}
                  style={{
                    backgroundColor: isActive ? '#111111' : '#FFFFFF',
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    borderRadius: 20,
                    borderWidth: isActive ? 0 : 1,
                    borderColor: 'rgba(17,17,17,0.1)',
                  }}
                >
                  <Text style={{ 
                    color: isActive ? '#F2A900' : 'rgba(17,17,17,0.6)', 
                    fontFamily: isActive ? 'Inter-SemiBold' : 'Inter-Regular',
                    fontSize: 14
                  }}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>

        {/* Featured Products */}
        <View style={{ paddingHorizontal: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
            <Text style={{ color: '#111111', fontSize: 20, fontFamily: 'Inter-Bold' }}>
              {activeStore ? `Menú de ${STORES.find(s => s.id === activeStore)?.name}` : 'Populares 🔥'}
            </Text>
            <Text style={{ color: 'rgba(17,17,17,0.5)', fontSize: 14, fontFamily: 'Inter-Regular' }}>{filteredProducts.length} items</Text>
          </View>
          
          {filteredProducts.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>😢</Text>
              <Text style={{ color: '#111111', fontFamily: 'Inter-SemiBold', fontSize: 16 }}>No hay productos en esta categoría</Text>
            </View>
          ) : (
            <View style={{ gap: 20 }}>
              {filteredProducts.map((product) => (
                <View key={product.id} style={{ 
                  flexDirection: 'row',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 24,
                  padding: 16,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.04,
                  shadowRadius: 16,
                  elevation: 3,
                  borderWidth: 1,
                  borderColor: 'rgba(17,17,17,0.03)'
                }}>
                  {/* Image Placeholder */}
                  <View style={{ width: 100, height: 100, backgroundColor: 'rgba(242,169,0,0.1)', borderRadius: 16, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: 32 }}>{product.emoji}</Text>
                  </View>
                  
                  {/* Product Info */}
                  <View style={{ flex: 1, marginLeft: 16, justifyContent: 'space-between', paddingVertical: 4 }}>
                    <View>
                      <Text style={{ color: 'rgba(17,17,17,0.5)', fontSize: 11, fontFamily: 'Inter-SemiBold', textTransform: 'uppercase', marginBottom: 4 }}>
                        {product.storeName} • {product.category}
                      </Text>
                      <Text style={{ color: '#111111', fontSize: 17, fontFamily: 'Inter-Bold', lineHeight: 22 }} numberOfLines={2}>{product.name}</Text>
                    </View>
                    
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      {/* Price with underline/background highlight */}
                      <View style={{ backgroundColor: 'rgba(242,169,0,0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                        <Text style={{ color: '#111111', fontSize: 16, fontFamily: 'Inter-Bold' }}>${product.price}</Text>
                      </View>
                      
                      {/* Add Button */}
                      <TouchableOpacity 
                        onPress={() => handleAddToCart(product)}
                        style={{ 
                          backgroundColor: '#111111', 
                          width: 36, 
                          height: 36, 
                          borderRadius: 18, 
                          justifyContent: 'center', 
                          alignItems: 'center',
                          shadowColor: '#111111',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.3,
                          shadowRadius: 8,
                        }}
                      >
                        <Plus color="#FFFFFF" size={18} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
