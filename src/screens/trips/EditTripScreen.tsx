import React, { useState, useEffect } from 'react';
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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTripsStore } from '../../store/tripsStore';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import ScreenHeader from '../../components/common/ScreenHeader';

type RouteParams = { tripId: string };

export default function EditTripScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const insets = useSafeAreaInsets();
  const { currentTrip, updateTrip } = useTripsStore();

  const [form, setForm] = useState({
    trip_name: currentTrip?.trip_name ?? '',
    destination: currentTrip?.destination ?? '',
    start_date: currentTrip?.start_date ?? '',
    end_date: currentTrip?.end_date ?? '',
    description: currentTrip?.description ?? '',
    budget: currentTrip?.budget?.toString() ?? '',
    num_travellers: currentTrip?.num_travellers?.toString() ?? '1',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const set = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: '' }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const startDate = new Date(form.start_date);
      const endDate = new Date(form.end_date);
      const durationDays = Math.floor((endDate.getTime() - startDate.getTime()) / 86400000) + 1;

      await updateTrip(route.params.tripId, {
        trip_name: form.trip_name.trim(),
        destination: form.destination.trim(),
        start_date: form.start_date,
        end_date: form.end_date,
        duration_days: durationDays,
        description: form.description.trim() || undefined,
        budget: form.budget ? parseFloat(form.budget) : undefined,
        num_travellers: parseInt(form.num_travellers, 10) || 1,
      });
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Could not update trip.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader title="Edit Trip" />
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
        >
          <Input label="Trip name" value={form.trip_name} onChangeText={(v) => set('trip_name', v)} />
          <Input label="Destination" value={form.destination} onChangeText={(v) => set('destination', v)} leftIcon="location-outline" />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input label="Start date" value={form.start_date} onChangeText={(v) => set('start_date', v)} leftIcon="calendar-outline" />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="End date" value={form.end_date} onChangeText={(v) => set('end_date', v)} leftIcon="calendar-outline" />
            </View>
          </View>
          <Input label="Description" value={form.description} onChangeText={(v) => set('description', v)} multiline numberOfLines={3} textAlignVertical="top" />
          <Button title="Save Changes" onPress={handleSave} loading={loading} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  content: { padding: 16, gap: 16 },
  row: { flexDirection: 'row', gap: 12 },
});
