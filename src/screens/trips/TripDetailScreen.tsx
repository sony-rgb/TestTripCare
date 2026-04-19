import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO, addDays } from 'date-fns';
import { useTripsStore } from '../../store/tripsStore';
import { useAuthStore } from '../../store/authStore';
import { ItineraryItem, ItemType } from '../../types';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import EventCard from '../../components/trips/EventCard';
import AddItemModal from '../../components/trips/AddItemModal';

type RouteParams = { tripId: string };

const EDIT_SCREEN: Record<ItemType, string> = {
  flight: 'EditFlight',
  hotel: 'EditHotel',
  car: 'EditCar',
  activity: 'EditActivity',
  cruise: 'EditActivity',
};

export default function TripDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const { tripId } = route.params;
  const insets = useSafeAreaInsets();

  const { currentTrip, currentItems, fetchTripDetail, isLoading } = useTripsStore();
  const { user } = useAuthStore();
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [activeDay, setActiveDay] = useState(0);

  useEffect(() => {
    fetchTripDetail(tripId);
  }, [tripId]);

  const onRefresh = useCallback(() => fetchTripDetail(tripId), [tripId]);

  if (!currentTrip) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading trip…</Text>
        </View>
      </View>
    );
  }

  const permission = currentTrip.user_permission ?? 'owner';
  const canEdit = permission === 'owner' || permission === 'edit';

  // Build day tabs
  const days = buildDays(currentTrip.start_date, currentTrip.duration_days);

  // Group items by day_number
  const itemsByDay = currentItems.reduce<Record<number, ItineraryItem[]>>((acc, item) => {
    const d = item.day_number;
    if (!acc[d]) acc[d] = [];
    acc[d].push(item);
    return acc;
  }, {});

  const dayItems = (itemsByDay[activeDay + 1] ?? []).sort((a, b) => a.sort_order - b.sort_order);

  const handleAddItem = (type: ItemType) => {
    const dayInfo = days[activeDay];
    navigation.navigate(EDIT_SCREEN[type], {
      tripId,
      dayNumber: activeDay + 1,
      itemDate: dayInfo.isoDate,
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.tripName} numberOfLines={1}>{currentTrip.trip_name}</Text>
          <Text style={styles.tripDest}>{currentTrip.destination}</Text>
        </View>

        <View style={styles.headerRight}>
          {/* Sharing pill */}
          <TouchableOpacity
            style={styles.sharePill}
            onPress={() => navigation.navigate('ShareTrip', { tripId })}
            activeOpacity={0.7}
          >
            <Ionicons name="people-outline" size={14} color={Colors.blue} />
            <Text style={styles.sharePillText}>
              {currentTrip.shared_count ?? 0}
            </Text>
          </TouchableOpacity>

          {/* Permission badge */}
          <View style={[
            styles.permBadge,
            permission === 'owner' ? styles.ownerBadge : null,
          ]}>
            <Text style={styles.permText}>
              {permission === 'owner' ? 'Owner' : permission === 'edit' ? 'Editor' : 'Viewer'}
            </Text>
          </View>
        </View>
      </View>

      {/* Day tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.dayTabsScroll}
        contentContainerStyle={styles.dayTabs}
      >
        {days.map((day, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.dayTab, activeDay === i && styles.dayTabActive]}
            onPress={() => setActiveDay(i)}
            activeOpacity={0.7}
          >
            <Text style={[styles.dayTabNum, activeDay === i && styles.dayTabNumActive]}>
              Day {i + 1}
            </Text>
            <Text style={[styles.dayTabDate, activeDay === i && styles.dayTabDateActive]}>
              {day.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Items for active day */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={Colors.blue} />
        }
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.dayFullDate}>{days[activeDay]?.fullDate ?? ''}</Text>

        {dayItems.length === 0 && (
          <View style={styles.emptyDay}>
            <Text style={styles.emptyDayIcon}>📅</Text>
            <Text style={styles.emptyDayText}>Nothing planned yet</Text>
            {canEdit && (
              <Text style={styles.emptyDayHint}>Tap "Add to this day" below to get started</Text>
            )}
          </View>
        )}

        {dayItems.map((item) => (
          <EventCard
            key={item.item_id}
            item={item}
            tripId={tripId}
            userPermission={permission}
            onEdit={() =>
              navigation.navigate(EDIT_SCREEN[item.type], {
                tripId,
                itemId: item.item_id,
                dayNumber: item.day_number,
                itemDate: item.item_date,
              })
            }
            onMapPress={() =>
              item.address &&
              navigation.navigate('MapView', {
                address: item.address,
                label: item.title,
                lat: item.lat,
                lng: item.lng,
              })
            }
          />
        ))}
      </ScrollView>

      {/* Add to this day FAB */}
      {canEdit && (
        <TouchableOpacity
          style={[styles.fab, { bottom: insets.bottom + 16 }]}
          onPress={() => setAddModalVisible(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={18} color={Colors.white} />
          <Text style={styles.fabText}>Add to this day</Text>
        </TouchableOpacity>
      )}

      <AddItemModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSelect={handleAddItem}
      />
    </View>
  );
}

function buildDays(startDate: string, durationDays: number) {
  const result = [];
  for (let i = 0; i < durationDays; i++) {
    const date = addDays(parseISO(startDate), i);
    result.push({
      label: format(date, 'MMM d'),
      fullDate: format(date, 'EEEE, MMMM d'),
      isoDate: format(date, 'yyyy-MM-dd'),
    });
  }
  return result;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.muted },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 10,
  },
  headerCenter: { flex: 1 },
  tripName: { fontFamily: Fonts.bold, fontSize: 17, color: Colors.text },
  tripDest: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.muted },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sharePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.blueBg,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  sharePillText: { fontFamily: Fonts.medium, fontSize: 12, color: Colors.blue },
  permBadge: {
    backgroundColor: Colors.blueBg,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  ownerBadge: { backgroundColor: '#fef3c7' },
  permText: { fontFamily: Fonts.semiBold, fontSize: 11, color: Colors.text },

  dayTabsScroll: { backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border },
  dayTabs: { paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  dayTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  dayTabActive: { backgroundColor: Colors.blue },
  dayTabNum: { fontFamily: Fonts.semiBold, fontSize: 12, color: Colors.muted },
  dayTabNumActive: { color: Colors.white },
  dayTabDate: { fontFamily: Fonts.regular, fontSize: 11, color: Colors.muted, marginTop: 1 },
  dayTabDateActive: { color: 'rgba(255,255,255,0.85)' },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },
  dayFullDate: { fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.muted, marginBottom: 14 },

  emptyDay: { alignItems: 'center', paddingTop: 40, gap: 8 },
  emptyDayIcon: { fontSize: 36 },
  emptyDayText: { fontFamily: Fonts.semiBold, fontSize: 16, color: Colors.text },
  emptyDayHint: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.muted, textAlign: 'center' },

  fab: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: Colors.blue,
    borderRadius: 14,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  fabText: { fontFamily: Fonts.semiBold, fontSize: 15, color: Colors.white },
});
