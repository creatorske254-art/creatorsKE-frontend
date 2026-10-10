/*
   The services that reshape backend records for the pages. If the backend's response changes,
   these are the tests that should fail, not a page in production.
*/
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn(), put: vi.fn(), defaults: {} },
  uploadFile: vi.fn(),
  openAuthenticated: vi.fn(),
  downloadAuthenticated: vi.fn(),
}));

const api = (await import('@/lib/api')).default;
const { searchCreators } = await import('@/features/directory/services/directory.service');
const { getPublicPortfolio } = await import('@/features/portfolio/services/portfolio.service');
const { availabilityKey, platformNames } = await import('@/features/rate-card/services/rate-card.service');
const { listPayoutMethods, addPayoutMethod } = await import('@/features/payments/services/payment.service');

beforeEach(() => vi.clearAllMocks());

describe('directory', () => {
  it('maps an API creator row to a directory card', async () => {
    api.get.mockResolvedValue({
      data: [{
        userId: 'u1', firstName: 'Amani', lastName: 'Demo', handle: 'amani', followers: '24000', rating: '4.5', reviewCount: 3, isVerified: true, location: 'Nairobi', category: 'other',
        rateCard: { data: { availability: 'Fully booked', platforms: { instagram: true, tiktok: false }, profile: { niche: 'Food', engagement: '5.1' }, packages: [{ price: 9000 }, { price: 6000 }] } },
      }],
    });
    const { creators } = await searchCreators({});
    expect(creators[0]).toMatchObject({
      id: 'u1', name: 'Amani Demo', handle: 'amani', initials: 'AD', niche: 'Food', followers: 24000, eng: 5.1,
      rating: 4.5, reviews: 3, verified: true, avail: 'booked', platforms: ['Instagram'], price: 6000,
    });
  });
});

describe('rate card helpers', () => {
  it.each([['Open for collabs', 'available'], ['Limited slots', 'limited'], ['Fully booked', 'booked'], [undefined, 'available']])(
    'availabilityKey(%s) is %s', (input, key) => expect(availabilityKey(input)).toBe(key),
  );
  it('lists only the platforms that are switched on', () => {
    expect(platformNames({ instagram: true, tiktok: false, youtube: true })).toEqual(['Instagram', 'YouTube']);
  });
});

describe('public portfolio', () => {
  it("maps the builder's record to the page sections", async () => {
    api.get.mockResolvedValue({
      data: {
        name: 'Amani Demo', role: 'Food creator', bio: 'Nairobi food', photoUrl: 'https://x/p.jpg', niches: ['Food', 'Travel'],
        socialStats: { igFollowers: '24K', igEngagement: '5.1', ttFollowers: '40K', ttAvgViews: '12K' },
        contact: { email: 'a@example.com', instagramHandle: 'amani' },
      },
    });
    const page = await getPublicPortfolio('amani');
    expect(page.creator).toMatchObject({ displayName: 'Amani Demo', role: 'Food creator', avatar: 'https://x/p.jpg', initials: 'AD' });
    expect(page.niches).toEqual([{ name: 'Food', description: '' }, { name: 'Travel', description: '' }]);
    expect(page.socialStats.map((s) => s.platform)).toEqual(['Instagram', 'TikTok']);
    expect(page.socialStats[0].metrics).toEqual([{ label: 'Followers', value: '24K' }, { label: 'Engagement', value: '5.1%' }]);
    expect(page.contact).toEqual({ email: 'a@example.com', instagram: '@amani', phone: undefined });
  });
});

describe('payout methods', () => {
  it('reads label and isPrimary from the API', async () => {
    api.get.mockResolvedValue({ data: [{ id: 'm1', type: 'mpesa', label: 'M-Pesa', detail: '+254*** 678', isPrimary: true }] });
    expect(await listPayoutMethods()).toEqual([expect.objectContaining({ id: 'm1', name: 'M-Pesa', primary: true })]);
  });

  it('sends the API field names and drops empty ones', async () => {
    api.post.mockResolvedValue({ data: { id: 'm2', label: 'Equity', isPrimary: false } });
    await addPayoutMethod({ type: 'bank', name: 'Equity', fields: { bank: 'Equity Bank', account: '0123456789', holder: 'Amani Demo', phone: '' } });
    expect(api.post).toHaveBeenCalledWith('/payments/methods', { type: 'bank', label: 'Equity', bankName: 'Equity Bank', accountNumber: '0123456789', accountName: 'Amani Demo' });
  });
});
