import api from '@/lib/api';

export const adminService = {
  listDisputes: (params) => api.get('/admin/disputes', { params }).then((r) => r.data),
  getDispute: (id) => api.get(`/admin/disputes/${id}`).then((r) => r.data),
  resolveDispute: (id, data) => api.patch(`/admin/disputes/${id}/resolve`, data).then((r) => r.data),
  // Not yet documented/built on the backend - see the production-readiness
  // plan's backend spec. Path is a best-effort guess; wired here so the
  // frontend seam is a one-line swap once the endpoint exists.
  replyToDispute: (id, message) => api.post(`/admin/disputes/${id}/reply`, { message }).then((r) => r.data),

  listFlaggedAccounts: () => api.get('/admin/accounts/flagged').then((r) => r.data),
  takeAccountAction: (id, action, reason) =>
    api.post(`/admin/accounts/${id}/action`, { action, reason }).then((r) => r.data),
  // Not yet documented/built on the backend - see the production-readiness
  // plan's backend spec.
  listAccounts: (params) => api.get('/admin/accounts', { params }).then((r) => r.data),
  inviteAdmin: (email, role) => api.post('/admin/invite', { email, role }).then((r) => r.data),

  moderate: (targetId, action, reason) =>
    api.post('/admin/moderation', { targetId, action, reason }).then((r) => r.data),

  getStats: () => api.get('/admin/stats').then((r) => r.data),

  // Operations pages - specified in BACKEND_API_SPEC.md, not yet built.
  listEscrow: (params) => api.get('/admin/escrow', { params }).then((r) => r.data),
  escrowAction: (id, action, note) => api.post(`/admin/escrow/${id}/${action}`, { note }).then((r) => r.data),
  listDeletionRequests: (params) => api.get('/admin/deletion-requests', { params }).then((r) => r.data),
  resolveDeletionRequest: (id, decision, reason) =>
    api.post(`/admin/deletion-requests/${id}/${decision}`, { reason }).then((r) => r.data),
  getReengagement: () => api.get('/admin/re-engagement').then((r) => r.data),
  sendReengagement: (segmentId, options) =>
    api.post('/admin/re-engagement/send', { segmentId, ...options }).then((r) => r.data),

  // Admin settings page - platform rules and the admin roster.
  getSettings: () => api.get('/admin/settings').then((r) => r.data),
  updateSettings: (rules) => api.put('/admin/settings', rules).then((r) => r.data),
  listTeam: () => api.get('/admin/team').then((r) => r.data),
  removeAdmin: (id) => api.delete(`/admin/team/${id}`).then((r) => r.data),
};
