import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { authApi } from '../../api/auth';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import ScreenHeader from '../../components/common/ScreenHeader';

export default function ResetPasswordScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleSubmit = async () => {
    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Enter a valid email address');
      return;
    }
    setEmailError('');
    setApiError('');
    setLoading(true);
    try {
      await authApi.requestPasswordReset(email.toLowerCase().trim());
      setSent(true);
    } catch {
      setApiError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader title="Reset Password" />
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {sent ? (
            <View style={styles.sentBlock}>
              <Text style={styles.sentIcon}>📬</Text>
              <Text style={styles.sentTitle}>Check your inbox</Text>
              <Text style={styles.sentBody}>
                We sent a password reset link to{' '}
                <Text style={styles.sentEmail}>{email}</Text>.{'\n'}
                The link expires in 1 hour.
              </Text>
              <Button
                title="Back to Login"
                onPress={() => navigation.navigate('Login' as never)}
                variant="secondary"
              />
            </View>
          ) : (
            <View style={styles.form}>
              <Text style={styles.description}>
                Enter your registered email address and we'll send you a link to reset your password.
              </Text>

              {apiError && (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorBannerText}>{apiError}</Text>
                </View>
              )}

              <Input
                label="Email address"
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
                error={emailError}
                leftIcon="mail-outline"
              />

              <Button title="Send Reset Link" onPress={handleSubmit} loading={loading} />
            </View>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  content: { padding: 24, gap: 20 },
  description: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.muted,
    lineHeight: 22,
  },
  form: { gap: 16 },
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
  sentBlock: { alignItems: 'center', gap: 16, paddingTop: 32 },
  sentIcon: { fontSize: 48 },
  sentTitle: {
    fontFamily: Fonts.bold,
    fontSize: 22,
    color: Colors.text,
  },
  sentBody: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 22,
  },
  sentEmail: { color: Colors.text, fontFamily: Fonts.medium },
});
