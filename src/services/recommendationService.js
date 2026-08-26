import api from './api'

export const recommendationService = {
  getOccupations: () => api.get('/plans/occupations'),

  recommend: (occupation, maxBudget) =>
    api.get('/plans/recommend', {
      params: {
        occupation,
        ...(maxBudget ? { maxBudget } : {}),
      },
    }),
}
