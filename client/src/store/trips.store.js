import { create } from 'zustand';
import toast from 'react-hot-toast';

import { tripsService } from '../services/trips.service.js';

const useTripsStore = create((set) => ({
  trips: [],
  currentTrip: null,
  loading: false,

  clearCurrentTrip: () => set({ currentTrip: null }),

  fetchTrips: async () => {
    set({ loading: true });
    try {
      const response = await tripsService.getAll();
      set({ trips: response.data.data });
      return response.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load trips.');
      return [];
    } finally {
      set({ loading: false });
    }
  },

  fetchTrip: async (id) => {
    set({ loading: true });
    try {
      const response = await tripsService.getOne(id);
      set({ currentTrip: response.data.data });
      return response.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load trip.');
      return null;
    } finally {
      set({ loading: false });
    }
  },

  createTrip: async (data) => {
    const response = await tripsService.create(data);
    const trip = response.data.data;
    set((state) => ({ trips: [trip, ...state.trips] }));
    return trip;
  },

  updateTrip: async (id, data) => {
    const response = await tripsService.update(id, data);
    const updatedTrip = response.data.data;
    set((state) => ({
      trips: state.trips.map((trip) => (trip.id === id ? updatedTrip : trip)),
      currentTrip: state.currentTrip?.id === id ? updatedTrip : state.currentTrip,
    }));
    return updatedTrip;
  },

  deleteTrip: async (id) => {
    await tripsService.remove(id);
    set((state) => ({
      trips: state.trips.filter((trip) => trip.id !== id),
      currentTrip: state.currentTrip?.id === id ? null : state.currentTrip,
    }));
  },
}));

export default useTripsStore;