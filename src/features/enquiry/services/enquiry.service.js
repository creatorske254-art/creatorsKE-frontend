import api from '@/lib/api';

/**
 * Enquiries, from both sides: a brand sends one; the creator accepts (which opens an unpaid
 * campaign) or declines.
 *
 * POST   /enquiries
 * GET    /enquiries
 * GET    /enquiries/:id
 * POST   /enquiries/:id/accept
 * POST   /enquiries/:id/decline
 */
export const enquiryService = {
  createEnquiry: (data) => api.post('/enquiries', data).then((r) => r.data),
  listEnquiries: (params) => api.get('/enquiries', { params }).then((r) => r.data),
  getEnquiry: (id) => api.get(`/enquiries/${id}`).then((r) => r.data),
  acceptEnquiry: (id) => api.post(`/enquiries/${id}/accept`).then((r) => r.data),
  declineEnquiry: (id) => api.post(`/enquiries/${id}/decline`).then((r) => r.data),
};
