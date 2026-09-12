/**
 * Sample datasets for dashboard charts and the not-yet-backed pages.
 *
 * Only ever shown through `useDemoFallback` (dev builds, when the backend
 * can't serve the query) and always next to a <DemoTag />. Shapes mirror the
 * response contracts in BACKEND_API_SPEC.md so swapping in the real endpoint
 * is a no-op for the page. Deterministic (no Math.random) so screenshots and
 * reviews are reproducible.
 */

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}
function monthLabel(offset) {
  const d = new Date();
  d.setMonth(d.getMonth() - offset, 1);
  return d.toLocaleDateString('en-KE', { month: 'short' });
}
// A smooth, plausible curve without randomness.
function wave(i, base, amp, period = 7, phase = 0) {
  return Math.round(base + amp * Math.sin((i + phase) / period) + (amp / 3) * Math.cos(i / 3));
}

/* ── Creator ─────────────────────────────────────────────────────────────── */

export function demoEarningsTimeline(period = '30d') {
  // Daily points for the dashboard's 7d/30d/90d; weekly for 3m/6m, monthly for 1y.
  if (period === '3m' || period === '6m') {
    const weeks = period === '3m' ? 13 : 26;
    return Array.from({ length: weeks }, (_, i) => ({
      label: `Wk ${new Date(daysAgo((weeks - 1 - i) * 7) + 'T00:00:00').toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}`,
      amount: Math.max(0, wave(i, 24000, 9000, 3, 1) + i * 900),
    }));
  }
  if (period === '1y') {
    return Array.from({ length: 12 }, (_, i) => ({ label: monthLabel(11 - i), amount: [64, 71, 58, 92, 88, 104, 97, 121, 118, 133, 149, 156][i] * 1000 }));
  }
  const n = period === '7d' ? 7 : period === '90d' ? 90 : 30;
  return Array.from({ length: n }, (_, i) => ({
    date: daysAgo(n - 1 - i),
    amount: Math.max(0, wave(i, 3600, 1500, 4, 1) + Math.round(i * (9000 / n))),
  }));
}

export const DEMO_ADMIN_STATS = {
  activeCreators: 571, registeredBrands: 95, liveRateCards: 438, enquiriesLast7Days: 360,
  bookingsInProgress: 42, completedThisMonth: 118, transactionVolume: 2680000, platformFeesCollected: 268000,
};

export const DEMO_VIEWS_BY_DAY = Array.from({ length: 14 }, (_, i) => ({
  date: daysAgo(13 - i),
  views: Math.max(8, wave(i, 42, 22, 3, 1)),
}));

export const DEMO_ENQUIRY_STAGES = [
  { label: 'New', value: 4 },
  { label: 'In review', value: 3 },
  { label: 'Booked', value: 5 },
  { label: 'Completed', value: 11 },
];

export const DEMO_EARNINGS_BY_PACKAGE = [
  { label: 'Reel + caption', amount: 66000 },
  { label: 'TikTok bundle', amount: 48000 },
  { label: 'Story set', amount: 27000 },
  { label: 'UGC video', amount: 21000 },
  { label: 'Podcast mention', amount: 9000 },
];

/* ── Brand ───────────────────────────────────────────────────────────────── */

export const DEMO_SPEND_BY_MONTH = Array.from({ length: 6 }, (_, i) => ({
  label: monthLabel(5 - i),
  released: [38000, 52000, 41000, 67000, 59000, 74000][i],
  escrow: [12000, 8000, 20000, 15000, 22000, 31000][i],
}));

export const DEMO_CAMPAIGN_STATUS = [
  { label: 'Active', value: 3 },
  { label: 'Awaiting approval', value: 2 },
  { label: 'Completed', value: 9 },
  { label: 'Disputed', value: 1 },
];

export const DEMO_BRAND_FUNNEL = [
  { label: 'Creators shortlisted', value: 24 },
  { label: 'Enquiries sent', value: 15 },
  { label: 'Replied', value: 11 },
  { label: 'Booked', value: 7 },
  { label: 'Delivered', value: 5 },
];

/* ── Admin ───────────────────────────────────────────────────────────────── */

export const DEMO_PLATFORM_GROWTH = Array.from({ length: 8 }, (_, i) => ({
  label: monthLabel(7 - i),
  creators: [120, 168, 214, 279, 342, 410, 486, 571][i],
  brands: [18, 24, 33, 41, 52, 66, 79, 95][i],
}));

export const DEMO_ENQUIRY_VOLUME = Array.from({ length: 14 }, (_, i) => ({
  date: daysAgo(13 - i),
  count: [31, 44, 38, 52, 48, 37, 61, 55, 42, 58, 63, 47, 51, 44][i],
}));

export const DEMO_ABANDONED_DRAFTS = [
  { label: 'Profile basics', value: 9 },
  { label: 'Social stats', value: 21 },
  { label: 'Packages', value: 34 },
  { label: 'Payment method', value: 48 },
  { label: 'Publish', value: 12 },
];

export const DEMO_ESCROW_AGING = [
  { label: '0-7 days', value: 14 },
  { label: '8-14 days', value: 6 },
  { label: '15-30 days', value: 3 },
  { label: '30+ days', value: 2 },
];

export const DEMO_DISPUTES_BY_OUTCOME = Array.from({ length: 6 }, (_, i) => ({
  label: monthLabel(5 - i),
  creator: [2, 1, 3, 2, 4, 3][i],
  brand: [1, 2, 1, 3, 2, 2][i],
  split: [0, 1, 1, 0, 1, 2][i],
}));

export const DEMO_REVENUE = Array.from({ length: 8 }, (_, i) => ({
  label: monthLabel(7 - i),
  amount: [92000, 118000, 131000, 164000, 187000, 205000, 241000, 268000][i],
}));

/* ── Brand: billing & transactions ───────────────────────────────────────── */

export const DEMO_BRAND_BILLING = {
  plan: { id: 'pro', name: 'Pro', price: 4000, interval: 'month', renewsAt: daysAgo(-18), status: 'active' },
  paymentMethod: { type: 'card', brand: 'Visa', last4: '4521', expiry: '09/27' },
  invoices: [
    { id: 'inv_1042', number: 'CK-2026-1042', issuedAt: daysAgo(3),  description: 'Campaign: Q3 launch reel - Amara K.', amount: 28000, status: 'paid' },
    { id: 'inv_1041', number: 'CK-2026-1041', issuedAt: daysAgo(12), description: 'Pro plan - monthly', amount: 4000, status: 'paid' },
    { id: 'inv_1037', number: 'CK-2026-1037', issuedAt: daysAgo(19), description: 'Campaign: TikTok bundle - Brian O.', amount: 45000, status: 'paid' },
    { id: 'inv_1031', number: 'CK-2026-1031', issuedAt: daysAgo(27), description: 'Campaign: Story set - Wanjiru M.', amount: 15000, status: 'overdue' },
    { id: 'inv_1030', number: 'CK-2026-1030', issuedAt: daysAgo(42), description: 'Pro plan - monthly', amount: 4000, status: 'paid' },
    { id: 'inv_1024', number: 'CK-2026-1024', issuedAt: daysAgo(58), description: 'Campaign: UGC video x3 - Kevin N.', amount: 63000, status: 'refunded' },
    { id: 'inv_1019', number: 'CK-2026-1019', issuedAt: daysAgo(73), description: 'Pro plan - monthly', amount: 4000, status: 'paid' },
    { id: 'inv_1012', number: 'CK-2026-1012', issuedAt: daysAgo(88), description: 'Campaign: Podcast mention - Zawadi N.', amount: 9000, status: 'paid' },
    { id: 'inv_1008', number: 'CK-2026-1008', issuedAt: daysAgo(104), description: 'Pro plan - monthly', amount: 4000, status: 'paid' },
    { id: 'inv_1003', number: 'CK-2026-1003', issuedAt: daysAgo(121), description: 'Campaign: Reel + caption - Amara K.', amount: 22000, status: 'paid' },
    { id: 'inv_0997', number: 'CK-2026-0997', issuedAt: daysAgo(135), description: 'Pro plan - monthly', amount: 4000, status: 'paid' },
    { id: 'inv_0990', number: 'CK-2026-0990', issuedAt: daysAgo(152), description: 'Campaign: Story set - Wanjiru M.', amount: 15000, status: 'paid' },
  ],
};

export const DEMO_BRAND_TRANSACTIONS = [
  { id: 'tx_901', date: daysAgo(1),  type: 'deposit',  campaign: 'Q3 launch reel',   creator: 'Amara K.',   amount: 28000, status: 'held' },
  { id: 'tx_897', date: daysAgo(4),  type: 'release',  campaign: 'TikTok bundle',    creator: 'Brian O.',   amount: 45000, status: 'completed' },
  { id: 'tx_890', date: daysAgo(9),  type: 'deposit',  campaign: 'TikTok bundle',    creator: 'Brian O.',   amount: 45000, status: 'completed' },
  { id: 'tx_882', date: daysAgo(15), type: 'refund',   campaign: 'UGC video x3',     creator: 'Kevin N.',   amount: 63000, status: 'completed' },
  { id: 'tx_874', date: daysAgo(22), type: 'release',  campaign: 'Story set',        creator: 'Wanjiru M.', amount: 15000, status: 'completed' },
  { id: 'tx_869', date: daysAgo(26), type: 'deposit',  campaign: 'Story set',        creator: 'Wanjiru M.', amount: 15000, status: 'completed' },
  { id: 'tx_851', date: daysAgo(40), type: 'fee',      campaign: 'Pro plan',         creator: null,         amount: 4000,  status: 'completed' },
  { id: 'tx_833', date: daysAgo(55), type: 'deposit',  campaign: 'UGC video x3',     creator: 'Kevin N.',   amount: 63000, status: 'completed' },
  { id: 'tx_820', date: daysAgo(70), type: 'fee',      campaign: 'Pro plan',         creator: null,         amount: 4000,  status: 'completed' },
  { id: 'tx_811', date: daysAgo(84), type: 'release',  campaign: 'Podcast mention',  creator: 'Zawadi N.',  amount: 9000,  status: 'completed' },
  { id: 'tx_809', date: daysAgo(90), type: 'deposit',  campaign: 'Podcast mention',  creator: 'Zawadi N.',  amount: 9000,  status: 'completed' },
  { id: 'tx_795', date: daysAgo(118), type: 'release', campaign: 'Reel + caption',   creator: 'Amara K.',   amount: 22000, status: 'completed' },
  { id: 'tx_790', date: daysAgo(124), type: 'deposit', campaign: 'Reel + caption',   creator: 'Amara K.',   amount: 22000, status: 'completed' },
];

/* ── Admin: escrow, deletion requests, re-engagement ──────────────────────── */

export const DEMO_ESCROW_CASES = [
  { id: 'esc_301', campaign: 'Q3 launch reel',  brand: 'Safaricom Digital', creator: 'Amara K.',   amount: 28000, heldSince: daysAgo(1),  status: 'held' },
  { id: 'esc_298', campaign: 'Skincare series', brand: 'Nivea Kenya',       creator: 'Faith W.',   amount: 54000, heldSince: daysAgo(6),  status: 'awaiting_approval' },
  { id: 'esc_291', campaign: 'Sneaker drop',    brand: 'Bata Kenya',        creator: 'Dennis M.',  amount: 36000, heldSince: daysAgo(12), status: 'disputed' },
  { id: 'esc_287', campaign: 'Campus tour',     brand: 'KCB Bank',          creator: 'Lucy A.',    amount: 72000, heldSince: daysAgo(16), status: 'awaiting_approval' },
  { id: 'esc_280', campaign: 'Ramadan recipes', brand: 'Bidco Africa',      creator: 'Hassan O.',  amount: 41000, heldSince: daysAgo(33), status: 'held' },
];

export const DEMO_DELETION_REQUESTS = [
  { id: 'del_51', user: { name: 'Peter Njoroge', email: 'peter.n@example.com', role: 'creator' }, requestedAt: daysAgo(2),  reason: 'Taking a break from content creation', openItems: 0, graceEndsAt: daysAgo(-12), status: 'pending' },
  { id: 'del_49', user: { name: 'Lumen Studio',  email: 'ops@lumen.example',   role: 'brand'   }, requestedAt: daysAgo(5),  reason: 'Company closing its Kenya operations', openItems: 1, graceEndsAt: daysAgo(-9),  status: 'pending' },
  { id: 'del_44', user: { name: 'Grace Achieng', email: 'grace.a@example.com', role: 'creator' }, requestedAt: daysAgo(11), reason: 'Moving to a different platform', openItems: 0, graceEndsAt: daysAgo(-3),  status: 'pending' },
  { id: 'del_39', user: { name: 'Tom Kiprop',    email: 'tom.k@example.com',   role: 'creator' }, requestedAt: daysAgo(20), reason: 'Duplicate account', openItems: 0, graceEndsAt: daysAgo(6), status: 'approved' },
  { id: 'del_35', user: { name: 'Zawadi Foods',  email: 'hello@zawadi.example', role: 'brand'  }, requestedAt: daysAgo(28), reason: 'Requested by mistake', openItems: 2, graceEndsAt: daysAgo(14), status: 'rejected' },
];

export const DEMO_REENGAGEMENT = {
  segments: [
    { id: 'abandoned_drafts', label: 'Abandoned onboarding drafts', description: 'Started a rate card, no activity for 7+ days', count: 124, lastSentAt: daysAgo(3) },
    { id: 'never_published',  label: 'Never published',              description: 'Completed onboarding, rate card still a draft', count: 61,  lastSentAt: daysAgo(9) },
    { id: 'inactive_30d',     label: 'Inactive 30 days',             description: 'Published creators with no login in 30 days', count: 212, lastSentAt: null },
    { id: 'no_enquiry_reply', label: 'Unanswered enquiries',         description: 'Creators with an enquiry unanswered for 48h+', count: 17,  lastSentAt: daysAgo(1) },
  ],
  history: [
    { id: 're_88', segment: 'Unanswered enquiries',         sentAt: daysAgo(1),  recipients: 19,  opened: 11, clicked: 6,  reactivated: 4 },
    { id: 're_87', segment: 'Abandoned onboarding drafts',  sentAt: daysAgo(3),  recipients: 131, opened: 58, clicked: 27, reactivated: 14 },
    { id: 're_84', segment: 'Never published',              sentAt: daysAgo(9),  recipients: 66,  opened: 31, clicked: 12, reactivated: 7 },
    { id: 're_80', segment: 'Abandoned onboarding drafts',  sentAt: daysAgo(17), recipients: 118, opened: 49, clicked: 21, reactivated: 9 },
    { id: 're_75', segment: 'Inactive 30 days',             sentAt: daysAgo(31), recipients: 198, opened: 71, clicked: 24, reactivated: 11 },
  ],
};
