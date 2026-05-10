import api from './api.js';

export const citiesService = {
  search: (params) => api.get('/cities', { params }),
};

export default citiesService;