import api from '@/lib/api';

export const reviewService = {
  submitReview: (data) => api.post('/reviews', data).then((r) => r.data),
  listReviews: (params) => api.get('/reviews', { params }).then((r) => r.data),
  // Not yet documented/built on the backend — see the production-readiness
  // plan's backend spec. Path is a best-effort guess.
  replyToReview: (reviewId, reply) => api.post(`/reviews/${reviewId}/reply`, { reply }).then((r) => r.data),
};
