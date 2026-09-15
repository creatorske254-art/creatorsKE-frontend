import api from '@/lib/api';

export const planService = {
  getCurrentPlan: () => api.get('/plans/current').then((r) => r.data),
  // payload: { planId, paymentMethod?, name?, price? } - name/price let a brand's
  // billing plan mirror the chosen pricing tier.
  upgradePlan: (payload) =>
    api.post('/plans/upgrade', payload).then((r) => r.data),
};
