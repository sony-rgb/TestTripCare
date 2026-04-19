import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTripsStore } from '../../store/tripsStore';
import { Trip } from '../../types';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import TripCard from '../../components/trips/TripCard';
import Input from '../../components/common/Input';

export default function MyTripsScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { owned, shared, fetchTrips, deleteTrip, leaveTrip, isLoading } = useTripsStore();

  const [search, setSearch] = useState('');
  const [actionMenuVisible, setActionMenuVisible] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Trip | null>(null);
  const [leaveConfirm, setLeaveConfirm] = useState<Trip | null>(null);

  useEffect(() => {
    fetchTrips();
  }, []);

  const onRefresh = useCallback(() => { fetchTrips(); }, []);

  const filteredOwned = owned.filter(
    (t) =>
      t.trip_name.toLowerCase().includes(search.toLowerCase()) ||
      t.destination.toLowerCase().includes(search.toLowerCase()),
  );
  const filteredShared = shared.filter(
    (t) =>
      t.trip_name.toLowerCase().includes(search.toLowerCase()) ||
      t.destination.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteTrip(deleteConfirm.trip_id);
      setDeleteConfirm(null);
    } catch {
      Alert.alert('Error', 'Could not delete trip. Please try again.');
    }
  };

  const handleLeave = async () => {
    if (!leaveConfirm) return;
    try {
      await leaveTrip(leaveConfirm.trip_id);
      setLeaveConfirm(null);
    } catch {
      Alert.alert('Error', 'Could not leave trip. Please try again.');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Trips</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setActionMenuVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={22} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Input
          placeholder="Search trips..."
          value={search}
          onChangeText={setSearch}
          leftIcon="search-outline"
          clearable
        />
      </View>

      {/* List */}
      <FlatList
        data={[]}
        ListHeaderComponent={
          <>
            {filteredOwned.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>My Trips</Text>
                {filteredOwned.map((trip) => (
                  <TripCard
                    key={trip.trip_id}
                    trip={trip}
                    onPress={() => navigation.navigate('TripDetail', { tripId: trip.trip_id })}
                    onShare={() => navigation.navigate('ShareTrip', { tripId: trip.trip_id })}
                    onDelete={() => setDeleteConfirm(trip)}
                  />
                ))}
              </>
            )}

            {filteredShared.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Shared with Me</Text>
                {filteredShared.map((trip) => (
                  <TripCard
                    key={trip.trip_id}
                    trip={trip}
                    isShared
                    onPress={() => navigation.navigate('TripDetail', { tripId: trip.trip_id })}
                    onLeave={() => setLeaveConfirm(trip)}
                  />
                ))}
              </>
            )}

            {filteredOwned.length === 0 && filteredShared.length === 0 && !isLoading && (
              <View style={styles.empty}>
                <Text style={styles.emptyIcon}>✈️</Text>
                <Text style={styles.emptyTitle}>No trips yet</Text>
                <Text style={styles.emptyBody}>
                  Tap + to create your first trip, join a shared trip, or import from a spreadsheet.
                </Text>
              </View>
            )}
          </>
        }
        renderItem={() => null}
        keyExtractor={() => ''}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 20 }]}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={Colors.blue} />
        }
      />

      {/* Action Menu Modal */}
      <Modal
        transparent
        visible={actionMenuVisible}
        animationType="slide"
        onRequestClose={() => setActionMenuVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setActionMenuVisible(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Add Trip</Text>

            {[
              { label: 'Create a New Trip', icon: 'add-circle-outline', action: () => { setActionMenuVisible(false); navigation.navigate('AddTrip'); } },
              { label: 'Join a Shared Trip', icon: 'qr-code-outline', action: () => { setActionMenuVisible(false); navigation.navigate('JoinTrip'); } },
              { label: 'Import from Excel / Google Sheets', icon: 'document-text-outline', action: () => { setActionMenuVisible(false); /* TODO import flow */ } },
            ].map((item) => (
              <TouchableOpacity
                key={item.label}
                style={styles.sheetOption}
                onPress={item.action}
                activeOpacity={0.7}
              >
                <View style={styles.sheetOptionIcon}>
                  <Ionicons name={item.icon as any} size={20} color={Colors.blue} />
                </View>
                <Text style={styles.sheetOptionText}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.muted} />
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal transparent visible={!!deleteConfirm} animationType="fade" onRequestClose={() => setDeleteConfirm(null)}>
        <View style={styles.overlay}>
          <View style={styles.confirmModal}>
            <Text style={styles.confirmIcon}>🗑️</Text>
            <Text style={styles.confirmTitle}>Delete Trip?</Text>
            <Text style={styles.confirmBody}>
              "{deleteConfirm?.trip_name}" will be moved to Trash and permanently deleted after 30 days.
            </Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setDeleteConfirm(null)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Leave Confirm Modal */}
      <Modal transparent visible={!!leaveConfirm} animationType="fade" onRequestClose={() => setLeaveConfirm(null)}>
        <View style={styles.overlay}>
          <View style={styles.confirmModal}>
            <Text style={styles.confirmIcon}>👋</Text>
            <Text style={styles.confirmTitle}>Leave Trip?</Text>
            <Text style={styles.confirmBody}>
              You'll lose access to "{leaveConfirm?.trip_name}". The trip owner will be notified.
            </Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setLeaveConfirm(null)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={handleLeave}>
                <Text style={styles.deleteText}>Leave</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { fontFamily: Fonts.bold, fontSize: 22, color: Colors.text },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.blue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: { padding: 12, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border },
  list: { paddingHorizontal: 16, paddingTop: 16 },
  sectionTitle: { fontFamily: Fonts.semiBold, fontSize: 13, color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },

  empty: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontFamily: Fonts.bold, fontSize: 20, color: Colors.text },
  emptyBody: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.muted, textAlign: 'center', lineHeight: 20, paddingHorizontal: 24 },

  overlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  sheet: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36, gap: 12 },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: 8 },
  sheetTitle: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.text, marginBottom: 4 },
  sheetOption: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: Colors.border },
  sheetOptionIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.blueBg, justifyContent: 'center', alignItems: 'center' },
  sheetOptionText: { flex: 1, fontFamily: Fonts.medium, fontSize: 15, color: Colors.text },

  confirmModal: { margin: 24, backgroundColor: Colors.white, borderRadius: 20, padding: 24, alignItems: 'center', gap: 12 },
  confirmIcon: { fontSize: 40 },
  confirmTitle: { fontFamily: Fonts.bold, fontSize: 20, color: Colors.text },
  confirmBody: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.muted, textAlign: 'center', lineHeight: 20 },
  confirmActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  cancelBtn: { flex: 1, height: 44, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, justifyContent: 'center', alignItems: 'center' },
  cancelText: { fontFamily: Fonts.medium, fontSize: 15, color: Colors.text },
  deleteBtn: { flex: 1, height: 44, borderRadius: 10, backgroundColor: Colors.error, justifyContent: 'center', alignItems: 'center' },
  deleteText: { fontFamily: Fonts.semiBold, fontSize: 15, color: Colors.white },
});
