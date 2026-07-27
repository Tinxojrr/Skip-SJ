import React, { useRef } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, Animated, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
}

export const GradientButton: React.FC<GradientButtonProps> = ({ 
  title, 
  onPress, 
  loading = false 
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  return (
    <View className="mt-4">
      <Animated.View 
        style={{
          transform: [{ scale }],
          shadowColor: '#2ECC71', 
          shadowOffset: { width: 0, height: 8 }, 
          shadowOpacity: 0.4, 
          shadowRadius: 12 
        }}
      >
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={loading}
          activeOpacity={0.9}
          className="rounded-2xl overflow-hidden"
        >
          <LinearGradient
            colors={['#2ECC71', '#0ea5e9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="py-4 items-center justify-center"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-[Inter-Bold] text-lg">{title}</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};
