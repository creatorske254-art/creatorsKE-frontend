import api from '@/lib/api';

/**
 * Sign-up, sign-in (including the 2FA step), email verification, password reset, account
 * deletion, and the signed-in user's profile, preferences, sessions, 2FA and data export.
 *
 * POST   /auth/signup
 * POST   /auth/login
 * POST   /auth/login/2fa
 * POST   /auth/verify-email
 * POST   /auth/resend-verification
 * POST   /auth/forgot-password
 * POST   /auth/reset-password
 * POST   /auth/logout
 * DELETE /auth/account
 * POST   /auth/account/cancel-deletion
 * GET    /users/profile
 * PATCH  /users/profile
 * POST   /users/change-password
 * GET    /users/preferences
 * PATCH  /users/preferences
 * GET    /users/sessions
 * DELETE /users/sessions/:id
 * DELETE /users/sessions/others
 * POST   /users/2fa/setup
 * POST   /users/2fa/verify
 * DELETE /users/2fa
 * POST   /users/export
 */
export const authService = {
  signup: (data) => api.post('/auth/signup', data),
  login: (credentials) => api.post('/auth/login', credentials),
  // Second step when the account has two-factor on: the challenge from login plus the app's code.
  loginTwoFactor: (challengeToken, code) => api.post('/auth/login/2fa', { challengeToken, code }),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  resendVerification: (email) => api.post('/auth/resend-verification', { email }),
  requestPasswordReset: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, password: newPassword }),
  logout: () => api.post('/auth/logout'),
  deleteAccount: () => api.delete('/auth/account'),
  // Withdraws a pending deletion request during its grace period.
  cancelDeletion: () => api.post('/auth/account/cancel-deletion').then((r) => r.data),
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
  // Personal data export: ready at once, also emailed. The link opens in a new tab, so it carries
  // the token as ?token= (the same pattern as invoice PDFs).
  requestExport: () => api.post('/users/export').then((r) => r.data),
  exportDownloadUrl: (id) => `${api.defaults.baseURL}/users/export/${id}?token=${encodeURIComponent(localStorage.getItem('creatorske_token') ?? '')}`,
};