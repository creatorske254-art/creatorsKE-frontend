import api from '@/lib/api';

/**
 * Plans: the public list for the pricing page, the signed-in creator's current plan, and
 * switching plans.
 *
 * GET    /plans/current
 * POST   /plans/upgrade
 */
export const planService = {
  getCurrentPlan: () => api.get('/plans/current').then((r) => r.data),
  // payload: { planId, paymentMethod?, name?, price? } - name/price let a brand's
  // billing plan mirror the chosen pricing tier.
  upgradePlan: (payload) =>
    api.post('/plans/upgrade', payload).then((r) => r.data),
};
