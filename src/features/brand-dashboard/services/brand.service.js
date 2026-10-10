import api, { openAuthenticated } from '@/lib/api';

/**
 * Everything a brand account manages: company profile, shortlist, campaigns (bookings) and
 * escrow payment, billing, payment methods and the brand team. Teammates call the same
 * endpoints and act on the owning brand.
 *
 * GET    /brands/profile
 * PUT    /brands/profile
 * GET    /brands/shortlist
 * POST   /brands/shortlist
 * DELETE /brands/shortlist/:id
 * POST   /brands/campaigns
 * GET    /brands/campaigns
 * GET    /brands/campaigns/:id
 * POST   /brands/campaigns/:id/pay
 * POST   /brands/campaigns/:id/approve
 * POST   /brands/campaigns/:id/dispute
 * GET    /brands/billing
 * GET    /brands/invoices
 * GET    /brands/transactions
 * GET    /brands/payment-methods
 * POST   /brands/payment-methods
 * DELETE /brands/payment-methods/:id
 * GET    /brands/team
 * POST   /brands/team/invite
 * PATCH  /brands/team/:id
 * DELETE /brands/team/:id
 */
export const brandService = {
  getProfile: () => api.get('/brands/profile').then((r) => r.data),
  updateProfile: (data) => api.put('/brands/profile', data).then((r) => r.data),

  getShortlist: () => api.get('/brands/shortlist').then((r) => r.data),
  addToShortlist: (creatorId) => api.post('/brands/shortlist', { creatorId }).then((r) => r.data),
  removeFromShortlist: (id) => api.delete(`/brands/shortlist/${id}`).then((r) => r.data),

  createCampaign: (data) => api.post('/brands/campaigns', data).then((r) => r.data),
  listCampaigns: (params) => api.get('/brands/campaigns', { params }).then((r) => r.data),
  getCampaign: (id) => api.get(`/brands/campaigns/${id}`).then((r) => r.data),
  // Sends an M-Pesa STK prompt for the booking amount; the money is held in escrow once paid.
  payCampaign: (id, phoneNumber) => api.post(`/brands/campaigns/${id}/pay`, { phoneNumber }).then((r) => r.data),
  approveCampaign: (id) => api.post(`/brands/campaigns/${id}/approve`).then((r) => r.data),
  disputeCampaign: (id, evidence) => api.post(`/brands/campaigns/${id}/dispute`, { evidence }).then((r) => r.data),

  // Billing & invoices, transaction history
  getBilling: () => api.get('/brands/billing').then((r) => r.data),
  listInvoices: (params) => api.get('/brands/invoices', { params }).then((r) => r.data),
  // The printable invoice opens in a new tab; the token goes in the header, not the URL.
  openInvoice: (id) => openAuthenticated(`/brands/invoices/${id}/pdf`),
  listTransactions: (params) => api.get('/brands/transactions', { params }).then((r) => r.data),

  // How the brand pays creators at checkout
  listPaymentMethods: () => api.get('/brands/payment-methods').then((r) => r.data?.methods ?? r.data ?? []),
  addPaymentMethod: (data) => api.post('/brands/payment-methods', data).then((r) => r.data),
  removePaymentMethod: (id) => api.delete(`/brands/payment-methods/${id}`).then((r) => r.data),

  // Team members on a brand account
  listTeam: () => api.get('/brands/team').then((r) => r.data),
  inviteTeamMember: (email, role) => api.post('/brands/team/invite', { email, role }).then((r) => r.data),
  updateTeamMember: (id, data) => api.patch(`/brands/team/${id}`, data).then((r) => r.data),
  removeTeamMember: (id) => api.delete(`/brands/team/${id}`).then((r) => r.data),
};
