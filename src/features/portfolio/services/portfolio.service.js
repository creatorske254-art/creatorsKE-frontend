import api from '@/lib/api';

/**
 * The creator's portfolio (builder) and the public portfolio page.
 *
 * GET    /portfolio/:id
 * POST   /portfolio
 * PUT    /portfolio/:id
 * PATCH  /portfolio/:id/draft
 * POST   /portfolio/:id/publish
 * POST   /portfolio/:id/unpublish
 * GET    /portfolio/:id/analytics
 * GET    /public/creators/:id/portfolio
 * POST   /creators/verify-social
 */
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

  verifySocial: (platform, username) =>
    api.post('/creators/verify-social', { platform, username }).then((r) => r.data),
};

const initialsOf = (name) => (name || '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
const formatSocialFollowers = (value) => {
  const count = Number(value);
  if (!Number.isFinite(count)) return String(value);
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(count);
};

// Public portfolio by creator handle (unauthenticated) - used by /c/:handle/portfolio.
// The builder saves social usernames, verified follower counts and privacy flags; the page
// renders only verified counts and contact details the creator has chosen to share.
export const getPublicPortfolio = async (handle) => {
  const body = (await api.get(`/public/creators/${handle}/portfolio`)).data;
  const p = body?.data ?? body ?? {};
  const user = p.user ?? p.creator?.user ?? {};
  const privacy = p.privacy ?? user;
  const showEmail = privacy.show_email ?? p.show_email ?? p.creator?.show_email ?? false;
  const showPhone = privacy.show_phone ?? p.show_phone ?? p.creator?.show_phone ?? false;
  const showFollowers = privacy.show_followers ?? p.show_followers ?? p.creator?.show_followers ?? true;
  const stats = p.socialStats ?? {};
  const contact = p.contact ?? {};
  const accounts = p.socialAccounts ?? {};
  const verified = p.verifiedSocials ?? {};
  const instagramUsername = accounts.instagram_username ?? contact.instagramHandle ?? '';
  const socialProfiles = [
    { key: 'instagram', platform: 'Instagram', username: instagramUsername, count: stats.igFollowers },
    { key: 'tiktok', platform: 'TikTok', username: accounts.tiktok_username ?? '', count: stats.ttFollowers },
    { key: 'medium', platform: 'Medium', username: accounts.medium_username ?? '', count: stats.mediumFollowers },
  ];
  const socialStats = Array.isArray(p.socialStats)
    ? p.socialStats.map((social) => {
      const key = social.platform?.toLowerCase();
      const verifiedCount = verified[key] === true && showFollowers;
      return {
        ...social,
        handle: social.handle || (key === 'instagram' ? instagramUsername : accounts[`${key}_username`] ?? ''),
        metrics: (social.metrics ?? []).filter((metric) => (
          metric.label === 'Followers' ? verifiedCount : false
        )),
      };
    }).filter((social) => social.handle || social.metrics.length)
    : socialProfiles.map(({ key, platform, username, count }) => ({
      platform,
      handle: username ? `@${String(username).replace(/^@/, '')}` : '',
      metrics: showFollowers && verified[key] === true && count !== null && count !== undefined
        ? [{ label: 'Followers', value: formatSocialFollowers(count) }]
        : [],
    })).filter((social) => social.handle || social.metrics.length);
  const name = p.creator?.displayName || p.name || handle;
  const creator = p.creator ?? {};
  return {
    creator: {
      ...creator,
      displayName: name,
      role: creator.role ?? p.role,
      bio: creator.bio ?? p.bio,
      location: creator.location ?? p.location,
      avatar: creator.avatar ?? p.photoUrl ?? null,
      initials: creator.initials ?? initialsOf(name),
      show_email: !!showEmail,
      show_phone: !!showPhone,
      show_followers: !!showFollowers,
      show_rates: privacy.show_rates ?? p.show_rates ?? creator.show_rates ?? false,
    },
    // The hero already shows bio and role, so About only carries text written for it.
    about: { whoIAm: p.about?.whoIAm ?? p.whoIAm, whatIDo: p.about?.whatIDo ?? p.whatIDo },
    niches: (p.niches ?? []).map((n) => (typeof n === 'string' ? { name: n, description: '' } : n)),
    expertise: p.expertise ?? [],
    whyWorkWithMe: p.whyWorkWithMe ?? [],
    collaborations: p.collaborations ?? [],
    socialStats,
    audienceAge: stats.audienceAge,
    contact: {
      email: showEmail ? contact.email : undefined,
      instagram: instagramUsername ? `@${String(instagramUsername).replace(/^@/, '')}` : '',
      phone: showPhone ? contact.phone : undefined,
    },
  };
};