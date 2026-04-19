import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'lg' | 'md' | 'sm';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = true,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? Colors.white : Colors.blue}
          size="small"
        />
      ) : (
        <Text style={[styles.text, styles[`text_${variant}`], styles[`textSize_${size}`], textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: { width: '100%' },

  // Variants
  primary: { backgroundColor: Colors.blue },
  secondary: {
    backgroundColor: Colors.blueLight,
    borderWidth: 1,
    borderColor: Colors.blue,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  danger: { backgroundColor: Colors.error },

  // Sizes
  size_lg: { height: 52, paddingHorizontal: 24 },
  size_md: { height: 46, paddingHorizontal: 20 },
  size_sm: { height: 36, paddingHorizontal: 14 },

  // Disabled
  disabled: { opacity: 0.5 },

  // Text
  text: { fontFamily: Fonts.semiBold },
  text_primary: { color: Colors.white },
  text_secondary: { color: Colors.blue },
  text_ghost: { color: Colors.text },
  text_danger: { color: Colors.white },

  textSize_lg: { fontSize: 16 },
  textSize_md: { fontSize: 15 },
  textSize_sm: { fontSize: 13 },
});
