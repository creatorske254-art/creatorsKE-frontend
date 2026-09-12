import api from '@/lib/api';

export const brandService = {
  getProfile: () => api.get('/brands/profile').then((r) => r.data),
  updateProfile: (data) => api.put('/brands/profile', data).then((r) => r.data),

  getShortlist: () => api.get('/brands/shortlist').then((r) => r.data),
  addToShortlist: (creatorId) => api.post('/brands/shortlist', { creatorId }).then((r) => r.data),
  removeFromShortlist: (id) => api.delete(`/brands/shortlist/${id}`).then((r) => r.data),

  createCampaign: (data) => api.post('/brands/campaigns', data).then((r) => r.data),
  listCampaigns: (params) => api.get('/brands/campaigns', { params }).then((r) => r.data),
  getCampaign: (id) => api.get(`/brands/campaigns/${id}`).then((r) => r.data),
  updateCampaign: (id, data) => api.put(`/brands/campaigns/${id}`, data).then((r) => r.data),
  // Not yet documented/built on the backend - see the production-readiness
  // plan's backend spec. Paths are best-effort guesses.
  approveCampaign: (id) => api.post(`/brands/campaigns/${id}/approve`).then((r) => r.data),
  disputeCampaign: (id, evidence) => api.post(`/brands/campaigns/${id}/dispute`, { evidence }).then((r) => r.data),

  // Billing & invoices, transaction history - specified in BACKEND_API_SPEC.md,
  // not yet built. Paths are the spec's.
  getBilling: () => api.get('/brands/billing').then((r) => r.data),
  listInvoices: (params) => api.get('/brands/invoices', { params }).then((r) => r.data),
  getInvoicePdfUrl: (id) => `${api.defaults.baseURL}/brands/invoices/${id}/pdf`,
  listTransactions: (params) => api.get('/brands/transactions', { params }).then((r) => r.data),

  // Team members on a brand account - specified in BACKEND_API_SPEC.md, not yet built.
  listTeam: () => api.get('/brands/team').then((r) => r.data),
  inviteTeamMember: (email, role) => api.post('/brands/team/invite', { email, role }).then((r) => r.data),
  removeTeamMember: (id) => api.delete(`/brands/team/${id}`).then((r) => r.data),
};
