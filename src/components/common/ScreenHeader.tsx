import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightElement?: React.ReactNode;
  style?: ViewStyle;
  transparent?: boolean;
}

export default function ScreenHeader({
  title,
  subtitle,
  showBack = true,
  onBack,
  rightElement,
  style,
  transparent = false,
}: ScreenHeaderProps) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (onBack) return onBack();
    if (navigation.canGoBack()) navigation.goBack();
  };

  return (
    <View
      style={[
        styles.header,
        { paddingTop: insets.top + 8 },
        transparent ? styles.transparent : styles.solid,
        style,
      ]}
    >
      <View style={styles.row}>
        {showBack ? (
          <TouchableOpacity onPress={handleBack} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="chevron-back" size={24} color={transparent ? Colors.white : Colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backBtn} />
        )}

        <View style={styles.titleBlock}>
          <Text style={[styles.title, transparent && styles.titleLight]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, transparent && styles.subtitleLight]} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        <View style={styles.right}>
          {rightElement ?? <View style={styles.backBtn} />}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  solid: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: { width: 36, alignItems: 'flex-start' },
  titleBlock: { flex: 1, alignItems: 'center' },
  title: {
    fontFamily: Fonts.semiBold,
    fontSize: 17,
    color: Colors.text,
  },
  titleLight: { color: Colors.white },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.muted,
    marginTop: 1,
  },
  subtitleLight: { color: 'rgba(255,255,255,0.8)' },
  right: { width: 36, alignItems: 'flex-end' },
});
