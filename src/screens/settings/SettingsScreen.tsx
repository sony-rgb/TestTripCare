import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';

interface SettingRow {
  icon: string;
  label: string;
  action?: () => void;
  value?: boolean;
  onToggle?: (v: boolean) => void;
  destructive?: boolean;
  badge?: string;
}

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { user, logout, updateUser } = useAuthStore();

  const [notifPrefs, setNotifPrefs] = useState({
    flight_reminder: user?.notification_prefs?.flight_reminder ?? true,
    hotel_reminder: user?.notification_prefs?.hotel_reminder ?? true,
    car_reminder: user?.notification_prefs?.car_reminder ?? true,
    activity_reminder: user?.notification_prefs?.activity_reminder ?? true,
    email_parsed: user?.notification_prefs?.email_parsed ?? true,
    trip_shared: user?.notification_prefs?.trip_shared ?? true,
    deal_alert: user?.notification_prefs?.deal_alert ?? false,
    trip_reminder: user?.notification_prefs?.trip_reminder ?? true,
  });

  const toggleNotif = (key: keyof typeof notifPrefs) => (value: boolean) => {
    const updated = { ...notifPrefs, [key]: value };
    setNotifPrefs(updated);
    updateUser({ notification_prefs: { ...user?.notification_prefs, ...updated } });
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const accountRows: SettingRow[] = [
    { icon: 'person-outline', label: 'Edit Profile', action: () => navigation.navigate('Profile') },
    { icon: 'mail-outline', label: 'Email Address', badge: user?.email, action: () => navigation.navigate('Profile') },
    { icon: 'shield-outline', label: 'Change Password', action: () => {} },
    { icon: 'trash-outline', label: 'Trash', action: () => navigation.navigate('Trash') },
  ];

  const notifRows: Array<{ key: keyof typeof notifPrefs; label: string }> = [
    { key: 'flight_reminder', label: 'Flight reminders' },
    { key: 'hotel_reminder', label: 'Hotel reminders' },
    { key: 'car_reminder', label: 'Car rental reminders' },
    { key: 'activity_reminder', label: 'Activity reminders' },
    { key: 'trip_reminder', label: 'Trip start reminders' },
    { key: 'email_parsed', label: 'Email ingestion alerts' },
    { key: 'trip_shared', label: 'Trip shared / revoked' },
    { key: 'deal_alert', label: 'Deal alerts' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile card */}
        <TouchableOpacity
          style={styles.profileCard}
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.85}
        >
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>
              {user ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase() : '?'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.first_name} {user?.last_name}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.muted} />
        </TouchableOpacity>

        {/* Account section */}
        <SectionCard title="Account">
          {accountRows.map((row, i) => (
            <SettingRowItem
              key={row.label}
              row={row}
              isLast={i === accountRows.length - 1}
            />
          ))}
        </SectionCard>

        {/* Email ingestion info */}
        <View style={styles.infoCard}>
          <Ionicons name="mail" size={16} color={Colors.blue} />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>Auto-import bookings</Text>
            <Text style={styles.infoBody}>
              Forward booking confirmations to{' '}
              <Text style={styles.infoEmail}>tripcare@tripcare.co</Text>
            </Text>
          </View>
        </View>

        {/* Notifications section */}
        <SectionCard title="Notifications">
          {notifRows.map((row, i) => (
            <View
              key={row.key}
              style={[styles.row, i < notifRows.length - 1 && styles.rowBorder]}
            >
              <Text style={styles.rowLabel}>{row.label}</Text>
              <Switch
                value={notifPrefs[row.key]}
                onValueChange={toggleNotif(row.key)}
                trackColor={{ false: Colors.border, true: Colors.blue }}
                thumbColor={Colors.white}
              />
            </View>
          ))}
        </SectionCard>

        {/* About section */}
        <SectionCard title="About">
          {[
            { icon: 'document-text-outline', label: 'Terms of Service', action: () => {} },
            { icon: 'shield-checkmark-outline', label: 'Privacy Policy', action: () => {} },
            { icon: 'information-circle-outline', label: 'App Version', badge: '1.0.0' },
          ].map((row, i, arr) => (
            <SettingRowItem key={row.label} row={row as SettingRow} isLast={i === arr.length - 1} />
          ))}
        </SectionCard>

        {/* Log out */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={18} color={Colors.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function SettingRowItem({ row, isLast }: { row: SettingRow; isLast: boolean }) {
  return (
    <TouchableOpacity
      style={[styles.row, !isLast && styles.rowBorder]}
      onPress={row.action}
      activeOpacity={row.action ? 0.7 : 1}
      disabled={!row.action}
    >
      <View style={styles.rowLeft}>
        <Ionicons name={row.icon as any} size={18} color={row.destructive ? Colors.error : Colors.muted} style={styles.rowIcon} />
        <Text style={[styles.rowLabel, row.destructive && styles.rowLabelDestructive]}>{row.label}</Text>
      </View>
      <View style={styles.rowRight}>
        {row.badge && <Text style={styles.rowBadge} numberOfLines={1}>{row.badge}</Text>}
        {row.action && !row.onToggle && <Ionicons name="chevron-forward" size={16} color={Colors.muted} />}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: { fontFamily: Fonts.bold, fontSize: 22, color: Colors.text },
  content: { padding: 16, gap: 16 },

  profileCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  profileAvatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.blue, justifyContent: 'center', alignItems: 'center' },
  profileAvatarText: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.white },
  profileInfo: { flex: 1 },
  profileName: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.text },
  profileEmail: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.muted, marginTop: 2 },

  infoCard: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: Colors.blueBg,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.blueLight,
    alignItems: 'flex-start',
  },
  infoText: { flex: 1, gap: 2 },
  infoTitle: { fontFamily: Fonts.semiBold, fontSize: 13, color: Colors.text },
  infoBody: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.muted },
  infoEmail: { fontFamily: Fonts.medium, color: Colors.blue },

  sectionCard: { gap: 8 },
  sectionTitle: { fontFamily: Fonts.semiBold, fontSize: 12, color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.5, paddingLeft: 4 },
  sectionBody: { backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },

  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  rowIcon: { marginRight: 10 },
  rowLabel: { fontFamily: Fonts.regular, fontSize: 15, color: Colors.text },
  rowLabelDestructive: { color: Colors.error },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6, maxWidth: 180 },
  rowBadge: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.muted, flexShrink: 1 },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.errorLight,
    backgroundColor: Colors.white,
  },
  logoutText: { fontFamily: Fonts.semiBold, fontSize: 15, color: Colors.error },
});
