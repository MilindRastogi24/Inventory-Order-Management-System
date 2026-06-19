import api from './client';

export const customersApi = {
  list: () => api.get('/customers'),
  get: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  delete: (id) => api.delete(`/customers/${id}`),
};
