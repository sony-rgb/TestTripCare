import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Trip } from '../../types';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { format, parseISO } from 'date-fns';

interface TripCardProps {
  trip: Trip;
  onPress: () => void;
  onShare?: () => void;
  onDelete?: () => void;
  onLeave?: () => void;
  isShared?: boolean;
}

export default function TripCard({
  trip,
  onPress,
  onShare,
  onDelete,
  onLeave,
  isShared = false,
}: TripCardProps) {
  const startDate = formatDate(trip.start_date);
  const endDate = formatDate(trip.end_date);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {/* Main content */}
      <View style={styles.body}>
        {/* Destination pill */}
        <View style={styles.destRow}>
          <Ionicons name="location" size={13} color={Colors.blue} />
          <Text style={styles.destination}>{trip.destination}</Text>
          {isShared && (
            <View style={[
              styles.permBadge,
              trip.user_permission === 'edit' ? styles.editBadge : styles.viewBadge,
            ]}>
              <Text style={[
                styles.permText,
                trip.user_permission === 'edit' ? styles.editText : styles.viewText,
              ]}>
                {trip.user_permission?.toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.tripName} numberOfLines={2}>{trip.trip_name}</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={12} color={Colors.muted} />
            <Text style={styles.metaText}>{startDate} – {endDate}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={12} color={Colors.muted} />
            <Text style={styles.metaText}>
              {trip.duration_days} day{trip.duration_days !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        {isShared && trip.owner_name && (
          <Text style={styles.ownerText}>by {trip.owner_name}</Text>
        )}

        {!isShared && (trip.shared_count ?? 0) > 0 && (
          <View style={styles.sharedWith}>
            <Ionicons name="people-outline" size={12} color={Colors.muted} />
            <Text style={styles.sharedWithText}>
              Shared with {trip.shared_count} {trip.shared_count === 1 ? 'person' : 'people'}
            </Text>
          </View>
        )}
      </View>

      {/* Action strip */}
      <View style={styles.actions}>
        {isShared ? (
          <TouchableOpacity style={styles.actionBtn} onPress={onLeave} activeOpacity={0.7}>
            <Ionicons name="exit-outline" size={14} color={Colors.error} />
            <Text style={[styles.actionText, { color: Colors.error }]}>Leave Trip</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity style={styles.actionBtn} onPress={onShare} activeOpacity={0.7}>
              <Ionicons name="share-outline" size={14} color={Colors.blue} />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
            <View style={styles.actionDivider} />
            <TouchableOpacity style={styles.actionBtn} onPress={onDelete} activeOpacity={0.7}>
              <Ionicons name="trash-outline" size={14} color={Colors.error} />
              <Text style={[styles.actionText, { color: Colors.error }]}>Delete</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

function formatDate(dateStr: string) {
  try {
    return format(parseISO(dateStr), 'MMM d, yyyy');
  } catch {
    return dateStr;
  }
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  body: { padding: 16, gap: 6 },

  destRow: { flexDirection: 'row', alignItems: 'center', gap: 5, flexWrap: 'wrap' },
  destination: { fontFamily: Fonts.medium, fontSize: 12, color: Colors.blue },

  permBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 4,
  },
  viewBadge: { backgroundColor: Colors.viewBadgeBg },
  editBadge: { backgroundColor: Colors.editBadgeBg },
  permText: { fontFamily: Fonts.bold, fontSize: 10 },
  viewText: { color: Colors.viewBadgeText },
  editText: { color: Colors.editBadgeText },

  tripName: {
    fontFamily: Fonts.bold,
    fontSize: 17,
    color: Colors.text,
    lineHeight: 22,
  },
  metaRow: { flexDirection: 'row', gap: 14, flexWrap: 'wrap', marginTop: 2 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.muted },

  ownerText: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.muted },
  sharedWith: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sharedWithText: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.muted },

  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 11,
  },
  actionText: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: Colors.blue,
  },
  actionDivider: { width: 1, backgroundColor: Colors.border },
});
