import api from '@/lib/api';

export const portfolioService = {
  // A creator's own portfolio; the first visit creates an empty one so the builder can save.
  getPortfolio: (creatorId) =>
    api.get(`/portfolio/${creatorId}`).then((r) => r.data).catch((err) => {
      if (err?.status === 404) return portfolioService.createPortfolio({});
      throw err;
    }),

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

const initialsOf = (name) => (name || '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');

// Public portfolio by creator handle (unauthenticated) - used by /c/:handle/portfolio.
// The builder saves { name, role, bio, niches, socialStats: {...}, contact: {...} }; the page
// renders { creator, about, niches, socialStats: [{ platform, handle, metrics }], contact }.
export const getPublicPortfolio = async (handle) => {
  const body = (await api.get(`/public/creators/${handle}/portfolio`)).data;
  if (body?.creator) return body;
  const p = body?.data ?? body ?? {};
  const stats = p.socialStats ?? {};
  const contact = p.contact ?? {};
  const ig = contact.instagramHandle ? `@${String(contact.instagramHandle).replace(/^@/, '')}` : '';
  const socialStats = [
    stats.igFollowers && { platform: 'Instagram', handle: ig, metrics: [{ label: 'Followers', value: stats.igFollowers }, stats.igEngagement && { label: 'Engagement', value: `${String(stats.igEngagement).replace(/%$/, '')}%` }].filter(Boolean) },
    stats.ttFollowers && { platform: 'TikTok', handle: '', metrics: [{ label: 'Followers', value: stats.ttFollowers }, stats.ttAvgViews && { label: 'Avg. views', value: stats.ttAvgViews }].filter(Boolean) },
    stats.mediumFollowers && { platform: 'Medium', handle: '', metrics: [{ label: 'Followers', value: stats.mediumFollowers }] },
  ].filter(Boolean);
  const name = p.name || handle;
  return {
    creator: { displayName: name, role: p.role, bio: p.bio, location: p.location, avatar: p.photoUrl || null, initials: initialsOf(name) },
    // The hero already shows bio and role, so About only carries text written for it.
    about: { whoIAm: p.about?.whoIAm ?? p.whoIAm, whatIDo: p.about?.whatIDo ?? p.whatIDo },
    niches: (p.niches ?? []).map((n) => (typeof n === 'string' ? { name: n, description: '' } : n)),
    expertise: p.expertise ?? [],
    whyWorkWithMe: p.whyWorkWithMe ?? [],
    collaborations: p.collaborations ?? [],
    socialStats,
    audienceAge: stats.audienceAge,
    contact: { email: contact.email, instagram: ig, phone: contact.phone },
  };
};