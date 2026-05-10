import api from './api.js';

export const tripsService = {
  getAll: () => api.get('/trips'),
  getOne: (id) => api.get(`/trips/${id}`),
  getPublic: (id) => api.get(`/trips/public/${id}`),
  getBudget: (id) => api.get(`/trips/${id}/budget`),
  create: (data) => api.post('/trips', data),
  update: (id, data) => api.put(`/trips/${id}`, data),
  remove: (id) => api.delete(`/trips/${id}`),
  duplicate: (id) => api.post(`/trips/${id}/duplicate`),
};

export default tripsService;