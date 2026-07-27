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
        className="rounded-[16px] overflow-hidden border border-white/60" 
        style={{ 
          shadowColor: '#000', 
          shadowOffset: { width: 0, height: 4 }, 
          shadowOpacity: 0.05, 
          shadowRadius: 10 
        }}
      >
        <BlurView intensity={20} tint="light" className="flex-row items-center px-4 py-3 bg-black/[0.03]">
          {icon && <View className="mr-3">{icon}</View>}
          <TextInput
            className="flex-1 text-[#1A1A1A] font-[Inter-Regular] text-base"
            placeholderTextColor="rgba(0, 0, 0, 0.4)"
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
                <EyeOff color="#6b7280" size={20} />
              ) : (
                <Eye color="#6b7280" size={20} />
              )}
            </TouchableOpacity>
          )}
        </BlurView>
      </View>
      {error ? (
        <Text className="text-red-500 text-sm mt-1 ml-2 font-[Inter-Regular]">{error}</Text>
      ) : null}
    </View>
  );
};
