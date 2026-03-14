import api from './api'

export const reviewService = {
  getByPlan: (planId, page = 0, size = 10) =>
    api.get(`/plans/${planId}/reviews`, { params: { page, size } }),

  add: (planId, rating, comment) =>
    api.post(`/plans/${planId}/reviews`, { rating, comment }),

  delete: (reviewId) => api.delete(`/reviews/${reviewId}`),

  getByUser: (userId, page = 0, size = 10) =>
    api.get(`/users/${userId}/reviews`, { params: { page, size } }),
}
