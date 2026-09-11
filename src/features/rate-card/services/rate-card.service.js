import api from '@/lib/api';

export const rateCardService = {
  createRateCard: (data) =>
    api.post('/rate-cards', data).then((r) => r.data),

  getRateCard: (id) =>
    api.get(`/rate-cards/${id}`).then((r) => r.data),

  updateRateCard: (id, data) =>
    api.patch(`/rate-cards/${id}`, data).then((r) => r.data),

  publishRateCard: (id) =>
    api.post(`/rate-cards/${id}/publish`).then((r) => r.data),

  unpublishRateCard: (id) =>
    api.post(`/rate-cards/${id}/unpublish`).then((r) => r.data),

  reorderPackages: (id, order) =>
    api.post(`/rate-cards/${id}/reorder`, { order }).then((r) => r.data),

  saveDraft: (id, data) =>
    api.patch(`/rate-cards/${id}/draft`, data).then((r) => r.data),

  getRateCardAnalytics: (id) =>
    api.get(`/rate-cards/${id}/analytics`).then((r) => r.data),

  listRateCards: () =>
    api.get('/rate-cards').then((r) => r.data),

  deleteRateCard: (id) =>
    api.delete(`/rate-cards/${id}`).then((r) => r.data),
};

export const getCardHealth = () =>
  api.get('/rate-cards/health').then((r) => r.data);

// Public rate card by creator handle (unauthenticated) — used by /c/:handle
export const getPublicRateCard = (handle) =>
  api.get(`/public/creators/${handle}/rate-card`).then((r) => r.data);