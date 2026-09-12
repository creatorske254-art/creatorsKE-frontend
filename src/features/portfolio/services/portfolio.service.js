import api from '@/lib/api';

export const portfolioService = {
  getPortfolio: (creatorId) =>
    api.get(`/portfolio/${creatorId}`).then((r) => r.data),

  createPortfolio: (data) =>
    api.post('/portfolio', data).then((r) => r.data),

  updatePortfolio: (id, data) =>
    api.put(`/portfolio/${id}`, data).then((r) => r.data),

  saveDraft: (id, data) =>
    api.patch(`/portfolio/${id}/draft`, data).then((r) => r.data),

  publishPortfolio: (id) =>
    api.post(`/portfolio/${id}/publish`).then((r) => r.data),

  unpublishPortfolio: (id) =>
    api.post(`/portfolio/${id}/unpublish`).then((r) => r.data),

  getPortfolioAnalytics: (id) =>
    api.get(`/portfolio/${id}/analytics`).then((r) => r.data),
};

// Public portfolio by creator handle (unauthenticated) - used by /c/:handle/portfolio
export const getPublicPortfolio = (handle) =>
  api.get(`/public/creators/${handle}/portfolio`).then((r) => r.data);