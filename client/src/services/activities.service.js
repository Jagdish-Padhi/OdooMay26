import api from './api.js';

export const activitiesService = {
  getAll: (tripId, stopId) => api.get(`/trips/${tripId}/stops/${stopId}/activities`),
  create: (tripId, stopId, data) => api.post(`/trips/${tripId}/stops/${stopId}/activities`, data),
  update: (tripId, stopId, activityId, data) => api.put(`/trips/${tripId}/stops/${stopId}/activities/${activityId}`, data),
  remove: (tripId, stopId, activityId) => api.delete(`/trips/${tripId}/stops/${stopId}/activities/${activityId}`),
  reorder: (tripId, stopId, orderedIds) => api.put(`/trips/${tripId}/stops/${stopId}/activities/reorder`, { orderedIds }),
  searchIdeas: (payload) => api.post('/ai/activity-search', payload),
};

export default activitiesService;