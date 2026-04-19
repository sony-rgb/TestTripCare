import { create } from 'zustand';
import { tripsApi } from '../api/trips';
import { Trip, ItineraryItem, TripShare } from '../types';

interface TripsState {
  owned: Trip[];
  shared: Trip[];
  trash: Trip[];
  currentTrip: Trip | null;
  currentItems: ItineraryItem[];
  currentShares: TripShare[];
  isLoading: boolean;
  error: string | null;

  // Trip actions
  fetchTrips: () => Promise<void>;
  fetchTrash: () => Promise<void>;
  fetchTripDetail: (tripId: string) => Promise<void>;
  createTrip: (data: Partial<Trip>) => Promise<Trip>;
  updateTrip: (tripId: string, data: Partial<Trip>) => Promise<void>;
  deleteTrip: (tripId: string) => Promise<void>;
  restoreTrip: (tripId: string) => Promise<void>;

  // Item actions
  fetchItems: (tripId: string) => Promise<void>;
  createItem: (tripId: string, data: Partial<ItineraryItem>) => Promise<ItineraryItem>;
  updateItem: (tripId: string, itemId: string, data: Partial<ItineraryItem>) => Promise<void>;
  deleteItem: (tripId: string, itemId: string) => Promise<void>;

  // Sharing actions
  fetchShares: (tripId: string) => Promise<void>;
  shareByEmail: (tripId: string, email: string, permission: 'view' | 'edit') => Promise<void>;
  joinByCode: (code: string) => Promise<Trip>;
  updatePermission: (tripId: string, shareId: string, permission: 'view' | 'edit') => Promise<void>;
  revokeAccess: (tripId: string, shareId: string) => Promise<void>;
  leaveTrip: (tripId: string) => Promise<void>;

  clearError: () => void;
  setCurrentTrip: (trip: Trip | null) => void;
}

export const useTripsStore = create<TripsState>((set, get) => ({
  owned: [],
  shared: [],
  trash: [],
  currentTrip: null,
  currentItems: [],
  currentShares: [],
  isLoading: false,
  error: null,

  fetchTrips: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await tripsApi.list();
      set({ owned: data.owned, shared: data.shared, isLoading: false });
    } catch {
      set({ error: 'Failed to load trips', isLoading: false });
    }
  },

  fetchTrash: async () => {
    set({ isLoading: true });
    try {
      const { data } = await tripsApi.trash();
      set({ trash: data, isLoading: false });
    } catch {
      set({ error: 'Failed to load trash', isLoading: false });
    }
  },

  fetchTripDetail: async (tripId) => {
    set({ isLoading: true });
    try {
      const [tripRes, itemsRes] = await Promise.all([
        tripsApi.get(tripId),
        tripsApi.getItems(tripId),
      ]);
      set({ currentTrip: tripRes.data, currentItems: itemsRes.data, isLoading: false });
    } catch {
      set({ error: 'Failed to load trip', isLoading: false });
    }
  },

  createTrip: async (data) => {
    const { data: trip } = await tripsApi.create(data);
    set((s) => ({ owned: [...s.owned, trip] }));
    return trip;
  },

  updateTrip: async (tripId, data) => {
    const { data: updated } = await tripsApi.update(tripId, data);
    set((s) => ({
      owned: s.owned.map((t) => (t.trip_id === tripId ? updated : t)),
      currentTrip: s.currentTrip?.trip_id === tripId ? updated : s.currentTrip,
    }));
  },

  deleteTrip: async (tripId) => {
    await tripsApi.delete(tripId);
    set((s) => ({ owned: s.owned.filter((t) => t.trip_id !== tripId) }));
    await get().fetchTrash();
  },

  restoreTrip: async (tripId) => {
    await tripsApi.restore(tripId);
    set((s) => ({ trash: s.trash.filter((t) => t.trip_id !== tripId) }));
    await get().fetchTrips();
  },

  fetchItems: async (tripId) => {
    const { data } = await tripsApi.getItems(tripId);
    set({ currentItems: data });
  },

  createItem: async (tripId, data) => {
    const { data: item } = await tripsApi.createItem(tripId, data);
    set((s) => ({ currentItems: [...s.currentItems, item] }));
    return item;
  },

  updateItem: async (tripId, itemId, data) => {
    const { data: updated } = await tripsApi.updateItem(tripId, itemId, data);
    set((s) => ({
      currentItems: s.currentItems.map((i) => (i.item_id === itemId ? updated : i)),
    }));
  },

  deleteItem: async (tripId, itemId) => {
    await tripsApi.deleteItem(tripId, itemId);
    set((s) => ({ currentItems: s.currentItems.filter((i) => i.item_id !== itemId) }));
  },

  fetchShares: async (tripId) => {
    const { data } = await tripsApi.getShares(tripId);
    set({ currentShares: data });
  },

  shareByEmail: async (tripId, email, permission) => {
    const { data: share } = await tripsApi.shareByEmail(tripId, email, permission);
    set((s) => ({ currentShares: [...s.currentShares, share] }));
    // Update shared_count on the trip
    set((s) => ({
      owned: s.owned.map((t) =>
        t.trip_id === tripId
          ? { ...t, shared_count: (t.shared_count ?? 0) + 1 }
          : t,
      ),
    }));
  },

  joinByCode: async (code) => {
    const { data: trip } = await tripsApi.joinByCode(code);
    set((s) => ({ shared: [...s.shared, trip] }));
    return trip;
  },

  updatePermission: async (tripId, shareId, permission) => {
    await tripsApi.updatePermission(tripId, shareId, permission);
    set((s) => ({
      currentShares: s.currentShares.map((sh) =>
        sh.share_id === shareId ? { ...sh, permission } : sh,
      ),
    }));
  },

  revokeAccess: async (tripId, shareId) => {
    await tripsApi.revokeAccess(tripId, shareId);
    set((s) => ({
      currentShares: s.currentShares.filter((sh) => sh.share_id !== shareId),
    }));
  },

  leaveTrip: async (tripId) => {
    await tripsApi.leaveTrip(tripId);
    set((s) => ({ shared: s.shared.filter((t) => t.trip_id !== tripId) }));
  },

  clearError: () => set({ error: null }),
  setCurrentTrip: (trip) => set({ currentTrip: trip }),
}));
