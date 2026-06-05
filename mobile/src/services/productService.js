import api, { unwrap } from './api';

export const productService = {
  list: (params = {}) => api.get('/products', { params }).then(unwrap),
  detail: (id) => api.get(`/products/${id}`).then(unwrap),
  create: (payload) => api.post('/products', payload).then(unwrap),
  update: (id, payload) => api.put(`/products/${id}`, payload).then(unwrap),
  setStatus: (id, isActive) => api.patch(`/products/${id}/status`, { isActive }).then(unwrap),
  remove: (id) => api.delete(`/products/${id}`).then(unwrap)
};
