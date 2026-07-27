import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCartStore } from '../store/cartStore';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { items, addItem, clearCart, getTotal } = useCartStore();
  const router = useRouter();

  const handleSimulateAdd = () => {
    addItem({
      id: '1',
      name: 'Completo Italiano',
      price: 2500,
      quantity: 1
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900 justify-center items-center p-6">
      <View className="items-center mb-10">
        <Text className="text-emerald-400 text-5xl font-extrabold mb-2">Skip SJ</Text>
        <Text className="text-slate-300 text-lg text-center mb-8">
          App Estudiantes. NativeWind (Tailwind) configurado.
        </Text>
        
        <TouchableOpacity 
          className="bg-indigo-500 py-3 px-8 rounded-full shadow-lg mb-8"
          onPress={() => router.push('/auth')}
        >
          <Text className="text-white font-bold text-lg">Probar Pantalla Login ✨</Text>
        </TouchableOpacity>
      </View>

      <View className="bg-slate-800 p-6 rounded-2xl w-full border border-slate-700 shadow-xl mb-6">
        <Text className="text-white text-xl font-bold mb-4">Carrito de Prueba (Zustand)</Text>
        <Text className="text-slate-300 mb-2">Items: {items.length}</Text>
        <Text className="text-emerald-400 text-2xl font-bold mb-6">Total: ${getTotal()}</Text>

        <TouchableOpacity 
          className="bg-emerald-500 py-4 px-6 rounded-xl items-center mb-3 active:bg-emerald-600"
          onPress={handleSimulateAdd}
        >
          <Text className="text-white font-bold text-lg">Agregar Completo ($2500)</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-slate-700 py-4 px-6 rounded-xl items-center active:bg-slate-600"
          onPress={clearCart}
        >
          <Text className="text-white font-bold text-lg">Limpiar Carrito</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
