import api from '@/lib/api';

export const adminService = {
  listDisputes: (params) => api.get('/admin/disputes', { params }).then((r) => r.data),
  getDispute: (id) => api.get(`/admin/disputes/${id}`).then((r) => r.data),
  resolveDispute: (id, data) => api.patch(`/admin/disputes/${id}/resolve`, data).then((r) => r.data),

  listFlaggedAccounts: () => api.get('/admin/accounts/flagged').then((r) => r.data),
  takeAccountAction: (id, action, reason) =>
    api.post(`/admin/accounts/${id}/action`, { action, reason }).then((r) => r.data),

  moderate: (targetId, action, reason) =>
    api.post('/admin/moderation', { targetId, action, reason }).then((r) => r.data),

  getStats: () => api.get('/admin/stats').then((r) => r.data),
};
