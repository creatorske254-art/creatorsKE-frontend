import api from '@/lib/api';

export const reviewService = {
  submitReview: (data) => api.post('/reviews', data).then((r) => r.data),
  listReviews: (params) => api.get('/reviews', { params }).then((r) => r.data),
};
