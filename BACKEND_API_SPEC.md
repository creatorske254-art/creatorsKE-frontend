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
