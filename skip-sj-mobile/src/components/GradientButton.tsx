import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

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
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  return (
    <Animated.View 
      style={[
        animatedStyle,
        { 
          shadowColor: '#2ECC71', 
          shadowOffset: { width: 0, height: 8 }, 
          shadowOpacity: 0.4, 
          shadowRadius: 12 
        }
      ]} 
      className="mt-4"
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
  );
};
