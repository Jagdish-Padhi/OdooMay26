import api from './api.js';

export const notesService = {
  getAll: (tripId) => api.get(`/trips/${tripId}/notes`),
  create: (tripId, data) => api.post(`/trips/${tripId}/notes`, data),
  update: (tripId, noteId, data) => api.put(`/trips/${tripId}/notes/${noteId}`, data),
  remove: (tripId, noteId) => api.delete(`/trips/${tripId}/notes/${noteId}`),
};

export default notesService;