import api from '@/lib/api';

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
  return response.data; // { creators: [], total: number, page: number, totalPages: number }
}

/**
 * Fetch available filter options (niches, platforms) from the backend.
 */
export async function getFilterOptions() {
  const response = await api.get('/directory/filter-options');
  return response.data; // { niches: string[], platforms: string[] }
}

/**
 * Public creator listing (no auth) — used for the public directory browse.
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
