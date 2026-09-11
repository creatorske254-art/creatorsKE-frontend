import api from '@/lib/api';

export const planService = {
  getCurrentPlan: () => api.get('/plans/current').then((r) => r.data),
  upgradePlan: (planId, paymentMethod) =>
    api.post('/plans/upgrade', { planId, paymentMethod }).then((r) => r.data),
};
