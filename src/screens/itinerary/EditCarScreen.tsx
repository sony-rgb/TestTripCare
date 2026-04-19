import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, Alert, TouchableOpacity, Modal,
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

type RouteParams = { tripId: string; itemId?: string; dayNumber: number; itemDate: string };

export default function EditCarScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const { tripId, itemId, dayNumber, itemDate } = route.params;
  const insets = useSafeAreaInsets();
  const { currentItems, createItem, updateItem, deleteItem } = useTripsStore();

  const existing = itemId ? currentItems.find((i) => i.item_id === itemId) : undefined;
  const ext = (existing?.extended_fields ?? {}) as Record<string, string>;

  const [form, setForm] = useState({
    title: existing?.title ?? '',
    subtitle: existing?.subtitle ?? '',
    address: existing?.address ?? '',
    confirmation: existing?.confirmation ?? '',
    notes: existing?.notes ?? '',
    start_time: existing?.start_time ?? '',
    end_time: existing?.end_time ?? '',
    company: ext.company ?? '',
    vehicle_type: ext.vehicle_type ?? '',
    pickup_address: ext.pickup_address ?? '',
    pickup_date: ext.pickup_date ?? itemDate,
    pickup_time: ext.pickup_time ?? '',
    dropoff_address: ext.dropoff_address ?? '',
    dropoff_date: ext.dropoff_date ?? '',
    dropoff_time: ext.dropoff_time ?? '',
    booking_ref: ext.booking_ref ?? '',
    insurance_included: ext.insurance_included ?? '',
  });
  const [loading, setLoading] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSave = async () => {
    if (!form.title.trim()) { Alert.alert('Required', 'Please enter a rental company or title.'); return; }
    setLoading(true);
    try {
      const payload = {
        type: 'car' as const, trip_id: tripId, day_number: dayNumber, item_date: itemDate,
        title: form.title.trim(), subtitle: form.subtitle.trim() || undefined,
        start_time: form.start_time || undefined, end_time: form.end_time || undefined,
        address: form.pickup_address.trim() || form.address.trim() || undefined,
        confirmation: form.confirmation.trim() || undefined, notes: form.notes.trim() || undefined,
        extended_fields: {
          company: form.company, vehicle_type: form.vehicle_type,
          pickup_address: form.pickup_address, pickup_date: form.pickup_date, pickup_time: form.pickup_time,
          dropoff_address: form.dropoff_address, dropoff_date: form.dropoff_date, dropoff_time: form.dropoff_time,
          booking_ref: form.booking_ref, insurance_included: form.insurance_included,
        },
      };
      if (itemId) { await updateItem(tripId, itemId, payload); }
      else { await createItem(tripId, payload); }
      navigation.goBack();
    } catch { Alert.alert('Error', 'Could not save car rental.'); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!itemId) return;
    try { await deleteItem(tripId, itemId); setDeleteVisible(false); navigation.goBack(); }
    catch { Alert.alert('Error', 'Could not delete car rental.'); }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader
          title={itemId ? 'Edit Car Rental' : 'Add Car Rental'}
          rightElement={itemId ? (
            <TouchableOpacity onPress={() => setDeleteVisible(true)}>
              <Ionicons name="trash-outline" size={20} color={Colors.error} />
            </TouchableOpacity>
          ) : undefined}
        />
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]} keyboardShouldPersistTaps="handled">
          <Input label="Company / Title *" placeholder="Enterprise Rent-A-Car" value={form.title} onChangeText={(v) => set('title', v)} />
          <Input label="Vehicle type" placeholder="Mid-size SUV" value={form.vehicle_type} onChangeText={(v) => set('vehicle_type', v)} />
          <Input label="Subtitle" placeholder="Enterprise · 5 days" value={form.subtitle} onChangeText={(v) => set('subtitle', v)} />
          <Text style={styles.sectionLabel}>Pickup</Text>
          <Input label="Pickup address" placeholder="9001 Airport Blvd, Orlando" value={form.pickup_address} onChangeText={(v) => set('pickup_address', v)} leftIcon="location-outline" />
          <View style={styles.row}>
            <View style={{ flex: 1 }}><Input label="Pickup date" placeholder="YYYY-MM-DD" value={form.pickup_date} onChangeText={(v) => set('pickup_date', v)} /></View>
            <View style={{ flex: 1 }}><Input label="Pickup time" placeholder="10:00" value={form.pickup_time} onChangeText={(v) => set('pickup_time', v)} /></View>
          </View>
          <Text style={styles.sectionLabel}>Drop-off</Text>
          <Input label="Drop-off address" placeholder="Same as pickup" value={form.dropoff_address} onChangeText={(v) => set('dropoff_address', v)} leftIcon="location-outline" />
          <View style={styles.row}>
            <View style={{ flex: 1 }}><Input label="Drop-off date" placeholder="YYYY-MM-DD" value={form.dropoff_date} onChangeText={(v) => set('dropoff_date', v)} /></View>
            <View style={{ flex: 1 }}><Input label="Drop-off time" placeholder="10:00" value={form.dropoff_time} onChangeText={(v) => set('dropoff_time', v)} /></View>
          </View>
          <Input label="Booking reference" placeholder="ENT456789" value={form.booking_ref} onChangeText={(v) => set('booking_ref', v)} />
          <Input label="Confirmation number" placeholder="CONF123" value={form.confirmation} onChangeText={(v) => set('confirmation', v)} />
          <Input label="Insurance notes" placeholder="CDW included, SLI purchased..." value={form.insurance_included} onChangeText={(v) => set('insurance_included', v)} />
          <Input label="Notes" value={form.notes} onChangeText={(v) => set('notes', v)} multiline numberOfLines={3} textAlignVertical="top" />
          <Button title={itemId ? 'Save Changes' : 'Add Car Rental'} onPress={handleSave} loading={loading} />
        </ScrollView>
      </View>
      <Modal transparent visible={deleteVisible} animationType="fade" onRequestClose={() => setDeleteVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.confirmModal}>
            <Text style={styles.confirmTitle}>Delete Car Rental?</Text>
            <Text style={styles.confirmBody}>This car rental entry will be permanently removed.</Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setDeleteVisible(false)}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}><Text style={styles.deleteText}>Delete</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  content: { padding: 16, gap: 14 },
  row: { flexDirection: 'row', gap: 10 },
  sectionLabel: { fontFamily: Fonts.semiBold, fontSize: 13, color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 },
  overlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'center', padding: 24 },
  confirmModal: { backgroundColor: Colors.white, borderRadius: 16, padding: 24, gap: 12 },
  confirmTitle: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.text },
  confirmBody: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.muted },
  confirmActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn: { flex: 1, height: 44, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, justifyContent: 'center', alignItems: 'center' },
  cancelText: { fontFamily: Fonts.medium, fontSize: 15, color: Colors.text },
  deleteBtn: { flex: 1, height: 44, borderRadius: 10, backgroundColor: Colors.error, justifyContent: 'center', alignItems: 'center' },
  deleteText: { fontFamily: Fonts.semiBold, fontSize: 15, color: Colors.white },
});
