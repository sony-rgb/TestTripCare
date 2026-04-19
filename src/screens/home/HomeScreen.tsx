import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO, isAfter, isBefore, addDays } from 'date-fns';
import { useAuthStore } from '../../store/authStore';
import { useTripsStore } from '../../store/tripsStore';
import { Trip } from '../../types';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';

const GUIDE_CARDS = [
  { id: 'orlando', title: '8 Days in Orlando', emoji: '🎡', color: '#fef3c7', dest: 'Orlando, FL' },
  { id: 'nyc', title: 'NYC Long Weekend', emoji: '🗽', color: '#dbeafe', dest: 'New York, NY' },
  { id: 'alberta', title: '7 Days in Alberta', emoji: '🏔️', color: '#d1fae5', dest: 'Alberta, Canada' },
  { id: 'eastcoast', title: 'East Coast Road Trip', emoji: '🚗', color: '#ede9fe', dest: 'East Coast, USA' },
];

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { owned, shared, fetchTrips, isLoading } = useTripsStore();

  useEffect(() => { fetchTrips(); }, []);

  const allTrips = [...owned, ...shared];
  const now = new Date();

  const upcomingTrips = allTrips
    .filter((t) => t.status === 'active' && isAfter(parseISO(t.end_date), now))
    .sort((a, b) => parseISO(a.start_date).getTime() - parseISO(b.start_date).getTime())
    .slice(0, 3);

  const firstName = user?.first_name ?? 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchTrips} tintColor={Colors.blue} />}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View>
          <Text style={styles.greeting}>{greeting}, {firstName} 👋</Text>
          <Text style={styles.subGreeting}>Where to next?</Text>
        </View>
        <TouchableOpacity
          style={styles.avatar}
          onPress={() => navigation.navigate('SettingsTab')}
          activeOpacity={0.8}
        >
          <Text style={styles.avatarText}>
            {user ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase() : '?'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Upcoming trips */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Trips</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MyTripsTab')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {upcomingTrips.length === 0 ? (
          <TouchableOpacity
            style={styles.emptyTrips}
            onPress={() => navigation.navigate('MyTripsTab')}
            activeOpacity={0.8}
          >
            <Text style={styles.emptyIcon}>✈️</Text>
            <Text style={styles.emptyTitle}>No upcoming trips</Text>
            <Text style={styles.emptyBody}>Tap to create your first trip</Text>
          </TouchableOpacity>
        ) : (
          upcomingTrips.map((trip) => (
            <UpcomingTripCard
              key={trip.trip_id}
              trip={trip}
              onPress={() => navigation.navigate('MyTripsTab', {
                screen: 'TripDetail',
                params: { tripId: trip.trip_id },
              })}
            />
          ))
        )}
      </View>

      {/* Pre-built itineraries */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Destination Guides</Text>
          <TouchableOpacity onPress={() => navigation.navigate('GuidesTab')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.guidesRow}>
          {GUIDE_CARDS.map((g) => (
            <TouchableOpacity
              key={g.id}
              style={[styles.guideCard, { backgroundColor: g.color }]}
              onPress={() => navigation.navigate('GuidesTab')}
              activeOpacity={0.85}
            >
              <Text style={styles.guideEmoji}>{g.emoji}</Text>
              <Text style={styles.guideTitle}>{g.title}</Text>
              <Text style={styles.guideDest}>{g.dest}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Email ingestion tip */}
      <View style={styles.tipCard}>
        <View style={styles.tipIcon}>
          <Ionicons name="mail" size={20} color={Colors.blue} />
        </View>
        <View style={styles.tipText}>
          <Text style={styles.tipTitle}>Auto-import bookings</Text>
          <Text style={styles.tipBody}>
            Forward confirmation emails to{' '}
            <Text style={styles.tipEmail}>tripcare@tripcare.co</Text>
            {' '}and we'll add them to your trip automatically.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

function UpcomingTripCard({ trip, onPress }: { trip: Trip; onPress: () => void }) {
  const start = format(parseISO(trip.start_date), 'MMM d');
  const end = format(parseISO(trip.end_date), 'MMM d, yyyy');
  return (
    <TouchableOpacity style={styles.upcomingCard} onPress={onPress} activeOpacity={0.88}>
      <View style={styles.upcomingBody}>
        <Text style={styles.upcomingDest}>{trip.destination}</Text>
        <Text style={styles.upcomingName}>{trip.trip_name}</Text>
        <Text style={styles.upcomingDates}>{start} – {end}</Text>
      </View>
      <View style={styles.upcomingDays}>
        <Text style={styles.upcomingDaysNum}>{trip.duration_days}</Text>
        <Text style={styles.upcomingDaysLabel}>days</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.background },
  content: { gap: 24 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 8,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  greeting: { fontFamily: Fonts.bold, fontSize: 22, color: Colors.text },
  subGreeting: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.muted, marginTop: 2 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.blue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.white },

  section: { paddingHorizontal: 16, gap: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontFamily: Fonts.bold, fontSize: 17, color: Colors.text },
  seeAll: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.blue },

  emptyTrips: {
    backgroundColor: Colors.blueBg,
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.blueLight,
    borderStyle: 'dashed',
  },
  emptyIcon: { fontSize: 36 },
  emptyTitle: { fontFamily: Fonts.semiBold, fontSize: 16, color: Colors.text },
  emptyBody: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.muted },

  upcomingCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  upcomingBody: { flex: 1, gap: 2 },
  upcomingDest: { fontFamily: Fonts.medium, fontSize: 12, color: Colors.blue },
  upcomingName: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.text },
  upcomingDates: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.muted },
  upcomingDays: { alignItems: 'center' },
  upcomingDaysNum: { fontFamily: Fonts.bold, fontSize: 24, color: Colors.blue },
  upcomingDaysLabel: { fontFamily: Fonts.regular, fontSize: 11, color: Colors.muted },

  guidesRow: { paddingRight: 4, gap: 12 },
  guideCard: {
    width: 150,
    borderRadius: 14,
    padding: 14,
    gap: 6,
  },
  guideEmoji: { fontSize: 28 },
  guideTitle: { fontFamily: Fonts.semiBold, fontSize: 13, color: Colors.text, lineHeight: 18 },
  guideDest: { fontFamily: Fonts.regular, fontSize: 11, color: Colors.muted },

  tipCard: {
    marginHorizontal: 16,
    backgroundColor: Colors.blueBg,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.blueLight,
  },
  tipIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: Colors.blueLight, justifyContent: 'center', alignItems: 'center' },
  tipText: { flex: 1, gap: 4 },
  tipTitle: { fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.text },
  tipBody: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.muted, lineHeight: 18 },
  tipEmail: { fontFamily: Fonts.medium, color: Colors.blue },
});
