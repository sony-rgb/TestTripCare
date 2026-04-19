import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '../theme/colors';
import { Fonts, Typography } from '../theme/typography';
import { useNotificationsStore } from '../store/notificationsStore';

// Screens
import HomeScreen from '../screens/home/HomeScreen';
import MyTripsScreen from '../screens/trips/MyTripsScreen';
import TripDetailScreen from '../screens/trips/TripDetailScreen';
import AddTripScreen from '../screens/trips/AddTripScreen';
import EditTripScreen from '../screens/trips/EditTripScreen';
import TrashScreen from '../screens/trips/TrashScreen';
import ShareTripScreen from '../screens/sharing/ShareTripScreen';
import JoinTripScreen from '../screens/sharing/JoinTripScreen';
import EditFlightScreen from '../screens/itinerary/EditFlightScreen';
import EditHotelScreen from '../screens/itinerary/EditHotelScreen';
import EditCarScreen from '../screens/itinerary/EditCarScreen';
import EditActivityScreen from '../screens/itinerary/EditActivityScreen';
import MapViewScreen from '../screens/map/MapViewScreen';
import AlertsScreen from '../screens/alerts/AlertsScreen';
import GuidesScreen from '../screens/guides/GuidesScreen';
import ArticleScreen from '../screens/guides/ArticleScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import ProfileScreen from '../screens/settings/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// ─── Trips Stack ──────────────────────────────────────────────────────────────
function TripsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MyTrips" component={MyTripsScreen} />
      <Stack.Screen name="TripDetail" component={TripDetailScreen} />
      <Stack.Screen name="AddTrip" component={AddTripScreen} />
      <Stack.Screen name="EditTrip" component={EditTripScreen} />
      <Stack.Screen name="Trash" component={TrashScreen} />
      <Stack.Screen name="ShareTrip" component={ShareTripScreen} />
      <Stack.Screen name="JoinTrip" component={JoinTripScreen} />
      <Stack.Screen name="EditFlight" component={EditFlightScreen} />
      <Stack.Screen name="EditHotel" component={EditHotelScreen} />
      <Stack.Screen name="EditCar" component={EditCarScreen} />
      <Stack.Screen name="EditActivity" component={EditActivityScreen} />
      <Stack.Screen name="MapView" component={MapViewScreen} />
    </Stack.Navigator>
  );
}

// ─── Guides Stack ─────────────────────────────────────────────────────────────
function GuidesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Guides" component={GuidesScreen} />
      <Stack.Screen name="Article" component={ArticleScreen} />
    </Stack.Navigator>
  );
}

// ─── Settings Stack ───────────────────────────────────────────────────────────
function SettingsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Trash" component={TrashScreen} />
    </Stack.Navigator>
  );
}

// ─── Custom Tab Bar ───────────────────────────────────────────────────────────
type TabIconName = 'home' | 'airplane' | 'notifications' | 'map' | 'settings';

const TAB_CONFIG: Array<{
  name: string;
  label: string;
  icon: TabIconName;
  outlineIcon: string;
}> = [
  { name: 'HomeTab', label: 'Home', icon: 'home', outlineIcon: 'home-outline' },
  { name: 'MyTripsTab', label: 'My Trips', icon: 'airplane', outlineIcon: 'airplane-outline' },
  { name: 'AlertsTab', label: 'Alerts', icon: 'notifications', outlineIcon: 'notifications-outline' },
  { name: 'GuidesTab', label: 'Guides', icon: 'map', outlineIcon: 'map-outline' },
  { name: 'SettingsTab', label: 'Settings', icon: 'settings', outlineIcon: 'settings-outline' },
];

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const unreadCount = useNotificationsStore((s) => s.unreadCount);

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom }]}>
      {state.routes.map((route: any, index: number) => {
        const cfg = TAB_CONFIG[index];
        const isFocused = state.index === index;

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tabItem}
            activeOpacity={0.7}
            onPress={() => {
              if (!isFocused) navigation.navigate(route.name);
            }}
          >
            <View>
              <Ionicons
                name={(isFocused ? cfg.icon : cfg.outlineIcon) as any}
                size={22}
                color={isFocused ? Colors.blue : Colors.navInactive}
              />
              {cfg.name === 'AlertsTab' && unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.tabLabel, { color: isFocused ? Colors.blue : Colors.navInactive }]}>
              {cfg.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Main Navigator ───────────────────────────────────────────────────────────
export default function MainNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} />
      <Tab.Screen name="MyTripsTab" component={TripsStack} />
      <Tab.Screen name="AlertsTab" component={AlertsScreen} />
      <Tab.Screen name="GuidesTab" component={GuidesStack} />
      <Tab.Screen name="SettingsTab" component={SettingsStack} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: Fonts.medium,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: Colors.error,
    borderRadius: 999,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 9,
    fontFamily: Fonts.bold,
  },
});
