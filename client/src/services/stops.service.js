import api from './api.js';

export const stopsService = {
  getAll: (tripId) => api.get(`/trips/${tripId}/stops`),
  create: (tripId, data) => api.post(`/trips/${tripId}/stops`, data),
  update: (tripId, stopId, data) => api.put(`/trips/${tripId}/stops/${stopId}`, data),
  remove: (tripId, stopId) => api.delete(`/trips/${tripId}/stops/${stopId}`),
  reorder: (tripId, orderedIds) => api.put(`/trips/${tripId}/stops/reorder`, { orderedIds }),
};

export default stopsService;