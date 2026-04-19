import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

type Nav = StackNavigationProp<AuthStackParamList, 'Signup'>;

export default function SignupScreen() {
  const navigation = useNavigation<Nav>();
  const { register, isLoading, error, clearError } = useAuthStore();
  const insets = useSafeAreaInsets();

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    home_city: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [agreed, setAgreed] = useState(false);

  const set = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!form.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (!agreed) newErrors.terms = 'You must agree to the Terms & Conditions';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    clearError();
    if (!validate()) return;
    try {
      await register({
        ...form,
        email: form.email.toLowerCase().trim(),
      });
    } catch {}
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backRow}>
            <Text style={styles.backText}>← Back to login</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>
            Join TripCare and organise every trip in one place.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          )}

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input
                label="First name"
                placeholder="Jane"
                autoCapitalize="words"
                value={form.first_name}
                onChangeText={(v) => set('first_name', v)}
                error={errors.first_name}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="Last name"
                placeholder="Smith"
                autoCapitalize="words"
                value={form.last_name}
                onChangeText={(v) => set('last_name', v)}
                error={errors.last_name}
              />
            </View>
          </View>

          <Input
            label="Email address"
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={form.email}
            onChangeText={(v) => set('email', v)}
            error={errors.email}
            leftIcon="mail-outline"
          />

          <Input
            label="Password"
            placeholder="Min. 8 characters"
            secureTextEntry
            value={form.password}
            onChangeText={(v) => set('password', v)}
            error={errors.password}
          />

          <Input
            label="Home city (optional)"
            placeholder="e.g. Toronto"
            autoCapitalize="words"
            value={form.home_city}
            onChangeText={(v) => set('home_city', v)}
            leftIcon="location-outline"
          />

          {/* T&C checkbox */}
          <TouchableOpacity
            style={styles.checkRow}
            onPress={() => setAgreed(!agreed)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
              {agreed && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkLabel}>
              I agree to the{' '}
              <Text style={styles.link}>Terms & Conditions</Text>
              {' '}and{' '}
              <Text style={styles.link}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>
          {errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={isLoading}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.white },
  container: { paddingHorizontal: 24, gap: 24 },

  header: { gap: 8 },
  backRow: { marginBottom: 4 },
  backText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: Colors.blue,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 24,
    color: Colors.text,
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.muted,
    lineHeight: 20,
  },

  form: { gap: 16 },
  row: { flexDirection: 'row', gap: 12 },

  errorBanner: {
    backgroundColor: Colors.errorLight,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  errorBannerText: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: Colors.error,
  },

  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: Colors.border,
    marginTop: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.blue,
    borderColor: Colors.blue,
  },
  checkmark: { color: Colors.white, fontSize: 12, fontFamily: Fonts.bold },
  checkLabel: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: Colors.muted,
    lineHeight: 20,
  },
  link: { color: Colors.blue },
  errorText: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.error,
    marginTop: -8,
  },
});
