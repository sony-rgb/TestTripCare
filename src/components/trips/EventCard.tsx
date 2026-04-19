import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ItineraryItem, ItemType } from '../../types';
import { Colors, EventColors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const TYPE_LABELS: Record<ItemType, string> = {
  flight: 'Flight',
  hotel: 'Lodging',
  car: 'Car Rental',
  activity: 'Activity',
  cruise: 'Cruise',
};

const TYPE_ICONS: Record<ItemType, string> = {
  flight: 'airplane',
  hotel: 'bed',
  car: 'car',
  activity: 'ticket',
  cruise: 'boat',
};

interface EventCardProps {
  item: ItineraryItem;
  tripId: string;
  userPermission?: 'view' | 'edit' | 'owner';
  onEdit?: () => void;
  onMapPress?: () => void;
}

export default function EventCard({
  item,
  tripId,
  userPermission = 'view',
  onEdit,
  onMapPress,
}: EventCardProps) {
  const [expanded, setExpanded] = useState(false);
  const rotation = useRef(new Animated.Value(0)).current;

  const canEdit = userPermission === 'owner' || userPermission === 'edit';
  const palette = EventColors[item.type] ?? EventColors.activity;
  const ext = (item.extended_fields ?? {}) as Record<string, string>;

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Animated.timing(rotation, {
      toValue: expanded ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setExpanded(!expanded);
  };

  const chevronRotation = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  // Build detail rows from extended_fields + base fields
  const detailRows = buildDetailRows(item, ext);

  return (
    <View style={styles.card}>
      {/* Collapsed header — always visible */}
      <TouchableOpacity
        onPress={toggle}
        activeOpacity={0.85}
        style={styles.header}
      >
        {/* Type badge */}
        <View style={[styles.badge, { backgroundColor: palette.bg }]}>
          <Ionicons name={TYPE_ICONS[item.type] as any} size={14} color={palette.text} />
          <Text style={[styles.badgeText, { color: palette.text }]}>
            {TYPE_LABELS[item.type]}
          </Text>
        </View>

        <View style={styles.headerBody}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.meta} numberOfLines={1}>
            {[item.start_time, item.subtitle].filter(Boolean).join(' · ')}
          </Text>
        </View>

        <Animated.View style={{ transform: [{ rotate: chevronRotation }] }}>
          <Ionicons name="chevron-down" size={18} color={Colors.muted} />
        </Animated.View>
      </TouchableOpacity>

      {/* Expanded detail */}
      {expanded && (
        <View style={styles.body}>
          {/* Detail rows in pairs */}
          {detailRows.map((row, i) => (
            <View key={i} style={styles.detailRow}>
              {row.map((field, j) => (
                <View key={j} style={styles.detailField}>
                  <Text style={styles.fieldLabel}>{field.label}</Text>
                  <Text style={styles.fieldValue}>{field.value || '—'}</Text>
                </View>
              ))}
            </View>
          ))}

          {/* Address link */}
          {item.address && (
            <TouchableOpacity
              style={styles.addressRow}
              onPress={onMapPress}
              activeOpacity={0.7}
            >
              <Ionicons name="location-outline" size={14} color={Colors.blue} />
              <Text style={styles.addressText} numberOfLines={2}>{item.address}</Text>
            </TouchableOpacity>
          )}

          {/* Confirmation pill */}
          {item.confirmation && (
            <View style={styles.confirmRow}>
              <Ionicons name="bookmark-outline" size={13} color={Colors.muted} />
              <Text style={styles.confirmLabel}>Confirmation</Text>
              <View style={styles.confirmPill}>
                <Text style={styles.confirmPillText}>{item.confirmation}</Text>
              </View>
            </View>
          )}

          {/* Notes */}
          {item.notes && (
            <View style={styles.notesRow}>
              <Text style={styles.notesLabel}>Notes</Text>
              <Text style={styles.notesText}>{item.notes}</Text>
            </View>
          )}

          {/* Actions */}
          {(canEdit || item.address) && (
            <View style={styles.actions}>
              {item.address && (
                <TouchableOpacity style={styles.actionBtn} onPress={onMapPress} activeOpacity={0.7}>
                  <Ionicons name="map-outline" size={15} color={Colors.blue} />
                  <Text style={styles.actionBtnText}>Map</Text>
                </TouchableOpacity>
              )}
              {canEdit && (
                <TouchableOpacity style={styles.actionBtn} onPress={onEdit} activeOpacity={0.7}>
                  <Ionicons name="pencil-outline" size={15} color={Colors.blue} />
                  <Text style={styles.actionBtnText}>Edit</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

type DetailField = { label: string; value: string };

function buildDetailRows(
  item: ItineraryItem,
  ext: Record<string, string>,
): DetailField[][] {
  const fields: DetailField[] = [];

  if (item.type === 'flight') {
    if (ext.airline) fields.push({ label: 'Airline', value: ext.airline });
    if (ext.flight_number) fields.push({ label: 'Flight', value: ext.flight_number });
    if (ext.from_airport) fields.push({ label: 'From', value: ext.from_airport });
    if (ext.to_airport) fields.push({ label: 'To', value: ext.to_airport });
    if (item.start_time) fields.push({ label: 'Departs', value: item.start_time });
    if (item.end_time) fields.push({ label: 'Arrives', value: item.end_time });
    if (ext.from_terminal) fields.push({ label: 'Terminal', value: ext.from_terminal });
    if (ext.seat_numbers) fields.push({ label: 'Seats', value: ext.seat_numbers });
  } else if (item.type === 'hotel') {
    if (item.start_time) fields.push({ label: 'Check-in', value: item.start_time });
    if (item.end_time) fields.push({ label: 'Check-out', value: item.end_time });
    if (ext.room_type) fields.push({ label: 'Room', value: ext.room_type });
    if (ext.meal_plan) fields.push({ label: 'Meal plan', value: ext.meal_plan });
  } else if (item.type === 'car') {
    if (ext.company) fields.push({ label: 'Company', value: ext.company });
    if (ext.vehicle_type) fields.push({ label: 'Vehicle', value: ext.vehicle_type });
    if (item.start_time) fields.push({ label: 'Pickup', value: item.start_time });
    if (item.end_time) fields.push({ label: 'Drop-off', value: item.end_time });
  } else if (item.type === 'activity') {
    if (ext.category) fields.push({ label: 'Category', value: ext.category });
    if (item.start_time) fields.push({ label: 'Start', value: item.start_time });
    if (ext.duration) fields.push({ label: 'Duration', value: ext.duration });
    if (ext.cost) fields.push({ label: 'Cost', value: ext.cost });
  }

  // Pair into rows of 2
  const rows: DetailField[][] = [];
  for (let i = 0; i < fields.length; i += 2) {
    rows.push(fields.slice(i, i + 2));
  }
  return rows;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: { fontFamily: Fonts.medium, fontSize: 11 },
  headerBody: { flex: 1 },
  title: { fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.text },
  meta: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.muted, marginTop: 1 },

  body: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 10,
  },
  detailRow: { flexDirection: 'row', gap: 12, marginTop: 10 },
  detailField: { flex: 1 },
  fieldLabel: { fontFamily: Fonts.regular, fontSize: 11, color: Colors.muted, marginBottom: 2 },
  fieldValue: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.text },

  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: Colors.blueBg,
    borderRadius: 8,
    padding: 10,
  },
  addressText: { flex: 1, fontFamily: Fonts.medium, fontSize: 13, color: Colors.blue, lineHeight: 18 },

  confirmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  confirmLabel: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.muted },
  confirmPill: {
    backgroundColor: Colors.blueBg,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  confirmPillText: { fontFamily: Fonts.medium, fontSize: 12, color: Colors.blue },

  notesRow: { gap: 4 },
  notesLabel: { fontFamily: Fonts.medium, fontSize: 12, color: Colors.muted },
  notesText: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.text, lineHeight: 18 },

  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
    justifyContent: 'flex-end',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.blue,
  },
  actionBtnText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.blue },
});
