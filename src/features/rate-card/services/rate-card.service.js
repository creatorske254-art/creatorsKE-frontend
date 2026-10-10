import api from '@/lib/api';
import { getInitials, formatCount } from '@/lib/utils';

/**
 * Rate cards: the creator's own (create, autosave, publish) and the public card at /c/:handle.
 *
 * POST   /rate-cards
 * GET    /rate-cards/:id
 * PATCH  /rate-cards/:id
 * POST   /rate-cards/:id/publish
 * POST   /rate-cards/:id/unpublish
 * POST   /rate-cards/:id/reorder
 * PATCH  /rate-cards/:id/draft
 * GET    /rate-cards/:id/analytics
 * GET    /rate-cards
 * DELETE /rate-cards/:id
 * GET    /rate-cards/health
 * GET    /public/creators/:id/rate-card
 * GET    /public/creators/:id
 * GET    /reviews
 */
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

const PLATFORM_LABELS = { instagram: 'Instagram', tiktok: 'TikTok', youtube: 'YouTube', twitter: 'Twitter / X', podcast: 'Podcast' };

// The builder stores the availability label it shows; listings key their badge by a short code.
export const availabilityKey = (value) => {
  const v = String(value ?? '').toLowerCase();
  if (v.includes('limited')) return 'limited';
  if (v.includes('booked') || v.includes('unavailable')) return 'booked';
  return 'available';
};

// The builder stores platforms as an on/off map ({ instagram: true }); older cards hold an array.
export const platformNames = (platforms) => {
  if (Array.isArray(platforms)) return platforms.map((p) => (typeof p === 'string' ? p : p?.name)).filter(Boolean);
  return Object.entries(platforms ?? {}).filter(([, on]) => on).map(([key]) => PLATFORM_LABELS[key] ?? key);
};

// Public rate card by creator handle (unauthenticated) - used by /c/:handle.
// The documented shape is { creator, packages, stats, reviews, ... }. The live API returns the
// rate-card record (builder fields: profile, packages, platforms, leadTime...) and serves the
// creator and their reviews from separate endpoints, so they are combined here.
export const getPublicRateCard = async (handle) => {
  const body = (await api.get(`/public/creators/${handle}/rate-card`)).data;
  if (body?.creator) return body;

  const card = body?.data ?? body ?? {};
  const profile = card.profile ?? {};
  const entry = await api.get(`/public/creators/${handle}`).then((r) => r.data).catch(() => null);
  const creatorId = entry?.userId ?? body?.ownerId;
  const reviews = creatorId
    ? await api.get('/reviews', { params: { creatorId } }).then((r) => r.data ?? []).catch(() => [])
    : [];
  const displayName =
    [entry?.firstName, entry?.lastName].filter(Boolean).join(' ') || profile.name || entry?.name || body?.title || handle;
  // The builder saves packages as { desc, feat }; the page renders { description, featured }.
  const packages = (card.packages ?? []).map((p) => ({
    ...p, price: Number(p.price) || 0, description: p.description ?? p.desc, featured: p.featured ?? p.feat ?? false,
  }));
  const days = packages.find((p) => p.turnaroundDays)?.turnaroundDays;
  const turnaround = card.leadTime || (days ? `${days} days` : undefined);
  const ratings = reviews.map((r) => Number(r.rating)).filter((n) => n > 0);

  return {
    creator: {
      id: creatorId,
      handle: body?.handle ?? handle,
      displayName,
      initials: getInitials(displayName),
      bio: entry?.bio || profile.bio || entry?.description,
      location: entry?.location || profile.location,
      languages: profile.languages,
      availability: card.availability,
      platforms: platformNames(card.platforms).map((name) => ({ name })),
    },
    niches: [entry?.niche || profile.niche].filter(Boolean),
    stats: {
      avgEngagement: profile.engagement ? `${profile.engagement}%` : undefined,
      totalReach: profile.reach ? formatCount(Number(String(profile.reach).replace(/[^\d]/g, ''))) : undefined,
      turnaroundDays: turnaround,
    },
    turnaroundDays: turnaround,
    averageRating: ratings.length ? ratings.reduce((s, n) => s + n, 0) / ratings.length : 0,
    reviewCount: ratings.length,
    packages,
    reviews: reviews.map((r) => ({
      ...r,
      brand: r.brand,
      initials: getInitials(r.brand ?? ''),
      date: r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-KE', { month: 'long', year: 'numeric' }) : '',
    })),
  };
};