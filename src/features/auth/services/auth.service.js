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
  // Notification / privacy / locale preferences, one object per user
  getPreferences: () => api.get('/users/preferences').then((r) => r.data),
  updatePreferences: (data) => api.patch('/users/preferences', data).then((r) => r.data),
  // Signed-in devices
  listSessions: () => api.get('/users/sessions').then((r) => r.data?.sessions ?? r.data ?? []),
  revokeSession: (id) => api.delete(`/users/sessions/${id}`).then((r) => r.data),
  revokeOtherSessions: () => api.delete('/users/sessions/others').then((r) => r.data),
  // Two-factor authentication
  setup2fa: () => api.post('/users/2fa/setup').then((r) => r.data),
  verify2fa: (code) => api.post('/users/2fa/verify', { code }).then((r) => r.data),
  disable2fa: () => api.delete('/users/2fa').then((r) => r.data),
  // Personal data export (emailed)
  requestExport: () => api.post('/users/export').then((r) => r.data),
};