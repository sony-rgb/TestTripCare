import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  leftIcon?: string;
  rightElement?: React.ReactNode;
  clearable?: boolean;
}

export default function Input({
  label,
  error,
  containerStyle,
  leftIcon,
  rightElement,
  clearable = false,
  secureTextEntry,
  value,
  onChangeText,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = secureTextEntry;
  const actualSecure = isPassword && !showPassword;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputWrapper,
          focused && styles.inputWrapperFocused,
          error ? styles.inputWrapperError : null,
        ]}
      >
        {leftIcon && (
          <Ionicons name={leftIcon as any} size={18} color={Colors.muted} style={styles.leftIcon} />
        )}
        <TextInput
          style={[styles.input, leftIcon ? styles.inputWithLeft : null]}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          secureTextEntry={actualSecure}
          placeholderTextColor={Colors.mutedLight}
          {...props}
        />
        {clearable && value && value.length > 0 && (
          <TouchableOpacity
            onPress={() => onChangeText?.('')}
            style={styles.rightBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle" size={18} color={Colors.mutedLight} />
          </TouchableOpacity>
        )}
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.rightBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={Colors.muted}
            />
          </TouchableOpacity>
        )}
        {rightElement}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  label: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: Colors.text,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    height: 48,
    paddingHorizontal: 12,
  },
  inputWrapperFocused: {
    borderColor: Colors.blue,
    backgroundColor: Colors.white,
  },
  inputWrapperError: {
    borderColor: Colors.error,
  },
  leftIcon: { marginRight: 8 },
  input: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.text,
    paddingVertical: 0,
  },
  inputWithLeft: {},
  rightBtn: { padding: 4 },
  error: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.error,
  },
});
