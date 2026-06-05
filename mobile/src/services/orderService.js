import api, { unwrap } from './api';

export const orderService = {
  listOpen: (params = {}) => api.get('/orders/open', { params }).then(unwrap),
  listPaid: (params = {}) => api.get('/orders/paid', { params }).then(unwrap),
  listDeleted: (params = {}) => api.get('/orders/deleted', { params }).then(unwrap),
  detail: (id) => api.get(`/orders/${id}`).then(unwrap),
  create: (payload) => api.post('/orders', payload).then(unwrap),
  update: (id, payload) => api.put(`/orders/${id}`, payload).then(unwrap),
  pay: (id) => api.post(`/orders/${id}/pay`).then(unwrap),
  remove: (id, payload) => api.post(`/orders/${id}/delete`, payload).then(unwrap),
  listItems: (id, view = 'added') => api.get(`/orders/${id}/items`, { params: { view } }).then(unwrap),
  detailItem: (id, itemId) => api.get(`/orders/${id}/items/${itemId}`).then(unwrap),
  addItem: (id, payload) => api.post(`/orders/${id}/items`, payload).then(unwrap),
  updateItem: (id, itemId, payload) => api.put(`/orders/${id}/items/${itemId}`, payload).then(unwrap),
  removeItem: (id, itemId) => api.delete(`/orders/${id}/items/${itemId}`).then(unwrap)
};
