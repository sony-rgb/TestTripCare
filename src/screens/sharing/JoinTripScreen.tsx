import React, { useState } from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTripsStore } from '../../store/tripsStore';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import ScreenHeader from '../../components/common/ScreenHeader';

export default function JoinTripScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { joinByCode } = useTripsStore();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) { setError('Please enter a trip code.'); return; }
    setError('');
    setLoading(true);
    try {
      const trip = await joinByCode(trimmed);
      Alert.alert('Joined!', `You've joined "${trip.trip_name}".`, [
        { text: 'View Trip', onPress: () => navigation.replace('TripDetail', { tripId: trip.trip_id }) },
      ]);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Invalid or expired trip code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader title="Join a Trip" />
        <View style={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
          <View style={styles.illustration}>
            <Text style={styles.illustrationIcon}>🔗</Text>
          </View>
          <Text style={styles.title}>Enter Trip Code</Text>
          <Text style={styles.body}>
            Ask the trip owner for their 8-character trip code, then enter it below to join their itinerary.
          </Text>

          <Input
            placeholder="TC-A7BX9K"
            autoCapitalize="characters"
            autoCorrect={false}
            value={code}
            onChangeText={(v) => { setCode(v); setError(''); }}
            error={error}
            leftIcon="key-outline"
            clearable
          />

          <Button title="Join Trip" onPress={handleJoin} loading={loading} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  content: { flex: 1, padding: 24, gap: 16, justifyContent: 'center' },
  illustration: { alignItems: 'center', marginBottom: 8 },
  illustrationIcon: { fontSize: 56 },
  title: { fontFamily: Fonts.bold, fontSize: 22, color: Colors.text, textAlign: 'center' },
  body: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.muted, textAlign: 'center', lineHeight: 22 },
});
