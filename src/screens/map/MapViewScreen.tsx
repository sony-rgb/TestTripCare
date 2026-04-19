import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import ScreenHeader from '../../components/common/ScreenHeader';
import Button from '../../components/common/Button';

type RouteParams = { address: string; label: string; lat?: number; lng?: number };

export default function MapViewScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const { address, label, lat, lng } = route.params;

  const openInMaps = () => {
    const query = lat && lng ? `${lat},${lng}` : encodeURIComponent(address);
    const url = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`,
      default: `https://maps.google.com/?q=${query}`,
    });
    Linking.openURL(url!);
  };

  // Build a simple grid "map" placeholder
  const gridLines = Array.from({ length: 8 });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title="Map" />

      {/* Map placeholder — replace with react-native-maps in production */}
      <View style={styles.mapArea}>
        {/* Grid background */}
        {gridLines.map((_, i) => (
          <View key={`h${i}`} style={[styles.gridLine, styles.gridH, { top: `${(i + 1) * 11}%` as any }]} />
        ))}
        {gridLines.map((_, i) => (
          <View key={`v${i}`} style={[styles.gridLine, styles.gridV, { left: `${(i + 1) * 11}%` as any }]} />
        ))}

        {/* Pin */}
        <View style={styles.pinContainer}>
          <View style={styles.pin}>
            <Ionicons name="location" size={28} color={Colors.white} />
          </View>
          <View style={styles.pinShadow} />
        </View>
      </View>

      {/* Info card */}
      <View style={[styles.card, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.labelRow}>
          <View style={styles.pinBadge}>
            <Ionicons name="location" size={16} color={Colors.blue} />
          </View>
          <View style={styles.labelText}>
            <Text style={styles.locationLabel}>{label}</Text>
            <Text style={styles.addressText}>{address}</Text>
          </View>
        </View>

        <Button
          title="Open in Google Maps"
          onPress={openInMaps}
          variant="primary"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  mapArea: {
    flex: 1,
    backgroundColor: '#e8f4f8',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridLine: { position: 'absolute', backgroundColor: 'rgba(74,171,219,0.15)' },
  gridH: { left: 0, right: 0, height: 1 },
  gridV: { top: 0, bottom: 0, width: 1 },

  pinContainer: { alignItems: 'center', zIndex: 10 },
  pin: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.blue,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  pinShadow: {
    width: 20,
    height: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(74,171,219,0.3)',
    marginTop: 4,
  },

  card: {
    backgroundColor: Colors.white,
    padding: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 16,
  },
  labelRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  pinBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.blueBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  labelText: { flex: 1, gap: 3 },
  locationLabel: { fontFamily: Fonts.semiBold, fontSize: 16, color: Colors.text },
  addressText: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.muted, lineHeight: 18 },
});
