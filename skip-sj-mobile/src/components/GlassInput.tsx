import React, { useState } from 'react';
import { View, TextInput, TextInputProps, TouchableOpacity, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { Eye, EyeOff } from 'lucide-react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

interface GlassInputProps extends TextInputProps {
  icon?: React.ReactNode;
  isPassword?: boolean;
  error?: string;
}

export const GlassInput: React.FC<GlassInputProps> = ({ 
  icon, 
  isPassword, 
  error, 
  onFocus,
  onBlur,
  ...props 
}) => {
  const [isSecure, setIsSecure] = useState(isPassword);
  
  const isFocused = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    borderBottomColor: isFocused.value ? '#0056A3' : 'rgba(200, 140, 20, 0.3)',
    transform: [{ scale: 1 + isFocused.value * 0.01 }]
  }));

  return (
    <View className="mb-4">
      <Animated.View 
        style={[
          animatedStyle,
          {
            borderRadius: 16,
            overflow: 'hidden',
            borderBottomWidth: 2,
            backgroundColor: 'rgba(0,0,0,0.04)'
          }
        ]}
      >
        <BlurView intensity={20} tint="light" style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 }}>
          {icon && <View style={{ marginRight: 12, opacity: 0.8 }}>{icon}</View>}
          <TextInput
            style={{ flex: 1, color: '#1A1A1A', fontFamily: 'Inter-Regular', fontSize: 16 }}
            placeholderTextColor="#6B7280"
            secureTextEntry={isSecure}
            autoCapitalize="none"
            onFocus={(e) => {
              isFocused.value = withTiming(1, { duration: 200 });
              onFocus?.(e);
            }}
            onBlur={(e) => {
              isFocused.value = withTiming(0, { duration: 200 });
              onBlur?.(e);
            }}
            {...props}
          />
          {isPassword && (
            <TouchableOpacity 
              onPress={() => setIsSecure(!isSecure)}
              style={{ padding: 8, marginRight: -8, opacity: 0.7 }}
            >
              {isSecure ? (
                <EyeOff color="rgba(0, 50, 90, 0.5)" size={20} />
              ) : (
                <Eye color="rgba(0, 50, 90, 0.5)" size={20} />
              )}
            </TouchableOpacity>
          )}
        </BlurView>
      </Animated.View>
      {error ? (
        <Text style={{ color: '#ef4444', fontSize: 14, marginTop: 4, marginLeft: 8, fontFamily: 'Inter-Regular' }}>{error}</Text>
      ) : null}
    </View>
  );
};
