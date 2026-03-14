import api from './api'

export const authService = {
  register: (username, email, password) =>
    api.post('/auth/register', { username, email, password }),

  login: (username, password) =>
    api.post('/auth/login', { username, password }),

  getMe: () => api.get('/auth/me'),

  changePassword: (currentPassword, newPassword) =>
    api.put('/auth/me/password', { currentPassword, newPassword }),

  // Admin
  getAllUsers:    ()           => api.get('/auth/users'),
  getUserById:   (id)         => api.get(`/auth/users/${id}`),
  updateRole:    (id, roles)  => api.put(`/auth/users/${id}/roles`, { roles }),
  enableUser:    (id)         => api.put(`/auth/users/${id}/enable`),
  disableUser:   (id)         => api.put(`/auth/users/${id}/disable`),
  registerAdmin: (username, email, password) =>
    api.post('/auth/register/admin', { username, email, password }),

  // Root admin: reset any user's password (no current password needed)
  resetPassword: (userId, newPassword) =>
    api.put(`/auth/users/${userId}/password`, { newPassword }),
}
