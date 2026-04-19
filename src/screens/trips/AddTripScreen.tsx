import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTripsStore } from '../../store/tripsStore';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import ScreenHeader from '../../components/common/ScreenHeader';

export default function AddTripScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { createTrip } = useTripsStore();

  const [form, setForm] = useState({
    trip_name: '',
    destination: '',
    start_date: '',
    end_date: '',
    description: '',
    budget: '',
    num_travellers: '1',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const set = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.trip_name.trim()) newErrors.trip_name = 'Trip name is required';
    if (!form.destination.trim()) newErrors.destination = 'Destination is required';
    if (!form.start_date) newErrors.start_date = 'Start date is required';
    if (!form.end_date) newErrors.end_date = 'End date is required';
    if (form.start_date && form.end_date && form.start_date > form.end_date) {
      newErrors.end_date = 'End date must be after start date';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const startDate = new Date(form.start_date);
      const endDate = new Date(form.end_date);
      const diffTime = endDate.getTime() - startDate.getTime();
      const durationDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

      const trip = await createTrip({
        trip_name: form.trip_name.trim(),
        destination: form.destination.trim(),
        start_date: form.start_date,
        end_date: form.end_date,
        duration_days: durationDays,
        description: form.description.trim() || undefined,
        budget: form.budget ? parseFloat(form.budget) : undefined,
        num_travellers: parseInt(form.num_travellers, 10) || 1,
      });
      navigation.replace('TripDetail', { tripId: trip.trip_id });
    } catch {
      Alert.alert('Error', 'Could not create trip. Please try again.');
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
        <ScreenHeader title="New Trip" />
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trip Details</Text>
            <Input
              label="Trip name *"
              placeholder="e.g. Orlando Vacation"
              autoCapitalize="words"
              value={form.trip_name}
              onChangeText={(v) => set('trip_name', v)}
              error={errors.trip_name}
            />
            <Input
              label="Destination *"
              placeholder="e.g. Orlando, FL"
              autoCapitalize="words"
              value={form.destination}
              onChangeText={(v) => set('destination', v)}
              error={errors.destination}
              leftIcon="location-outline"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dates</Text>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Input
                  label="Start date *"
                  placeholder="YYYY-MM-DD"
                  value={form.start_date}
                  onChangeText={(v) => set('start_date', v)}
                  error={errors.start_date}
                  leftIcon="calendar-outline"
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  label="End date *"
                  placeholder="YYYY-MM-DD"
                  value={form.end_date}
                  onChangeText={(v) => set('end_date', v)}
                  error={errors.end_date}
                  leftIcon="calendar-outline"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Optional Details</Text>
            <Input
              label="Description"
              placeholder="What's this trip about?"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              value={form.description}
              onChangeText={(v) => set('description', v)}
              containerStyle={{ marginBottom: 0 }}
            />
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Input
                  label="Budget (CAD)"
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  value={form.budget}
                  onChangeText={(v) => set('budget', v)}
                  leftIcon="cash-outline"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  label="Travellers"
                  placeholder="1"
                  keyboardType="number-pad"
                  value={form.num_travellers}
                  onChangeText={(v) => set('num_travellers', v)}
                  leftIcon="people-outline"
                />
              </View>
            </View>
          </View>

          <Button title="Create Trip" onPress={handleCreate} loading={loading} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  content: { padding: 16, gap: 20 },
  section: { gap: 14 },
  sectionTitle: { fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
  row: { flexDirection: 'row', gap: 12 },
});
