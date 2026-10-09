# Backend API contract

The frontend is fully wired to a REST API under `VITE_API_BASE_URL` (`http://localhost:5000/api` in development). Every endpoint below is implemented by the local mock backend in `backend/` (Express, seeded in-memory data persisted to `backend/db.json`; not committed, see `backend/README.md`), so the mock is the executable reference for request and response shapes. A real backend needs to match these shapes for the pages to work unchanged; the frontend unwraps list responses as `data?.items ?? data` (e.g. `{ enquiries: [...] }` or a bare array both work) and reads a few documented field aliases.

Auth: bearer token in `Authorization`, plus `?token=` on GET links that open in a new tab (invoice PDFs, data exports). 401 sends the app to `/login`. The real API wraps every body in `{ success, data, message }`; `src/lib/api.js` unwraps it, so the shapes below are the `data` part.

## Auth and account

| Method | Path | Notes |
|---|---|---|
| POST | `/auth/signup`, `/auth/verify-email`, `/auth/resend-verification`, `/auth/login`, `/auth/refresh-token`, `/auth/logout`, `/auth/forgot-password`, `/auth/reset-password` | login returns `{ token, refreshToken, user }`, or `{ twoFactorRequired: true, challengeToken }` when the account has 2FA on. Signing up with an address that has a pending admin or brand-team invite opens that account (`?email=` prefills it) |
| POST | `/auth/login/2fa` `{ challengeToken, code }` | second login step; returns `{ token, refreshToken, user }` |
| GET | `/auth/me` | current user; admins carry `adminRole`, brands carry `teamRole` (`owner` or their team role) and `brandId` (the brand account they act for) |
| DELETE | `/auth/account` `{ reason }` | 202, creates a deletion request with a grace period (an admin approves it); POST `/auth/account/cancel-deletion` withdraws it |
| GET / PATCH | `/users/profile` | user + `creator` / `brand` sub-object + `preferences`; PATCH accepts `firstName, lastName, email, phone, avatar, title, handle, bio, location, niche, languages, socials` |
| POST | `/users/change-password` | `{ currentPassword, newPassword }` |
| GET / PATCH | `/users/preferences` | `{ language, timezone, weekStart, notifications: {...}, notificationEmail, showInDirectory, showBookingCount, shareAnalytics, marketing, currency, autoWithdraw, alerts: {...} }` (merge on PATCH) |
| GET | `/users/sessions` | `{ sessions: [{ id, device, location, lastActiveAt, current, mobile }] }` |
| DELETE | `/users/sessions/others`, `/users/sessions/:id` | 204 |
| POST | `/users/2fa/setup` -> `{ secret, otpauthUrl }`, `/users/2fa/verify` `{ code }`, DELETE `/users/2fa` | admins cannot disable |
| POST | `/users/export` -> `{ id, requestedAt }`; GET `/users/export/:id?token=` | the download is a JSON file of the account's data, also emailed |

## Directory, public profiles, rate cards, portfolio, plans, onboarding

| Method | Path | Notes |
|---|---|---|
| GET | `/directory` | filters `q` (alias `keyword`), `niche`, `platform`, `follower_range` (alias `followerRange`), `location`, `availability`, `page`, `limit` -> `{ creators, total, page, totalPages }`; rows are directory cards (`name, handle, initials, niche, followers, eng, rating, reviews, verified, avail, bg, platforms[], location, bio, price, priceUnit`) |
| GET | `/directory/filter-options` | `{ niches, platforms, locations }` |
| GET | `/creators`, `/creators/:id` | |
| GET | `/public/creators/:handle/rate-card` | `{ creator, niches, stats, averageRating, reviewCount, turnaroundDays, packages, reviews }` |
| GET | `/public/creators/:handle/portfolio` | the builder's saved record (`name, role, bio, location, photoUrl, niches, socialStats: { igFollowers, igEngagement, ttFollowers, ttAvgViews, mediumFollowers, audienceAge }, contact: { email, phone, instagramHandle }`); `getPublicPortfolio` maps it to the page's `{ creator, about, niches, socialStats[], contact }`. Each read counts a view |
| GET / POST | `/rate-cards` | array of the creator's cards; POST creates (body = builder payload: `profile, platforms, packages, payment, headline, pitch, leadTime, availability, usageNote, revisionPolicy, showPricing`) |
| GET / PATCH / DELETE | `/rate-cards/:id`, PATCH `/rate-cards/:id/draft` | `platforms` is the builder's on/off map `{ instagram, tiktok, youtube, twitter, podcast }` |
| POST | `/rate-cards/:id/publish`, `/unpublish`, `/reorder` | publish requires at least one package |
| GET | `/rate-cards/:id/analytics` | `{ views: [{ date, count }], totalViews, enquiries, conversion }` |
| GET | `/rate-cards/health` | module health only (`{ status }`); completeness is computed client-side |
| GET / POST / PUT | `/portfolio/:creatorId` (user id; the owner also sees drafts, 404 when none exists and the builder then POSTs `/portfolio`), `/portfolio/:id`, PATCH `/portfolio/:id/draft`, POST `/portfolio/:id/publish`, `/unpublish`, GET `/portfolio/:id/analytics` -> `{ views, enquiries }` | the public handle is the account's handle and cannot be set from the body |
| GET | `/plans`, `/plans/current` -> `{ id, name, price, interval, features, limits, renewsAt, rateCards }`, POST `/plans/upgrade` `{ planId }` | |
| GET / POST | `/onboarding/resume`, `/onboarding/draft`, `/onboarding/complete` | |

## Enquiries, messages, notifications, payments, reviews, uploads

| Method | Path | Notes |
|---|---|---|
| GET / POST | `/enquiries` | role-scoped `{ enquiries }`; POST `{ creatorId, packageId, message }` |
| GET | `/enquiries/:id`; POST `/enquiries/:id/accept` (creates the campaign unpaid: `paidOn: null, escrowStatus: awaiting_payment`, plus the `platformFeePct` and `disputeWindowDays` in force at booking; disputes are refused once that window after `deliveredAt` has passed), `/decline`, `/expire` | status `NEW | IN_REVIEW | BOOKED | COMPLETED | EXPIRED` |
| GET | `/messages/threads/:id` -> `{ messages }`; POST `/messages` `{ threadId, text, attachmentUrl }` | thread id = enquiry id |
| GET | `/notifications`, `/notifications/unread-count`; PATCH `/notifications/mark-read` `{ ids }` | |
| GET | `/payments/stats` | `{ availableBalance, pendingBalance, totalEarned, earningsDelta, profileViews, enquiries: { total, new }, cardCtr, recentEnquiries }` |
| GET | `/payments/earnings/timeline?period=7d|30d|90d|3m|6m|1y` | `[{ date|label, amount }]` |
| GET | `/payments/transactions` | `{ transactions }` with a `positive` flag |
| GET / POST | `/payments/methods`; PATCH `/payments/methods/:id/primary`; DELETE `/payments/methods/:id` | `{ methods: [{ id, type: mpesa|airtel|bank, name, detail, primary, fields }] }`; POST enforces the plan's payout-method limit (400 with a message) |
| POST | `/payments/stk-push`, `/payments/mpesa/verify-pin`, `/payments/payout` `{ amount, methodId }`; GET `/payments/status/:id` | status settles after a few seconds |
| GET / POST | `/reviews` (`?creatorId`, `?flagged=true`; admins see all), POST `{ campaignId, creatorId, rating, comment }`, POST `/reviews/:id/reply` `{ reply }` | |
| POST / GET / DELETE | `/uploads/upload` (multipart `file`) -> `{ id, url }`, `/uploads/:id` | `url` is absolute and public (`/uploads/:id/file` on the real API, stored in the database because Vercel's disk is not kept) |

## Brand

| Method | Path | Notes |
|---|---|---|
| GET / PUT | `/brands/profile` | company fields + `preferences` + `notificationPreferences` |
| GET / POST / PATCH / DELETE | `/brands/shortlist`, `/brands/shortlist/:id` | rows = directory card + `addedOn, note`; DELETE accepts the row id or the creator id |
| GET / POST | `/brands/campaigns`; GET / PUT `/brands/campaigns/:id` (detail includes `messages`, `enquiryId`, `deliverables`, `deliveredFiles`, `activity`, `review`) | |
| POST | `/brands/campaigns/:id/pay` `{ phoneNumber }` -> 202 `{ checkoutRequestId }` | M-Pesa STK push for the booking; the callback sets `paidOn`, `paymentMethod`, `mpesaReceipt` and `escrowStatus: held`. The page polls the campaign until `paidOn` appears. The creator can only mark delivered after this |
| POST | `/brands/campaigns/:id/approve` (completes, releases escrow), `/brands/campaigns/:id/dispute` `{ evidence }` | both need a paid, delivered booking |
| GET | `/brands/billing`, `/brands/invoices`, `/brands/invoices/:id/pdf?token=`, `/brands/transactions?range=` | |
| GET / POST / DELETE | `/brands/payment-methods`, `/brands/payment-methods/:id` | `{ methods: [{ id, type: card|mpesa|airtel|bank, name, detail, connected, primary }] }` |
| GET / POST / PATCH / DELETE | `/brands/team`, `/brands/team/invite` `{ email, role }`, `/brands/team/:id` `{ role }` | roles `owner | admin | member | finance`. An invitee signs up with the invited email and then acts on the brand's data with their own login. Owner/admin manage the team and profile, member runs shortlist, enquiries and campaigns, finance pays bookings and manages payment methods; everyone can read. Removing someone signs them out |

## Admin

| Method | Path | Notes |
|---|---|---|
| GET | `/admin/stats` | KPIs + `growth`, `enquiryTimeline`, `abandonedDraftsByStep`, `escrowAging` series |
| GET / PATCH / POST | `/admin/disputes`, `/admin/disputes/:id`, `/admin/disputes/:id/resolve` `{ decision, creatorShare, note }`, `/admin/disputes/:id/reply` | |
| GET | `/admin/accounts?q=&role=&status=` -> `{ accounts, total }`, `/admin/accounts/flagged`; POST `/admin/accounts/:id/action` `{ action, reason }` | brand rows use the company name |
| POST | `/admin/invite` `{ email, role }`, `/admin/moderation` `{ targetId, action: remove|dismiss, reason }` | |
| GET | `/admin/reviews` -> `{ reviews }` | moderation feed across creators |
| GET / POST | `/admin/escrow`, `/admin/escrow/:id/release|extend` | |
| GET / POST | `/admin/deletion-requests`, `/admin/deletion-requests/:id/approve|reject` `{ reason }` | approve erases the account at once (blocked while bookings or payouts are open); enquiries, campaigns, messages, reviews and disputes stay for the other party |
| GET / POST | `/admin/re-engagement` -> `{ segments, history, abandonedByStep, queue }`, `/admin/re-engagement/send` `{ segmentId, subject, preview }` -> `{ id, queued, delivered }` | history rows carry real `opened`/`clicked` (per-recipient tracking pixel and link, `GET /r/:sendId/:userId[/open.gif]`) and `reactivated` (published or messaged after the send) |
| GET / PUT | `/admin/settings` | `{ platformFeePct, escrowReleaseDays, disputeWindowDays, deletionGraceDays, draftAbandonDays, inactiveDays, enquiryReplyHours, maintenance, maintenanceMessage }` |
| GET / PATCH / DELETE | `/admin/team` (admins plus pending invites with `status: invited`), `/admin/team/:id` `{ role }` (an admin's user id or an invite id) | roles `super | moderator | finance | support`. Everyone reads every queue; writes are limited: moderator disputes, accounts and reviews; finance escrow and settings; support re-engagement; deletion decisions and the team are super only. At least one super admin is kept |
