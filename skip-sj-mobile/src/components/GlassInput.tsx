import React, { useState } from 'react';
import { View, TextInput, TextInputProps, TouchableOpacity, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { Eye, EyeOff } from 'lucide-react-native';

interface GlassInputProps extends TextInputProps {
  icon?: React.ReactNode;
  isPassword?: boolean;
  error?: string;
}

export const GlassInput: React.FC<GlassInputProps> = ({ 
  icon, 
  isPassword, 
  error, 
  ...props 
}) => {
  const [isSecure, setIsSecure] = useState(isPassword);

  return (
    <View className="mb-4">
      <View 
        className="rounded-2xl overflow-hidden border border-white/20" 
        style={{ 
          shadowColor: '#000', 
          shadowOffset: { width: 0, height: 4 }, 
          shadowOpacity: 0.1, 
          shadowRadius: 10 
        }}
      >
        <BlurView intensity={20} tint="light" className="flex-row items-center px-4 py-3 bg-white/10">
          {icon && <View className="mr-3 opacity-70">{icon}</View>}
          <TextInput
            className="flex-1 text-white font-[Inter-Regular] text-base"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            secureTextEntry={isSecure}
            autoCapitalize="none"
            {...props}
          />
          {isPassword && (
            <TouchableOpacity 
              onPress={() => setIsSecure(!isSecure)}
              className="p-2 -mr-2 opacity-70"
            >
              {isSecure ? (
                <EyeOff color="#fff" size={20} />
              ) : (
                <Eye color="#fff" size={20} />
              )}
            </TouchableOpacity>
          )}
        </BlurView>
      </View>
      {error ? (
        <Text className="text-red-400 text-sm mt-1 ml-2 font-[Inter-Regular]">{error}</Text>
      ) : null}
    </View>
  );
};
