# TripCare — React Native App

> Where Every Trip Finds Its Flow

TripCare is a mobile travel itinerary organiser built with **React Native (Expo)** for iOS and Android.

---

## Prerequisites

- [Node.js 18+](https://nodejs.org/) (LTS recommended)
- [Expo CLI](https://docs.expo.dev/get-started/installation/): `npm install -g expo-cli`
- [EAS CLI](https://docs.expo.dev/eas/) (for building): `npm install -g eas-cli`
- iOS: Xcode 15+ (Mac only)
- Android: Android Studio + Android SDK

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Add the DM Sans fonts to assets/fonts/
#    Download from: https://fonts.google.com/specimen/DM+Sans
#    Required files:
#      assets/fonts/DMSans-Regular.ttf
#      assets/fonts/DMSans-Medium.ttf
#      assets/fonts/DMSans-SemiBold.ttf
#      assets/fonts/DMSans-Bold.ttf

# 3. Start the dev server
npx expo start

# 4. Press 'i' for iOS simulator, 'a' for Android emulator
```

---

## Project Structure

```
src/
├── api/              # Axios API clients (auth, trips, notifications)
├── components/
│   ├── common/       # Button, Input, ScreenHeader
│   └── trips/        # EventCard, TripCard, AddItemModal
├── navigation/       # AppNavigator, AuthNavigator, MainNavigator
├── screens/
│   ├── auth/         # Splash, Login, Signup, ResetPassword
│   ├── home/         # HomeScreen
│   ├── trips/        # MyTrips, TripDetail, AddTrip, EditTrip, Trash
│   ├── itinerary/    # EditFlight, EditHotel, EditCar, EditActivity
│   ├── sharing/      # ShareTrip, JoinTrip
│   ├── alerts/       # AlertsScreen
│   ├── guides/       # GuidesScreen, ArticleScreen
│   ├── settings/     # SettingsScreen, ProfileScreen
│   └── map/          # MapViewScreen
├── store/            # Zustand stores (auth, trips, notifications)
├── theme/            # Colors, Typography, Spacing
└── types/            # TypeScript types and nav param lists
```

---

## Backend Configuration

Set your API base URL in `app.json` under `expo.extra.apiBaseUrl`:

```json
"extra": {
  "apiBaseUrl": "https://api.tripcare.co/v1"
}
```

The app uses:
- **JWT** access tokens (15 min expiry) stored in `expo-secure-store`
- **Refresh tokens** (30 days) with automatic rotation
- **Axios** interceptors for transparent token refresh

---

## Key Features Implemented

| Feature | Status |
|---------|--------|
| Auth (login, register, reset password) | ✅ |
| JWT + refresh token rotation | ✅ |
| My Trips list (owned + shared) | ✅ |
| Trip detail with day-by-day navigation | ✅ |
| Add/Edit/Delete itinerary items (flight, hotel, car, activity) | ✅ |
| Expandable event cards with map links | ✅ |
| Trip sharing by email + trip code | ✅ |
| Permission levels (View / Edit) | ✅ |
| Leave/Revoke shared trip access | ✅ |
| Trash with 30-day recovery | ✅ |
| Alerts / Notifications centre | ✅ |
| Guides & blog articles | ✅ |
| Settings + Profile edit | ✅ |
| Map view (native maps deep link) | ✅ |
| Email ingestion (backend only) | Architecture ready |
| Excel / Google Sheets import | UI shell ready |
| Push notifications (FCM/APNs) | Store + API ready |

---

## Dependencies

| Package | Purpose |
|---------|---------|
| `expo ~51` | Build toolchain |
| `@react-navigation/native` | Navigation |
| `@react-navigation/stack` | Stack navigator |
| `@react-navigation/bottom-tabs` | Tab bar |
| `zustand` | State management |
| `axios` | HTTP client |
| `expo-secure-store` | Secure JWT storage |
| `@expo/vector-icons` | Ionicons |
| `date-fns` | Date formatting |
| `react-native-reanimated` | Animations |
| `react-native-gesture-handler` | Gestures |

---

## Backend (FRD Summary)

- **Database**: PostgreSQL with UUID PKs, JSONB extended fields
- **Auth**: bcrypt passwords, JWT + refresh token rotation
- **Email ingestion**: `tripcare@tripcare.co` → parser → trip match → auto-create items
- **Notifications**: FCM (Android) + APNs (iOS) + in-app alerts centre
- **CMS**: Contentful (or equivalent) for Guides content

See `TripCare_FRD.docx` for full requirements.
