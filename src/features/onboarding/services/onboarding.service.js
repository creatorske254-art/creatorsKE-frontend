import api from '@/lib/api';

export const onboardingService = {
  saveDraft: (data) => api.post('/onboarding/draft', data).then((r) => r.data),
  resume: () => api.get('/onboarding/resume').then((r) => r.data),
  complete: (data) => api.post('/onboarding/complete', data).then((r) => r.data),
};
