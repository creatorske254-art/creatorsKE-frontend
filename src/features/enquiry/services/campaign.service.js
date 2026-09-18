import api from '@/lib/api';

// The creator's own view of a booked enquiry's campaign - created server-side
// when the enquiry is accepted (see enquiryService.acceptEnquiry). Mirrors
// brandService's /brands/campaigns/:id, scoped to /creators instead.
export const campaignService = {
  getCampaign: (id) => api.get(`/creators/campaigns/${id}`).then((r) => r.data),
  deliverCampaign: (id, payload) => api.post(`/creators/campaigns/${id}/deliver`, payload).then((r) => r.data),
};
