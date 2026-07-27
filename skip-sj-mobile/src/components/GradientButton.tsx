import React from 'react';
import { Pressable, Text, ActivityIndicator } from 'react-native';
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

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <Animated.View 
      style={[
        animatedStyle, 
        { 
          width: '100%', 
          marginTop: 16, 
          shadowColor: '#2ECC71', 
          shadowOffset: { width: 0, height: 8 }, 
          shadowOpacity: 0.3, 
          shadowRadius: 16 
        }
      ]}
    >
      <Pressable
        onPress={onPress}
        disabled={loading}
        onPressIn={() => { scale.value = withSpring(0.97); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        style={{ width: '100%', borderRadius: 16, overflow: 'hidden' }}
      >
        <LinearGradient
          colors={['#2ECC71', '#0ea5e9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ width: '100%', paddingVertical: 16, paddingHorizontal: 24, justifyContent: 'center', alignItems: 'center' }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text 
              style={{ color: '#fff', fontFamily: 'Inter-Bold', fontSize: 18, textAlign: 'center', flexShrink: 1 }} 
              numberOfLines={1}
            >
              {title}
            </Text>
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};
