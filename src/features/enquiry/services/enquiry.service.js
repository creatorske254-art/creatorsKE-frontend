import api from '@/lib/api';

export const enquiryService = {
  createEnquiry: (data) => api.post('/enquiries', data).then((r) => r.data),
  listEnquiries: (params) => api.get('/enquiries', { params }).then((r) => r.data),
  getEnquiry: (id) => api.get(`/enquiries/${id}`).then((r) => r.data),
  acceptEnquiry: (id) => api.post(`/enquiries/${id}/accept`).then((r) => r.data),
  declineEnquiry: (id) => api.post(`/enquiries/${id}/decline`).then((r) => r.data),
  expireEnquiry: (id) => api.post(`/enquiries/${id}/expire`).then((r) => r.data),
};
