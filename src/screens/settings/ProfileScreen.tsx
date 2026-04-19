import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/auth';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import ScreenHeader from '../../components/common/ScreenHeader';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useAuthStore();

  const [form, setForm] = useState({
    first_name: user?.first_name ?? '',
    last_name: user?.last_name ?? '',
    home_city: user?.home_city ?? '',
    default_airport: user?.default_airport ?? '',
    preferred_seat: user?.preferred_seat ?? '',
    meal_preference: user?.meal_preference ?? '',
  });
  const [loading, setLoading] = useState(false);

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: updated } = await authApi.updateProfile({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        home_city: form.home_city.trim() || undefined,
        default_airport: form.default_airport.trim().toUpperCase() || undefined,
        preferred_seat: form.preferred_seat || undefined,
        meal_preference: form.meal_preference.trim() || undefined,
      });
      updateUser(updated);
      Alert.alert('Saved', 'Your profile has been updated.');
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Could not update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader title="Edit Profile" />
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar */}
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase() : '?'}
              </Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.changePhoto}>Change photo</Text>
            </TouchableOpacity>
          </View>

          {/* Name */}
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input label="First name" value={form.first_name} onChangeText={(v) => set('first_name', v)} autoCapitalize="words" />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="Last name" value={form.last_name} onChangeText={(v) => set('last_name', v)} autoCapitalize="words" />
            </View>
          </View>

          <Input
            label="Email address"
            value={user?.email ?? ''}
            editable={false}
            containerStyle={styles.disabledInput}
            leftIcon="mail-outline"
          />

          <Input
            label="Home city"
            placeholder="Toronto, ON"
            value={form.home_city}
            onChangeText={(v) => set('home_city', v)}
            leftIcon="home-outline"
            autoCapitalize="words"
          />

          <Input
            label="Default departure airport (IATA)"
            placeholder="YYZ"
            value={form.default_airport}
            onChangeText={(v) => set('default_airport', v.toUpperCase())}
            leftIcon="airplane-outline"
            autoCapitalize="characters"
            maxLength={3}
          />

          <Input
            label="Preferred seat"
            placeholder="Window / Aisle / No preference"
            value={form.preferred_seat}
            onChangeText={(v) => set('preferred_seat', v)}
          />

          <Input
            label="Dietary / meal preference"
            placeholder="Vegetarian, Halal, None..."
            value={form.meal_preference}
            onChangeText={(v) => set('meal_preference', v)}
          />

          <Button title="Save Changes" onPress={handleSave} loading={loading} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  content: { padding: 16, gap: 16 },
  avatarSection: { alignItems: 'center', gap: 8, paddingVertical: 8 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.blue, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontFamily: Fonts.bold, fontSize: 28, color: Colors.white },
  changePhoto: { fontFamily: Fonts.medium, fontSize: 14, color: Colors.blue },
  row: { flexDirection: 'row', gap: 12 },
  disabledInput: { opacity: 0.6 },
});
