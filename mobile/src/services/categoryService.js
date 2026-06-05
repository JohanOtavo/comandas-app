import api, { unwrap } from './api';

export const categoryService = {
  list: (params = {}) => api.get('/categories', { params }).then(unwrap),
  detail: (id) => api.get(`/categories/${id}`).then(unwrap),
  create: (payload) => api.post('/categories', payload).then(unwrap),
  update: (id, payload) => api.put(`/categories/${id}`, payload).then(unwrap),
  setStatus: (id, isActive) => api.patch(`/categories/${id}/status`, { isActive }).then(unwrap),
  remove: (id) => api.delete(`/categories/${id}`).then(unwrap)
};
