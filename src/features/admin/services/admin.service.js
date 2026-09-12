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
};
