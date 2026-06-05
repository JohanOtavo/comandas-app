import api, { unwrap } from './api';

export const cashRegisterService = {
  open: (payload) => api.post('/cash-register/open', payload).then(unwrap),
  current: () => api.get('/cash-register/current').then(unwrap),
  history: () => api.get('/cash-register/history').then(unwrap),
  detail: (id) => api.get(`/cash-register/${id}`).then(unwrap),
  update: (id, payload) => api.put(`/cash-register/${id}`, payload).then(unwrap),
  close: (payload) => api.post('/cash-register/close', payload).then(unwrap)
};
