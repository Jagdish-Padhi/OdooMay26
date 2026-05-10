import api from './api.js';

export const checklistService = {
  getAll: (tripId) => api.get(`/trips/${tripId}/checklist`),
  create: (tripId, data) => api.post(`/trips/${tripId}/checklist`, data),
  update: (tripId, itemId, data) => api.put(`/trips/${tripId}/checklist/${itemId}`, data),
  remove: (tripId, itemId) => api.delete(`/trips/${tripId}/checklist/${itemId}`),
  reset: (tripId) => api.post(`/trips/${tripId}/checklist/reset`),
};

export default checklistService;