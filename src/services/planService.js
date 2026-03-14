import api from './api'

export const planService = {
  getAll: (page = 0, size = 12, sortBy = 'monthlyPrice', sortDir = 'asc') =>
    api.get('/plans', { params: { page, size, sortBy, sortDir } }),

  getById: (id) => api.get(`/plans/${id}`),

  filter: (filterBody, page = 0, size = 12) =>
    api.post('/plans/filter', filterBody, { params: { page, size } }),

  compare: (ids) =>
    api.get('/plans/compare', { params: { ids: ids.join(',') } }),

  getProviders: () => api.get('/plans/providers'),

  // Admin
  create: (data) => api.post('/plans', data),
  update: (id, data) => api.put(`/plans/${id}`, data),
  delete: (id) => api.delete(`/plans/${id}`),
}
