export const Colors = {
  // Primary
  blue: '#4AABDB',
  blueDark: '#2E8FB8',
  blueLight: '#D6EEF8',
  blueBg: '#EAF5FB',

  // Text
  text: '#1a1a2e',
  muted: '#6b7280',
  mutedLight: '#9ca3af',

  // UI
  border: '#e5e7eb',
  borderDark: '#d1d5db',
  white: '#ffffff',
  background: '#f8fafc',
  inputBg: '#f9fafb',

  // Semantic
  error: '#ef4444',
  errorLight: '#fef2f2',
  success: '#10b981',
  successLight: '#d1fae5',
  warning: '#f59e0b',
  warningLight: '#fef3c7',

  // Event type backgrounds
  flightBg: '#dbeafe',
  flightText: '#1d4ed8',
  hotelBg: '#fef3c7',
  hotelText: '#92400e',
  carBg: '#d1fae5',
  carText: '#065f46',
  activityBg: '#ede9fe',
  activityText: '#5b21b6',
  cruiseBg: '#fce7f3',
  cruiseText: '#9d174d',

  // Permission badges
  viewBadgeBg: '#ede9fe',
  viewBadgeText: '#5b21b6',
  editBadgeBg: '#d1fae5',
  editBadgeText: '#065f46',

  // Overlay
  overlay: 'rgba(0,0,0,0.45)',
  overlayLight: 'rgba(0,0,0,0.25)',

  // Bottom nav
  navActive: '#4AABDB',
  navInactive: '#9ca3af',
};

export type EventType = 'flight' | 'hotel' | 'car' | 'activity' | 'cruise';

export const EventColors: Record<EventType, { bg: string; text: string }> = {
  flight: { bg: Colors.flightBg, text: Colors.flightText },
  hotel: { bg: Colors.hotelBg, text: Colors.hotelText },
  car: { bg: Colors.carBg, text: Colors.carText },
  activity: { bg: Colors.activityBg, text: Colors.activityText },
  cruise: { bg: Colors.cruiseBg, text: Colors.cruiseText },
};
