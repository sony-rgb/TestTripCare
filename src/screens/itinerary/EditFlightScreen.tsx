import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTripsStore } from '../../store/tripsStore';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import ScreenHeader from '../../components/common/ScreenHeader';

type RouteParams = {
  tripId: string;
  itemId?: string;
  dayNumber: number;
  itemDate: string;
};

export default function EditFlightScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const { tripId, itemId, dayNumber, itemDate } = route.params;
  const insets = useSafeAreaInsets();
  const { currentItems, createItem, updateItem, deleteItem } = useTripsStore();

  const existing = itemId ? currentItems.find((i) => i.item_id === itemId) : undefined;
  const ext = (existing?.extended_fields ?? {}) as Record<string, string>;

  const [form, setForm] = useState({
    // Base fields
    title: existing?.title ?? '',
    subtitle: existing?.subtitle ?? '',
    start_time: existing?.start_time ?? '',
    end_time: existing?.end_time ?? '',
    address: existing?.address ?? '',
    confirmation: existing?.confirmation ?? '',
    notes: existing?.notes ?? '',
    // Extended fields
    airline: ext.airline ?? '',
    flight_number: ext.flight_number ?? '',
    from_airport: ext.from_airport ?? '',
    to_airport: ext.to_airport ?? '',
    from_terminal: ext.from_terminal ?? '',
    to_terminal: ext.to_terminal ?? '',
    from_gate: ext.from_gate ?? '',
    to_gate: ext.to_gate ?? '',
    seat_numbers: ext.seat_numbers ?? '',
    booking_ref: ext.booking_ref ?? '',
    class_of_service: ext.class_of_service ?? '',
  });
  const [loading, setLoading] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);

  const set = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSave = async () => {
    if (!form.title.trim()) {
      Alert.alert('Required', 'Please enter a flight route or title.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        type: 'flight' as const,
        trip_id: tripId,
        day_number: dayNumber,
        item_date: itemDate,
        title: form.title.trim(),
        subtitle: form.subtitle.trim() || undefined,
        start_time: form.start_time || undefined,
        end_time: form.end_time || undefined,
        address: form.address.trim() || undefined,
        confirmation: form.confirmation.trim() || undefined,
        notes: form.notes.trim() || undefined,
        extended_fields: {
          airline: form.airline,
          flight_number: form.flight_number,
          from_airport: form.from_airport,
          to_airport: form.to_airport,
          from_terminal: form.from_terminal,
          to_terminal: form.to_terminal,
          from_gate: form.from_gate,
          to_gate: form.to_gate,
          seat_numbers: form.seat_numbers,
          booking_ref: form.booking_ref,
          class_of_service: form.class_of_service,
        },
      };
      if (itemId) {
        await updateItem(tripId, itemId, payload);
      } else {
        await createItem(tripId, payload);
      }
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Could not save flight.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!itemId) return;
    try {
      await deleteItem(tripId, itemId);
      setDeleteVisible(false);
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Could not delete flight.');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader
          title={itemId ? 'Edit Flight' : 'Add Flight'}
          rightElement={
            itemId ? (
              <TouchableOpacity onPress={() => setDeleteVisible(true)}>
                <Ionicons name="trash-outline" size={20} color={Colors.error} />
              </TouchableOpacity>
            ) : undefined
          }
        />
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Section title="Route">
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Input label="From" placeholder="YYZ" value={form.from_airport} onChangeText={(v) => set('from_airport', v)} />
              </View>
              <View style={styles.arrowCol}>
                <Ionicons name="airplane" size={18} color={Colors.blue} style={{ marginTop: 24 }} />
              </View>
              <View style={{ flex: 1 }}>
                <Input label="To" placeholder="MCO" value={form.to_airport} onChangeText={(v) => set('to_airport', v)} />
              </View>
            </View>
            <Input label="Title / Route *" placeholder="YYZ → MCO" value={form.title} onChangeText={(v) => set('title', v)} />
            <Input label="Airline" placeholder="Air Canada" value={form.airline} onChangeText={(v) => set('airline', v)} />
            <Input label="Flight number" placeholder="AC1234" value={form.flight_number} onChangeText={(v) => set('flight_number', v)} />
          </Section>

          <Section title="Times">
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Input label="Departure time" placeholder="08:30" value={form.start_time} onChangeText={(v) => set('start_time', v)} keyboardType="numbers-and-punctuation" />
              </View>
              <View style={{ flex: 1 }}>
                <Input label="Arrival time" placeholder="11:00" value={form.end_time} onChangeText={(v) => set('end_time', v)} keyboardType="numbers-and-punctuation" />
              </View>
            </View>
          </Section>

          <Section title="Gate & Seat">
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Input label="Dep. terminal" placeholder="T1" value={form.from_terminal} onChangeText={(v) => set('from_terminal', v)} />
              </View>
              <View style={{ flex: 1 }}>
                <Input label="Dep. gate" placeholder="D12" value={form.from_gate} onChangeText={(v) => set('from_gate', v)} />
              </View>
            </View>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Input label="Arr. terminal" placeholder="B" value={form.to_terminal} onChangeText={(v) => set('to_terminal', v)} />
              </View>
              <View style={{ flex: 1 }}>
                <Input label="Arr. gate" placeholder="B22" value={form.to_gate} onChangeText={(v) => set('to_gate', v)} />
              </View>
            </View>
            <Input label="Seat numbers" placeholder="14A, 14B" value={form.seat_numbers} onChangeText={(v) => set('seat_numbers', v)} />
            <Input label="Class of service" placeholder="Economy / Business" value={form.class_of_service} onChangeText={(v) => set('class_of_service', v)} />
          </Section>

          <Section title="Booking">
            <Input label="Booking reference" placeholder="ABC123" value={form.booking_ref} onChangeText={(v) => set('booking_ref', v)} />
            <Input label="Confirmation number" placeholder="CONF456" value={form.confirmation} onChangeText={(v) => set('confirmation', v)} />
          </Section>

          <Section title="Other">
            <Input label="Subtitle" placeholder="Air Canada · Economy" value={form.subtitle} onChangeText={(v) => set('subtitle', v)} />
            <Input label="Airport / address" placeholder="Terminal 1, Toronto Pearson" value={form.address} onChangeText={(v) => set('address', v)} leftIcon="location-outline" />
            <Input label="Notes" placeholder="Meal pre-ordered, checked bags..." value={form.notes} onChangeText={(v) => set('notes', v)} multiline numberOfLines={3} textAlignVertical="top" />
          </Section>

          <Button title={itemId ? 'Save Changes' : 'Add Flight'} onPress={handleSave} loading={loading} />
        </ScrollView>
      </View>

      {/* Delete confirm */}
      <Modal transparent visible={deleteVisible} animationType="fade" onRequestClose={() => setDeleteVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.confirmModal}>
            <Text style={styles.confirmTitle}>Delete Flight?</Text>
            <Text style={styles.confirmBody}>This flight will be permanently removed from the itinerary.</Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setDeleteVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  content: { padding: 16, gap: 20 },
  section: { gap: 12 },
  sectionTitle: { fontFamily: Fonts.semiBold, fontSize: 13, color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
  row: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  arrowCol: { justifyContent: 'center', alignItems: 'center', width: 24 },
  overlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'center', padding: 24 },
  confirmModal: { backgroundColor: Colors.white, borderRadius: 16, padding: 24, gap: 12 },
  confirmTitle: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.text },
  confirmBody: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.muted, lineHeight: 20 },
  confirmActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn: { flex: 1, height: 44, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, justifyContent: 'center', alignItems: 'center' },
  cancelText: { fontFamily: Fonts.medium, fontSize: 15, color: Colors.text },
  deleteBtn: { flex: 1, height: 44, borderRadius: 10, backgroundColor: Colors.error, justifyContent: 'center', alignItems: 'center' },
  deleteText: { fontFamily: Fonts.semiBold, fontSize: 15, color: Colors.white },
});
