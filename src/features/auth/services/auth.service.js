import api from '@/lib/api';

export const authService = {
  signup: (data) => api.post('/auth/signup', data),
  login: (credentials) => api.post('/auth/login', credentials),
  refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken }),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  // Not in the documented API - best-effort path, see BACKEND_API_SPEC.md.
  resendVerification: (email) => api.post('/auth/resend-verification', { email }),
  requestPasswordReset: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, password: newPassword }),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me').then((r) => r.data),
  deleteAccount: () => api.delete('/auth/account'),
};

// Users & Profiles - no dedicated "users" feature exists, and this is the
// closest home (auth already owns the authenticated-account lifecycle).
export const userService = {
  getProfile: () => api.get('/users/profile').then((r) => r.data),
  updateProfile: (data) => api.patch('/users/profile', data).then((r) => r.data),
  changePassword: (currentPassword, newPassword) =>
    api.post('/users/change-password', { currentPassword, newPassword }).then((r) => r.data),
};