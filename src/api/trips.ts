import api from './client';
import { Trip, TripShare, ItineraryItem } from '../types';

export const tripsApi = {
  // ── Trips ──────────────────────────────────────────────────────────────────
  list: () => api.get<{ owned: Trip[]; shared: Trip[] }>('/trips'),

  create: (body: Partial<Trip>) => api.post<Trip>('/trips', body),

  get: (tripId: string) => api.get<Trip>(`/trips/${tripId}`),

  update: (tripId: string, body: Partial<Trip>) =>
    api.patch<Trip>(`/trips/${tripId}`, body),

  delete: (tripId: string) => api.delete(`/trips/${tripId}`),

  restore: (tripId: string) => api.post(`/trips/${tripId}/restore`),

  trash: () => api.get<Trip[]>('/trips/trash'),

  // ── Itinerary Items ────────────────────────────────────────────────────────
  getItems: (tripId: string) =>
    api.get<ItineraryItem[]>(`/trips/${tripId}/items`),

  createItem: (tripId: string, body: Partial<ItineraryItem>) =>
    api.post<ItineraryItem>(`/trips/${tripId}/items`, body),

  updateItem: (tripId: string, itemId: string, body: Partial<ItineraryItem>) =>
    api.patch<ItineraryItem>(`/trips/${tripId}/items/${itemId}`, body),

  deleteItem: (tripId: string, itemId: string) =>
    api.delete(`/trips/${tripId}/items/${itemId}`),

  // ── Sharing ────────────────────────────────────────────────────────────────
  getShares: (tripId: string) =>
    api.get<TripShare[]>(`/trips/${tripId}/shares`),

  shareByEmail: (tripId: string, email: string, permission: 'view' | 'edit') =>
    api.post<TripShare>(`/trips/${tripId}/shares`, { email, permission }),

  joinByCode: (code: string) =>
    api.post<Trip>('/trips/join', { code }),

  updatePermission: (tripId: string, shareId: string, permission: 'view' | 'edit') =>
    api.patch(`/trips/${tripId}/shares/${shareId}`, { permission }),

  revokeAccess: (tripId: string, shareId: string) =>
    api.delete(`/trips/${tripId}/shares/${shareId}`),

  leaveTrip: (tripId: string) =>
    api.post(`/trips/${tripId}/leave`),
};
