import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { useNotificationsStore } from '../../store/notificationsStore';
import { Notification, AlertType } from '../../types';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';

const FILTER_TABS: Array<{ label: string; types: AlertType[] | null }> = [
  { label: 'All', types: null },
  { label: 'Flights', types: ['flight_reminder'] },
  { label: 'Trips', types: ['trip_reminder', 'trip_shared', 'collaborator_edit'] },
  { label: 'Emails', types: ['email_parsed', 'email_failed'] },
  { label: 'Deals', types: ['deal_alert'] },
];

const ALERT_ICONS: Record<string, { icon: string; color: string }> = {
  flight_reminder: { icon: 'airplane', color: Colors.flightText },
  hotel_reminder: { icon: 'bed', color: Colors.hotelText },
  car_reminder: { icon: 'car', color: Colors.carText },
  activity_reminder: { icon: 'ticket', color: Colors.activityText },
  email_parsed: { icon: 'mail', color: Colors.blue },
  email_failed: { icon: 'mail-unread', color: Colors.error },
  trip_shared: { icon: 'people', color: Colors.blue },
  permission_changed: { icon: 'shield-checkmark', color: Colors.success },
  collaborator_edit: { icon: 'pencil', color: Colors.muted },
  deal_alert: { icon: 'pricetag', color: Colors.warning },
  trip_reminder: { icon: 'calendar', color: Colors.blue },
};

export default function AlertsScreen() {
  const insets = useSafeAreaInsets();
  const { notifications, unreadCount, fetch, markRead, markAllRead, isLoading } = useNotificationsStore();
  const [activeFilter, setActiveFilter] = useState(0);

  useEffect(() => { fetch(); }, []);

  const filtered = activeFilter === 0
    ? notifications
    : notifications.filter((n) => FILTER_TABS[activeFilter].types?.includes(n.type));

  const handlePress = async (notif: Notification) => {
    if (!notif.is_read) { await markRead(notif.notif_id); }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Alerts</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={styles.markAll}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter tabs */}
      <View style={styles.tabs}>
        {FILTER_TABS.map((tab, i) => (
          <TouchableOpacity
            key={tab.label}
            style={[styles.tab, activeFilter === i && styles.tabActive]}
            onPress={() => setActiveFilter(i)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeFilter === i && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.notif_id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 20 }]}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetch} tintColor={Colors.blue} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>No alerts</Text>
            <Text style={styles.emptyBody}>
              We'll notify you about flight check-ins, trip reminders, and more.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const iconCfg = ALERT_ICONS[item.type] ?? { icon: 'notifications', color: Colors.blue };
          return (
            <TouchableOpacity
              style={[styles.alertItem, !item.is_read && styles.alertItemUnread]}
              onPress={() => handlePress(item)}
              activeOpacity={0.8}
            >
              <View style={[styles.alertIcon, { backgroundColor: `${iconCfg.color}20` }]}>
                <Ionicons name={iconCfg.icon as any} size={18} color={iconCfg.color} />
              </View>
              <View style={styles.alertBody}>
                <Text style={styles.alertTitle}>{item.title}</Text>
                <Text style={styles.alertMsg} numberOfLines={2}>{item.body}</Text>
                <Text style={styles.alertTime}>{formatTime(item.created_at)}</Text>
              </View>
              {!item.is_read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

function formatTime(ts: string) {
  try { return format(parseISO(ts), 'MMM d, h:mm a'); }
  catch { return ''; }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: { fontFamily: Fonts.bold, fontSize: 22, color: Colors.text },
  markAll: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.blue },

  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  tab: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999, backgroundColor: Colors.background },
  tabActive: { backgroundColor: Colors.blue },
  tabText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.muted },
  tabTextActive: { color: Colors.white },

  list: { paddingTop: 8 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 10, paddingHorizontal: 32 },
  emptyIcon: { fontSize: 40 },
  emptyTitle: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.text },
  emptyBody: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.muted, textAlign: 'center', lineHeight: 20 },

  alertItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  alertItemUnread: { backgroundColor: Colors.blueBg },
  alertIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  alertBody: { flex: 1, gap: 2 },
  alertTitle: { fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.text },
  alertMsg: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.muted, lineHeight: 18 },
  alertTime: { fontFamily: Fonts.regular, fontSize: 11, color: Colors.mutedLight, marginTop: 2 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.blue, marginTop: 6 },
});
