# Backend endpoint spec — production-readiness gaps

This is a deliverable from the frontend production-readiness pass: a list of backend endpoints the frontend now calls (with a graceful "not available yet" fallback) but that don't exist in the documented API yet, plus two response-shape confirmations needed for endpoints that do exist. Frontend code is already wired to these paths — once built, most require no frontend changes beyond removing the `retry: false` guard.

## Missing endpoints

| Method | Path (guess) | Purpose | Consumer | Frontend seam |
|---|---|---|---|---|
| GET | `/admin/accounts` | List **all** accounts (not just flagged), with filters (role, status, search) | `AccountsPage.jsx` | `adminService.listAccounts()`, `useAccounts()` |
| POST | `/admin/invite` | Invite a new admin user (email + role) | `AccountsPage.jsx` "Invite admin" | `adminService.inviteAdmin()`, `useAccounts().invite` |
| POST | `/admin/disputes/:id/reply` | Admin posts a message into an open dispute without resolving it (distinct from `resolveDispute`, which closes it) | `DisputesPage.jsx` | `adminService.replyToDispute()`, `useDisputes().reply` |
| GET | `/admin/reviews` (or `/reviews?flagged=true`) | Cross-creator review moderation feed — `reviewService.listReviews` is scoped to one creator (`{creatorId}`), not a moderation queue | `admin/ReviewsPage.jsx` | not yet seamed (page still shows labeled demo data) |
| POST | `/reviews/:id/reply` | Creator posts a single public reply to a review | `features/reviews/components/ReviewResponse.jsx`, public `RateCardPage.jsx` | `reviewService.replyToReview()`, `useReviews().reply` |
| GET | `/payments/methods` | List a creator's saved payout methods (M-Pesa/Airtel/bank) | `MoneyPage.jsx` payment-methods card | not yet seamed (local-only list, honest "coming soon" for Add) |
| POST | `/payments/methods` | Link/add a new payout method | `MoneyPage.jsx` "Add payment method", `RateCardBuilderPage.jsx` payment step | same as above |
| PATCH | `/payments/methods/:id/primary` | Set a payout method as primary | `MoneyPage.jsx` "Set as primary" | same as above |
| DELETE | `/payments/methods/:id` | Remove a payout method | `MoneyPage.jsx` | same as above |
| POST | `/brands/campaigns/:id/approve` | Brand approves a delivered campaign and releases escrow | `CampaignDetailPage.jsx` | `brandService.approveCampaign()`, `useCampaignActions(id).approve` |
| POST | `/brands/campaigns/:id/dispute` | Brand raises a dispute on a campaign with evidence | `CampaignDetailPage.jsx` | `brandService.disputeCampaign()`, `useCampaignActions(id).dispute` |
| GET | `/rate-cards/completeness` (or a field added to an existing response) | Real per-creator rate-card completeness score | `useCreatorDashboard.js` / creator `DashboardPage.jsx` | worked around client-side for now (computed from package/payment-method counts against the documented per-plan limits in `pricingTiers.js`) |

## Dashboard charts and operations pages (added with the chart kit)

Every row below is wired in the frontend already: a service method, a TanStack hook with `retry: false`, and a page that renders the real response when it arrives. Until it does, **dev builds** show a deterministic sample tagged "Demo data" (`src/lib/demoData.js` via `useDemoFallback`); production builds show the honest empty/error state. Response shapes are what the pages read - matching them means zero frontend changes.

| Method | Path | Purpose | Response shape the page reads | Consumer |
|---|---|---|---|---|
| GET | `/admin/stats` (extend) | Overview KPIs **plus** chart series | add `growth: [{ label, creators, brands }]` (monthly), `enquiryTimeline: [{ date, count }]` (daily, 90 days), `abandonedDraftsByStep: [{ label, value }]`, `escrowAging: [{ label, value }]` (buckets `0-7 days`, `8-14 days`, `15-30 days`, `30+ days`) | `admin/OverviewPage.jsx` |
| GET | `/payments/earnings/timeline` (confirm) | Creator earnings over time | `[{ date: 'YYYY-MM-DD', amount }]` for `period=7d\|30d\|90d`; `[{ label, amount }]` per week/month for `3m\|6m\|1y` | creator `DashboardPage.jsx`, `MoneyPage.jsx` |
| GET | `/rate-cards/:id/analytics` (confirm) | Card views by day | `{ views: [{ date, count }] }` (last 14 days) | creator `DashboardPage.jsx` "Card views" |
| GET | `/payments/transactions` (confirm) | Transaction rows carry the package | each row: `{ id, date, type, amount, package \| packageName, status }` - `package` drives "Earnings by package" | `MoneyPage.jsx` |
| GET | `/brands/campaigns` (confirm) | Campaign rows carry a timestamp | each row: `completedAt` / `deliveredAt` / `createdAt` - drives "Spend by month" and "Campaigns by status" | brand `DashboardPage.jsx` |
| GET | `/brands/billing` | Plan + payment method on file | `{ plan: { id, name, price, interval, renewsAt, status }, paymentMethod: { type, brand, last4, expiry }, billingName }` | `brand/BillingPage.jsx` |
| GET | `/brands/invoices` | Invoice list | `{ invoices: [{ id, number, issuedAt, description, amount, status: paid\|due\|overdue\|refunded\|void }] }` | `brand/BillingPage.jsx` |
| GET | `/brands/invoices/:id/pdf` | Invoice PDF (auth'd download) | `application/pdf` | `brand/BillingPage.jsx` "PDF" |
| GET | `/brands/transactions?range=30d\|90d\|1y` | Escrow ledger for the brand | `{ transactions: [{ id, date, type: deposit\|release\|refund\|fee, campaign, creator, amount, status: completed\|held\|pending\|failed }] }` | `brand/TransactionsPage.jsx` |
| GET | `/admin/escrow` | Open escrow cases | `{ cases: [{ id, campaign, brand, creator, amount, heldSince, status: held\|awaiting_approval\|disputed\|released }] }` | `admin/EscrowPage.jsx` |
| POST | `/admin/escrow/:id/release` | Admin releases held funds to the creator | `{ note }` -> updated case | `admin/EscrowPage.jsx` |
| POST | `/admin/escrow/:id/extend` | Admin extends the auto-release by 7 days | `{ note }` -> updated case | `admin/EscrowPage.jsx` |
| GET | `/admin/deletion-requests` | Account-erasure queue | `{ requests: [{ id, user: { name, email, role }, requestedAt, reason, openItems, graceEndsAt, status: pending\|approved\|rejected\|cancelled }] }` - `openItems` = open bookings + disputes + escrow holds, blocks approval | `admin/DeletionRequestsPage.jsx` |
| POST | `/admin/deletion-requests/:id/approve` | Schedule erasure (24h) | -> updated request | `admin/DeletionRequestsPage.jsx` |
| POST | `/admin/deletion-requests/:id/reject` | Reject with a reason emailed to the user | `{ reason }` -> updated request | `admin/DeletionRequestsPage.jsx` |
| GET | `/admin/re-engagement` | Segments + send history | `{ segments: [{ id, label, description, count, lastSentAt }], history: [{ id, segment, sentAt, recipients, opened, clicked, reactivated }], abandonedByStep: [{ label, value }] }` - segment ids used: `abandoned_drafts`, `never_published`, `inactive_30d`, `no_enquiry_reply` | `admin/ReEngagementPage.jsx` |
| POST | `/admin/re-engagement/send` | Queue an email to a segment | `{ segmentId, subject, preview }` -> `{ queued: n }` | `admin/ReEngagementPage.jsx` |

## Response-shape confirmations needed (endpoints exist, shape doesn't)

- **`GET /brands/campaigns/:id`** — does the response include `deliverables`, `revisionPolicy`, `usageRights`, `deliveredFiles`, `enquiryId`? `CampaignDetailPage.jsx` currently merges live fields over placeholder data as a fallback until this is confirmed.
- **`POST /enquiries`** — payload is assumed to be `{ creatorId, packageId, message }` based on an existing code comment in `useEnquiries.js`/`EnquiryForm`; never confirmed against a real response.
- **`GET /admin/stats`** — `OverviewPage.jsx`'s health-metric grid guesses field names (`activeCreators`, `registeredBrands`, `liveRateCards`, `enquiriesLast7Days`, `bookingsInProgress`, `completedThisMonth`, `transactionVolume`, `platformFeesCollected`); unconfirmed fields render as `—` rather than a fabricated number.
- **`GET /payments/stats`** — `MoneyPage.jsx` guesses `availableBalance`, `pendingBalance`, `totalEarned`.
- **`GET /payments/earnings/timeline`** — guessed as an array of `{ label|period|month, amount|total }` points.
- **`GET /plans/current`** — `usePlan().currentPlan` guessed fields: `name`/`id`, `price`, `renewsAt`, `rateCardsUsed`/`rateCardsMax`. Unconfirmed fields render as `—` on `MoneyPage.jsx`'s subscription card.

## Notes for whoever picks this up

- Every guessed path above is wired on the frontend with `retry: false` and a friendly error toast/empty-state — nothing crashes against a 404, so these can ship incrementally in any order.
- Once an endpoint is confirmed, remove the corresponding `retry: false` and the "not yet available" comment next to it (grep for "backend spec" across `src/features/*/services/*.js` and `src/features/*/hooks/*.js` to find every seam).
