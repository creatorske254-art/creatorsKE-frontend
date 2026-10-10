import api from '@/lib/api';

/**
 * Reviews: a brand reviews a completed campaign, anyone reads a creator's reviews, the creator
 * replies once.
 *
 * POST   /reviews
 * GET    /reviews
 * POST   /reviews/:id/reply
 */
export const reviewService = {
  submitReview: (data) => api.post('/reviews', data).then((r) => r.data),
  listReviews: (params) => api.get('/reviews', { params }).then((r) => r.data),
  // The creator's one public reply under a review.
  replyToReview: (reviewId, reply) => api.post(`/reviews/${reviewId}/reply`, { reply }).then((r) => r.data),
};
