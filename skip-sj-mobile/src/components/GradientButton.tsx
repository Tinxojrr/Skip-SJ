import React, { useEffect } from 'react';
import { Pressable, Text, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withRepeat, withTiming, Easing, withDelay } from 'react-native-reanimated';

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
  const shimmerX = useSharedValue(-200);

  useEffect(() => {
    shimmerX.value = withRepeat(
      withDelay(3000, withTiming(400, { duration: 1000, easing: Easing.linear })),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerX.value }, { rotate: '20deg' }]
  }));

  return (
    <Animated.View 
      style={[
        animatedStyle, 
        { 
          width: '100%', 
          marginTop: 16, 
          shadowColor: '#FFBF00', 
          shadowOffset: { width: 0, height: 8 }, 
          shadowOpacity: 0.25, 
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
          colors={['#FFBF00', '#FFBF00']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ width: '100%', paddingVertical: 16, paddingHorizontal: 24, justifyContent: 'center', alignItems: 'center' }}
        >
          {loading ? (
            <ActivityIndicator color="#111111" />
          ) : (
            <Text 
              style={{ color: '#111111', fontFamily: 'Inter-Bold', fontWeight: '800', fontSize: 18, textAlign: 'center', flexShrink: 1, zIndex: 10, letterSpacing: 0.5 }} 
              numberOfLines={1}
            >
              {title}
            </Text>
          )}
          
          <Animated.View 
            style={[
              shimmerStyle, 
              { position: 'absolute', top: -50, bottom: -50, width: 80, backgroundColor: 'rgba(255,255,255,0.25)' }
            ]} 
          />
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};
