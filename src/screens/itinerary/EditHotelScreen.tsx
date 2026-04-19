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

export default function EditHotelScreen() {
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
    check_in_date: ext.check_in_date ?? itemDate,
    check_out_date: ext.check_out_date ?? '',
    room_type: ext.room_type ?? '',
    meal_plan: ext.meal_plan ?? '',
    parking_info: ext.parking_info ?? '',
    loyalty_number: ext.loyalty_number ?? '',
  });
  const [loading, setLoading] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSave = async () => {
    if (!form.title.trim()) { Alert.alert('Required', 'Please enter a property name.'); return; }
    setLoading(true);
    try {
      const payload = {
        type: 'hotel' as const, trip_id: tripId, day_number: dayNumber, item_date: itemDate,
        title: form.title.trim(), subtitle: form.subtitle.trim() || undefined,
        start_time: form.start_time || undefined, end_time: form.end_time || undefined,
        address: form.address.trim() || undefined, confirmation: form.confirmation.trim() || undefined,
        notes: form.notes.trim() || undefined,
        extended_fields: {
          check_in_date: form.check_in_date, check_out_date: form.check_out_date,
          room_type: form.room_type, meal_plan: form.meal_plan,
          parking_info: form.parking_info, loyalty_number: form.loyalty_number,
        },
      };
      if (itemId) { await updateItem(tripId, itemId, payload); }
      else { await createItem(tripId, payload); }
      navigation.goBack();
    } catch { Alert.alert('Error', 'Could not save lodging.'); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!itemId) return;
    try { await deleteItem(tripId, itemId); setDeleteVisible(false); navigation.goBack(); }
    catch { Alert.alert('Error', 'Could not delete lodging.'); }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader
          title={itemId ? 'Edit Lodging' : 'Add Lodging'}
          rightElement={itemId ? (
            <TouchableOpacity onPress={() => setDeleteVisible(true)}>
              <Ionicons name="trash-outline" size={20} color={Colors.error} />
            </TouchableOpacity>
          ) : undefined}
        />
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]} keyboardShouldPersistTaps="handled">
          <Input label="Property name *" placeholder="Hyatt Regency Orlando" value={form.title} onChangeText={(v) => set('title', v)} />
          <Input label="Subtitle" placeholder="Hotel · 3 nights" value={form.subtitle} onChangeText={(v) => set('subtitle', v)} />
          <Input label="Address" placeholder="9801 International Dr, Orlando, FL" value={form.address} onChangeText={(v) => set('address', v)} leftIcon="location-outline" />
          <View style={styles.row}>
            <View style={{ flex: 1 }}><Input label="Check-in date" placeholder="YYYY-MM-DD" value={form.check_in_date} onChangeText={(v) => set('check_in_date', v)} /></View>
            <View style={{ flex: 1 }}><Input label="Check-out date" placeholder="YYYY-MM-DD" value={form.check_out_date} onChangeText={(v) => set('check_out_date', v)} /></View>
          </View>
          <View style={styles.row}>
            <View style={{ flex: 1 }}><Input label="Check-in time" placeholder="15:00" value={form.start_time} onChangeText={(v) => set('start_time', v)} /></View>
            <View style={{ flex: 1 }}><Input label="Check-out time" placeholder="11:00" value={form.end_time} onChangeText={(v) => set('end_time', v)} /></View>
          </View>
          <Input label="Room type" placeholder="King Suite, Non-smoking" value={form.room_type} onChangeText={(v) => set('room_type', v)} />
          <Input label="Meal plan" placeholder="Breakfast included" value={form.meal_plan} onChangeText={(v) => set('meal_plan', v)} />
          <Input label="Parking" placeholder="Valet included" value={form.parking_info} onChangeText={(v) => set('parking_info', v)} />
          <Input label="Confirmation number" placeholder="CONF123" value={form.confirmation} onChangeText={(v) => set('confirmation', v)} />
          <Input label="Loyalty / rewards number" placeholder="Members #" value={form.loyalty_number} onChangeText={(v) => set('loyalty_number', v)} />
          <Input label="Notes" placeholder="Late check-in arranged..." value={form.notes} onChangeText={(v) => set('notes', v)} multiline numberOfLines={3} textAlignVertical="top" />
          <Button title={itemId ? 'Save Changes' : 'Add Lodging'} onPress={handleSave} loading={loading} />
        </ScrollView>
      </View>
      <Modal transparent visible={deleteVisible} animationType="fade" onRequestClose={() => setDeleteVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.confirmModal}>
            <Text style={styles.confirmTitle}>Delete Lodging?</Text>
            <Text style={styles.confirmBody}>This lodging entry will be permanently removed.</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  content: { padding: 16, gap: 14 },
  row: { flexDirection: 'row', gap: 10 },
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
