import api from '@/lib/api';

/**
 * Admin queues and platform controls. Every call needs an admin session; writes are limited by
 * the admin role on the server.
 *
 * GET    /admin/disputes
 * PATCH  /admin/disputes/:id/resolve
 * POST   /admin/disputes/:id/reply
 * GET    /admin/accounts/flagged
 * POST   /admin/accounts/:id/action
 * GET    /admin/accounts
 * POST   /admin/invite
 * POST   /admin/moderation
 * GET    /admin/stats
 * GET    /admin/escrow
 * POST   /admin/escrow/:id/:id
 * GET    /admin/deletion-requests
 * POST   /admin/deletion-requests/:id/:id
 * GET    /admin/re-engagement
 * POST   /admin/re-engagement/send
 * GET    /admin/settings
 * PUT    /admin/settings
 * GET    /admin/team
 * PATCH  /admin/team/:id
 * DELETE /admin/team/:id
 */
export const adminService = {
  listDisputes: (params) => api.get('/admin/disputes', { params }).then((r) => r.data),
  resolveDispute: (id, data) => api.patch(`/admin/disputes/${id}/resolve`, data).then((r) => r.data),
  // Adds a message to the case without deciding it.
  replyToDispute: (id, message) => api.post(`/admin/disputes/${id}/reply`, { message }).then((r) => r.data),

  listFlaggedAccounts: () => api.get('/admin/accounts/flagged').then((r) => r.data),
  takeAccountAction: (id, action, reason) =>
    api.post(`/admin/accounts/${id}/action`, { action, reason }).then((r) => r.data),
  // Every creator and brand account, filterable by ?q=&role=&status=.
  listAccounts: (params) => api.get('/admin/accounts', { params }).then((r) => r.data),
  inviteAdmin: (email, role) => api.post('/admin/invite', { email, role }).then((r) => r.data),

  moderate: (targetId, action, reason) =>
    api.post('/admin/moderation', { targetId, action, reason }).then((r) => r.data),

  getStats: () => api.get('/admin/stats').then((r) => r.data),

  // Operations pages (escrow, deletion requests, re-engagement)
  // Withdrawal requests paid by hand: ?status=pending|sent|rejected|all; action is 'sent' ({ reference }) or 'reject' ({ reason }).
  listPayouts: (status) => api.get('/admin/payouts', { params: { status } }).then((r) => r.data),
  payoutAction: (id, action, body) => api.post(`/admin/payouts/${id}/${action}`, body).then((r) => r.data),
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
  updateTeamMember: (id, data) => api.patch(`/admin/team/${id}`, data).then((r) => r.data),
  removeTeamMember: (id) => api.delete(`/admin/team/${id}`).then((r) => r.data),
};
