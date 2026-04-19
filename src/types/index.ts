// ─── Auth ────────────────────────────────────────────────────────────────────

export interface User {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  home_city?: string;
  avatar_url?: string;
  email_verified: boolean;
  notification_prefs: NotificationPrefs;
  currency: string;
  units: 'metric' | 'imperial';
  default_airport?: string;
  preferred_seat?: string;
  meal_preference?: string;
  loyalty_numbers?: Record<string, string>;
  created_at: string;
}

export interface NotificationPrefs {
  flight_reminder: boolean;
  hotel_reminder: boolean;
  car_reminder: boolean;
  activity_reminder: boolean;
  email_parsed: boolean;
  email_failed: boolean;
  trip_shared: boolean;
  permission_changed: boolean;
  collaborator_edit: boolean;
  deal_alert: boolean;
  trip_reminder: boolean;
}

export interface AuthTokens {
  access_token: string;
  expires_in: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  home_city?: string;
}

// ─── Trips ───────────────────────────────────────────────────────────────────

export type TripStatus = 'active' | 'trash' | 'archived' | 'deleted';
export type Permission = 'view' | 'edit' | 'owner';

export interface Trip {
  trip_id: string;
  owner_id: string;
  trip_name: string;
  destination: string;
  start_date: string;       // ISO date string YYYY-MM-DD
  end_date: string;
  duration_days: number;
  description?: string;
  budget?: number;
  currency?: string;
  num_travellers?: number;
  share_code: string;
  status: TripStatus;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  // Joined fields
  user_permission?: Permission;
  owner_name?: string;
  shared_count?: number;
}

export interface TripShare {
  share_id: string;
  trip_id: string;
  user_id: string;
  permission: 'view' | 'edit';
  invited_by: string;
  joined_at?: string;
  revoked_at?: string;
  created_at: string;
  // Joined
  user_name?: string;
  user_email?: string;
  user_avatar?: string;
}

// ─── Itinerary Items ─────────────────────────────────────────────────────────

export type ItemType = 'flight' | 'hotel' | 'car' | 'activity' | 'cruise';
export type ItemSource = 'manual' | 'email' | 'import';

export interface ItineraryItem {
  item_id: string;
  trip_id: string;
  created_by: string;
  updated_by?: string;
  type: ItemType;
  day_number: number;
  item_date: string;
  title: string;
  subtitle?: string;
  start_time?: string;
  end_time?: string;
  address?: string;
  lat?: number;
  lng?: number;
  confirmation?: string;
  notes?: string;
  extended_fields: Record<string, unknown>;
  source: ItemSource;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// Extended fields per type
export interface FlightFields {
  airline?: string;
  flight_number?: string;
  from_airport?: string;
  to_airport?: string;
  from_terminal?: string;
  to_terminal?: string;
  from_gate?: string;
  to_gate?: string;
  booking_ref?: string;
  seat_numbers?: string;
  class_of_service?: string;
  departs?: string;
  arrives?: string;
}

export interface HotelFields {
  property_name?: string;
  check_in_date?: string;
  check_out_date?: string;
  room_type?: string;
  confirmation?: string;
  cancellation_policy?: string;
  loyalty_number?: string;
  meal_plan?: string;
  parking_info?: string;
}

export interface CarFields {
  company?: string;
  pickup_address?: string;
  pickup_date?: string;
  pickup_time?: string;
  dropoff_address?: string;
  dropoff_date?: string;
  dropoff_time?: string;
  vehicle_type?: string;
  booking_ref?: string;
  insurance_included?: boolean;
}

export interface ActivityFields {
  category?: string;
  venue_name?: string;
  duration?: string;
  ticket_info?: string;
  cost?: string;
  num_participants?: number;
  notes?: string;
}

// ─── Notifications / Alerts ──────────────────────────────────────────────────

export type AlertType =
  | 'flight_reminder'
  | 'hotel_reminder'
  | 'car_reminder'
  | 'activity_reminder'
  | 'email_parsed'
  | 'email_failed'
  | 'trip_shared'
  | 'permission_changed'
  | 'collaborator_edit'
  | 'deal_alert'
  | 'trip_reminder';

export interface Notification {
  notif_id: string;
  user_id: string;
  type: AlertType;
  title: string;
  body: string;
  trip_id?: string;
  item_id?: string;
  is_read: boolean;
  sent_push: boolean;
  created_at: string;
}

// ─── Guides / Blog ───────────────────────────────────────────────────────────

export type GuideCategory = 'tips' | 'itinerary' | 'outdoors' | 'family' | 'city';

export interface GuideArticle {
  id: string;
  title: string;
  category: GuideCategory;
  excerpt: string;
  body?: string;
  author?: string;
  published_at: string;
  cover_emoji?: string;
  cover_color?: string;
  is_itinerary: boolean;
  destination?: string;
  duration_days?: number;
}

// ─── Navigation Param Lists ──────────────────────────────────────────────────

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  Signup: undefined;
  ResetPassword: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  MyTripsTab: undefined;
  AlertsTab: undefined;
  GuidesTab: undefined;
  SettingsTab: undefined;
};

export type TripsStackParamList = {
  MyTrips: undefined;
  TripDetail: { tripId: string };
  AddTrip: undefined;
  EditTrip: { tripId: string };
  Trash: undefined;
  ShareTrip: { tripId: string };
  JoinTrip: undefined;
  EditFlight: { tripId: string; itemId?: string; dayNumber: number; itemDate: string };
  EditHotel: { tripId: string; itemId?: string; dayNumber: number; itemDate: string };
  EditCar: { tripId: string; itemId?: string; dayNumber: number; itemDate: string };
  EditActivity: { tripId: string; itemId?: string; dayNumber: number; itemDate: string };
  MapView: { address: string; label: string; lat?: number; lng?: number };
};

// ─── API Response Wrappers ───────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
}

export interface ApiError {
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}
