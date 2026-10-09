import api from '@/lib/api';
import { getInitials } from '@/lib/utils';
import { platformNames, availabilityKey } from '@/features/rate-card';

// The live API returns the creator row joined with their published rate card. Map it to the card
// shape the directory renders; entries that already carry `initials` (the documented shape) pass through.
function toDirectoryCard(entry) {
  if (!entry || entry.initials) return entry;
  const name = [entry.firstName, entry.lastName].filter(Boolean).join(' ') || entry.name || entry.handle || '';
  const card = entry.rateCard?.data ?? {};
  const prices = (card.packages ?? []).map((p) => Number(p.price)).filter((n) => n > 0);
  const engagement = card.profile?.engagement ?? card.engagement;
  return {
    id: entry.userId ?? entry.id,
    name,
    handle: entry.handle ?? '',
    initials: getInitials(name),
    niche: entry.niche || card.profile?.niche || (entry.category !== 'other' ? entry.category : '') || '',
    followers: Number(entry.followers) || 0,
    eng: engagement ? Number(engagement) : null,
    rating: Number(entry.rating) || 0,
    reviews: entry.reviewCount ?? 0,
    verified: Boolean(entry.isVerified),
    avail: availabilityKey(card.availability),
    bg: 'linear-gradient(135deg, var(--purple-100), var(--purple-50))',
    platforms: platformNames(card.platforms),
    location: entry.location ?? '',
    bio: entry.bio ?? '',
    price: prices.length ? Math.min(...prices) : null,
    priceUnit: 'per campaign',
  };
}

/**
 * Search creators with optional filters.
 * @param {Object} filters - { keyword, niche, platform, followerRange, location, availability, page }
 */
export async function searchCreators(filters = {}) {
  const params = new URLSearchParams();

  if (filters.keyword)      params.set('q', filters.keyword);
  if (filters.niche)        params.set('niche', filters.niche);
  if (filters.platform)     params.set('platform', filters.platform);
  if (filters.followerRange) params.set('follower_range', filters.followerRange);
  if (filters.location)     params.set('location', filters.location);
  if (filters.availability) params.set('availability', filters.availability);
  if (filters.page)         params.set('page', filters.page);

  const response = await api.get(`/directory?${params.toString()}`);
  const body = response.data;
  if (Array.isArray(body)) {
    const p = body.pagination;
    return {
      creators: body.map(toDirectoryCard),
      total: p?.total ?? body.length,
      page: p?.page ?? 1,
      totalPages: p?.pages ?? p?.totalPages ?? 1,
    };
  }
  return body; // { creators: [], total: number, page: number, totalPages: number }
}

/**
 * Fetch available filter options (niches, platforms) from the backend.
 */
export async function getFilterOptions() {
  const response = await api.get('/directory/filter-options');
  const body = response.data;
  return Array.isArray(body) ? { niches: [], platforms: [] } : body; // { niches: string[], platforms: string[] }
}

/**
 * Public creator listing (no auth) - used for the public directory browse.
 * @param {Object} params - { page, limit, category, isVerified }
 */
export async function listCreators(params = {}) {
  const response = await api.get('/creators', { params });
  return response.data;
}

export async function getCreatorById(id) {
  const response = await api.get(`/creators/${id}`);
  return response.data;
}

export async function createCreatorProfile(data) {
  const response = await api.post('/creators', data);
  return response.data;
}

export async function updateCreatorProfile(id, data) {
  const response = await api.patch(`/creators/${id}`, data);
  return response.data;
}
