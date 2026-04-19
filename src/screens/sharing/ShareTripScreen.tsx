import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, Modal, Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTripsStore } from '../../store/tripsStore';
import { TripShare } from '../../types';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import ScreenHeader from '../../components/common/ScreenHeader';

type RouteParams = { tripId: string };

export default function ShareTripScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const { tripId } = route.params;
  const insets = useSafeAreaInsets();

  const { currentTrip, currentShares, fetchShares, shareByEmail, updatePermission, revokeAccess } = useTripsStore();
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<'view' | 'edit'>('view');
  const [loading, setLoading] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<TripShare | null>(null);

  useEffect(() => { fetchShares(tripId); }, [tripId]);

  const handleShare = async () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert('Invalid email', 'Please enter a valid TripCare email address.');
      return;
    }
    setLoading(true);
    try {
      await shareByEmail(tripId, email.toLowerCase().trim(), permission);
      setEmail('');
      Alert.alert('Shared!', `Trip shared with ${email}.`);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Could not share trip.');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    try {
      await revokeAccess(tripId, revokeTarget.share_id);
      setRevokeTarget(null);
    } catch {
      Alert.alert('Error', 'Could not revoke access.');
    }
  };

  const handlePermissionChange = async (share: TripShare) => {
    const newPerm = share.permission === 'view' ? 'edit' : 'view';
    try {
      await updatePermission(tripId, share.share_id, newPerm);
    } catch {
      Alert.alert('Error', 'Could not update permission.');
    }
  };

  const shareCode = currentTrip?.share_code ?? '—';

  const getInitials = (name?: string) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    return parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : parts[0][0].toUpperCase();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title="Share Trip" />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Trip code */}
        <View style={styles.codeCard}>
          <View style={styles.codeHeader}>
            <Ionicons name="qr-code-outline" size={18} color={Colors.blue} />
            <Text style={styles.codeTitle}>Trip Code</Text>
          </View>
          <Text style={styles.code}>{shareCode}</Text>
          <Text style={styles.codeHint}>
            Share this code with anyone on TripCare. They'll be added with View permission.
          </Text>
        </View>

        {/* Share by email */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Share by Email</Text>
          <Input
            placeholder="colleague@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            leftIcon="mail-outline"
            clearable
          />

          {/* Permission picker */}
          <View style={styles.permRow}>
            <Text style={styles.permLabel}>Permission:</Text>
            <View style={styles.permToggle}>
              {(['view', 'edit'] as const).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.permOption, permission === p && styles.permOptionActive]}
                  onPress={() => setPermission(p)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.permOptionText, permission === p && styles.permOptionTextActive]}>
                    {p === 'view' ? 'View' : 'Edit'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Button title="Send Invite" onPress={handleShare} loading={loading} />
        </View>

        {/* Shared with */}
        {currentShares.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shared with ({currentShares.length})</Text>
            {currentShares.map((share) => (
              <View key={share.share_id} style={styles.shareCard}>
                {/* Avatar */}
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{getInitials(share.user_name)}</Text>
                </View>

                <View style={styles.shareInfo}>
                  <Text style={styles.shareName}>{share.user_name ?? 'Pending...'}</Text>
                  <Text style={styles.shareEmail}>{share.user_email}</Text>
                </View>

                {/* Permission toggle */}
                <TouchableOpacity
                  style={[
                    styles.permBadge,
                    share.permission === 'edit' ? styles.editBadge : styles.viewBadge,
                  ]}
                  onPress={() => handlePermissionChange(share)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.permBadgeText,
                    share.permission === 'edit' ? styles.editText : styles.viewText,
                  ]}>
                    {share.permission.toUpperCase()}
                  </Text>
                </TouchableOpacity>

                {/* Revoke */}
                <TouchableOpacity
                  onPress={() => setRevokeTarget(share)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close-circle-outline" size={20} color={Colors.muted} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Revoke confirm */}
      <Modal transparent visible={!!revokeTarget} animationType="fade" onRequestClose={() => setRevokeTarget(null)}>
        <View style={styles.overlay}>
          <View style={styles.confirmModal}>
            <Text style={styles.confirmTitle}>Revoke Access?</Text>
            <Text style={styles.confirmBody}>
              {revokeTarget?.user_name ?? revokeTarget?.user_email} will lose access to this trip.
            </Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setRevokeTarget(null)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.revokeBtn} onPress={handleRevoke}>
                <Text style={styles.revokeText}>Revoke</Text>
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
  content: { padding: 16, gap: 20 },

  codeCard: {
    backgroundColor: Colors.blueBg,
    borderRadius: 14,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.blueLight,
  },
  codeHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  codeTitle: { fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.blue },
  code: { fontFamily: Fonts.bold, fontSize: 26, color: Colors.text, letterSpacing: 2 },
  codeHint: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.muted, lineHeight: 18 },

  section: { gap: 12 },
  sectionTitle: { fontFamily: Fonts.semiBold, fontSize: 13, color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.5 },

  permRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  permLabel: { fontFamily: Fonts.medium, fontSize: 14, color: Colors.text },
  permToggle: { flexDirection: 'row', borderRadius: 8, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  permOption: { paddingHorizontal: 18, paddingVertical: 8, backgroundColor: Colors.white },
  permOptionActive: { backgroundColor: Colors.blue },
  permOptionText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.muted },
  permOptionTextActive: { color: Colors.white },

  shareCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.blue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.white },
  shareInfo: { flex: 1 },
  shareName: { fontFamily: Fonts.medium, fontSize: 14, color: Colors.text },
  shareEmail: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.muted },
  permBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  viewBadge: { backgroundColor: Colors.viewBadgeBg },
  editBadge: { backgroundColor: Colors.editBadgeBg },
  permBadgeText: { fontFamily: Fonts.bold, fontSize: 10 },
  viewText: { color: Colors.viewBadgeText },
  editText: { color: Colors.editBadgeText },

  overlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'center', padding: 24 },
  confirmModal: { backgroundColor: Colors.white, borderRadius: 16, padding: 24, gap: 12 },
  confirmTitle: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.text },
  confirmBody: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.muted, lineHeight: 20 },
  confirmActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn: { flex: 1, height: 44, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, justifyContent: 'center', alignItems: 'center' },
  cancelText: { fontFamily: Fonts.medium, fontSize: 15, color: Colors.text },
  revokeBtn: { flex: 1, height: 44, borderRadius: 10, backgroundColor: Colors.error, justifyContent: 'center', alignItems: 'center' },
  revokeText: { fontFamily: Fonts.semiBold, fontSize: 15, color: Colors.white },
});
