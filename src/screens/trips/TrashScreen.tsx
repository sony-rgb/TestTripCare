import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { differenceInDays, parseISO, addDays } from 'date-fns';
import { useTripsStore } from '../../store/tripsStore';
import { Trip } from '../../types';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import ScreenHeader from '../../components/common/ScreenHeader';

export default function TrashScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { trash, fetchTrash, restoreTrip, isLoading } = useTripsStore();

  useEffect(() => { fetchTrash(); }, []);

  const handleRestore = async (trip: Trip) => {
    try {
      await restoreTrip(trip.trip_id);
      Alert.alert('Restored', `"${trip.trip_name}" has been restored.`);
    } catch {
      Alert.alert('Error', 'Could not restore trip.');
    }
  };

  const daysLeft = (trip: Trip) => {
    if (!trip.deleted_at) return 30;
    const deleteDate = addDays(parseISO(trip.deleted_at), 30);
    return Math.max(0, differenceInDays(deleteDate, new Date()));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title="Trash" />
      <FlatList
        data={trash}
        keyExtractor={(item) => item.trip_id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 20 }]}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🗑️</Text>
            <Text style={styles.emptyTitle}>Trash is empty</Text>
            <Text style={styles.emptyBody}>
              Deleted trips appear here for 30 days before being permanently removed.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const remaining = daysLeft(item);
          return (
            <View style={styles.card}>
              <View style={styles.cardBody}>
                <Text style={styles.tripName}>{item.trip_name}</Text>
                <Text style={styles.destination}>{item.destination}</Text>
                <View style={styles.countdownRow}>
                  <Ionicons name="time-outline" size={13} color={remaining <= 5 ? Colors.error : Colors.muted} />
                  <Text style={[styles.countdown, remaining <= 5 && styles.countdownUrgent]}>
                    {remaining === 0
                      ? 'Deletes today'
                      : `${remaining} day${remaining !== 1 ? 's' : ''} until permanent deletion`}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.restoreBtn}
                onPress={() => handleRestore(item)}
                activeOpacity={0.7}
              >
                <Ionicons name="refresh-outline" size={16} color={Colors.blue} />
                <Text style={styles.restoreText}>Restore</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: 16, gap: 12 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyIcon: { fontSize: 40 },
  emptyTitle: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.text },
  emptyBody: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.muted, textAlign: 'center', lineHeight: 20 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  cardBody: { flex: 1, gap: 3 },
  tripName: { fontFamily: Fonts.semiBold, fontSize: 15, color: Colors.text },
  destination: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.muted },
  countdownRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  countdown: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.muted },
  countdownUrgent: { color: Colors.error, fontFamily: Fonts.medium },
  restoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.blue,
  },
  restoreText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.blue },
});
