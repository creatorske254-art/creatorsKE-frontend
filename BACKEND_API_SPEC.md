# Backend API contract

The frontend is fully wired to a REST API under `VITE_API_BASE_URL` (`http://localhost:5000/api` in development). Every endpoint below is implemented by the local mock backend in `backend/` (Express, seeded in-memory data persisted to `backend/db.json`; not committed, see `backend/README.md`), so the mock is the executable reference for request and response shapes. A real backend needs to match these shapes for the pages to work unchanged; the frontend unwraps list responses as `data?.items ?? data` (e.g. `{ enquiries: [...] }` or a bare array both work) and reads a few documented field aliases.

Auth: bearer token in `Authorization`, plus `?token=` on links that open in a new tab (invoice PDFs). 401 sends the app to `/login`.

## Auth and account

| Method | Path | Notes |
|---|---|---|
| POST | `/auth/signup`, `/auth/verify-email`, `/auth/resend-verification`, `/auth/login`, `/auth/refresh-token`, `/auth/logout`, `/auth/forgot-password`, `/auth/reset-password` | login returns `{ token, refreshToken, user }` |
| GET | `/auth/me` | current user |
| DELETE | `/auth/account` | creates a deletion request (admin approves it) |
| GET / PATCH | `/users/profile` | user + `creator` / `brand` sub-object + `preferences`; PATCH accepts `firstName, lastName, email, phone, avatar, title, handle, bio, location, niche, languages, socials` |
| POST | `/users/change-password` | `{ currentPassword, newPassword }` |
| GET / PATCH | `/users/preferences` | `{ language, timezone, weekStart, notifications: {...}, notificationEmail, showInDirectory, showBookingCount, shareAnalytics, marketing, currency, autoWithdraw, alerts: {...} }` (merge on PATCH) |
| GET | `/users/sessions` | `{ sessions: [{ id, device, location, lastActiveAt, current, mobile }] }` |
| DELETE | `/users/sessions/others`, `/users/sessions/:id` | 204 |
| POST | `/users/2fa/setup` -> `{ secret, otpauthUrl }`, `/users/2fa/verify` `{ code }`, DELETE `/users/2fa` | admins cannot disable |
| POST | `/users/export` | `{ requestedAt }` |

## Directory, public profiles, rate cards, portfolio, plans, onboarding

| Method | Path | Notes |
|---|---|---|
| GET | `/directory` | filters `q` (alias `keyword`), `niche`, `platform`, `follower_range` (alias `followerRange`), `location`, `availability`, `page`, `limit` -> `{ creators, total, page, totalPages }`; rows are directory cards (`name, handle, initials, niche, followers, eng, rating, reviews, verified, avail, bg, platforms[], location, bio, price, priceUnit`) |
| GET | `/directory/filter-options` | `{ niches, platforms, locations }` |
| GET | `/creators`, `/creators/:id` | |
| GET | `/public/creators/:handle/rate-card` | `{ creator, niches, stats, averageRating, reviewCount, turnaroundDays, packages, reviews }` |
| GET | `/public/creators/:handle/portfolio` | `{ creator, about, expertise, niches, whyWorkWithMe, collaborations, socialStats, contact }` |
| GET / POST | `/rate-cards` | array of the creator's cards; POST creates (body = builder payload: `profile, platforms, packages, payment, headline, pitch, leadTime, availability, usageNote, revisionPolicy, showPricing`) |
| GET / PATCH / DELETE | `/rate-cards/:id`, PATCH `/rate-cards/:id/draft` | `platforms` is the builder's on/off map `{ instagram, tiktok, youtube, twitter, podcast }` |
| POST | `/rate-cards/:id/publish`, `/unpublish`, `/reorder` | publish requires at least one package |
| GET | `/rate-cards/:id/analytics` | `{ views: [{ date, count }], totalViews, enquiries, conversion }` |
| GET | `/rate-cards/health` | module health only (`{ status }`); completeness is computed client-side |
| GET / POST / PUT | `/portfolio/:creatorId`, `/portfolio`, `/portfolio/draft`, `/publish`, `/unpublish`, `/analytics` | |
| GET | `/plans`, `/plans/current` -> `{ id, name, price, interval, features, limits, renewsAt, rateCards }`, POST `/plans/upgrade` `{ planId }` | |
| GET / POST | `/onboarding/resume`, `/onboarding/draft`, `/onboarding/complete` | |

## Enquiries, messages, notifications, payments, reviews, uploads

| Method | Path | Notes |
|---|---|---|
| GET / POST | `/enquiries` | role-scoped `{ enquiries }`; POST `{ creatorId, packageId, message }` |
| GET | `/enquiries/:id`; POST `/enquiries/:id/accept` (creates campaign, escrow deposit, invoice), `/decline`, `/expire` | status `NEW | IN_REVIEW | BOOKED | COMPLETED | EXPIRED` |
| GET | `/messages/threads/:id` -> `{ messages }`; POST `/messages` `{ threadId, text, attachmentUrl }` | thread id = enquiry id |
| GET | `/notifications`, `/notifications/unread-count`; PATCH `/notifications/mark-read` `{ ids }` | |
| GET | `/payments/stats` | `{ availableBalance, pendingBalance, totalEarned, earningsDelta, profileViews, enquiries: { total, new }, cardCtr, recentEnquiries }` |
| GET | `/payments/earnings/timeline?period=7d|30d|90d|3m|6m|1y` | `[{ date|label, amount }]` |
| GET | `/payments/transactions` | `{ transactions }` with a `positive` flag |
| GET / POST | `/payments/methods`; PATCH `/payments/methods/:id/primary`; DELETE `/payments/methods/:id` | `{ methods: [{ id, type: mpesa|airtel|bank, name, detail, primary, fields }] }`; POST enforces the plan's payout-method limit (400 with a message) |
| POST | `/payments/stk-push`, `/payments/mpesa/verify-pin`, `/payments/payout` `{ amount, methodId }`; GET `/payments/status/:id` | status settles after a few seconds |
| GET / POST | `/reviews` (`?creatorId`, `?flagged=true`; admins see all), POST `{ campaignId, creatorId, rating, comment }`, POST `/reviews/:id/reply` `{ reply }` | |
| POST / GET / DELETE | `/uploads/upload` (multipart `file`) -> `{ id, url }`, `/uploads/:id` | files served from `/uploads` |

## Brand

| Method | Path | Notes |
|---|---|---|
| GET / PUT | `/brands/profile` | company fields + `preferences` + `notificationPreferences` |
| GET / POST / PATCH / DELETE | `/brands/shortlist`, `/brands/shortlist/:id` | rows = directory card + `addedOn, note`; DELETE accepts the row id or the creator id |
| GET / POST | `/brands/campaigns`; GET / PUT `/brands/campaigns/:id` (detail includes `messages`, `enquiryId`, `deliverables`, `deliveredFiles`, `activity`, `review`) | |
| POST | `/brands/campaigns/:id/approve` (completes, releases escrow), `/brands/campaigns/:id/dispute` `{ evidence }` | |
| GET | `/brands/billing`, `/brands/invoices`, `/brands/invoices/:id/pdf?token=`, `/brands/transactions?range=` | |
| GET / POST / DELETE | `/brands/payment-methods`, `/brands/payment-methods/:id` | `{ methods: [{ id, type: card|mpesa|airtel|bank, name, detail, connected, primary }] }` |
| GET / POST / PATCH / DELETE | `/brands/team`, `/brands/team/invite` `{ email, role }`, `/brands/team/:id` `{ role }` | roles `owner | admin | member | finance` |

## Admin

| Method | Path | Notes |
|---|---|---|
| GET | `/admin/stats` | KPIs + `growth`, `enquiryTimeline`, `abandonedDraftsByStep`, `escrowAging` series |
| GET / PATCH / POST | `/admin/disputes`, `/admin/disputes/:id`, `/admin/disputes/:id/resolve` `{ decision, creatorShare, note }`, `/admin/disputes/:id/reply` | |
| GET | `/admin/accounts?q=&role=&status=` -> `{ accounts, total }`, `/admin/accounts/flagged`; POST `/admin/accounts/:id/action` `{ action, reason }` | brand rows use the company name |
| POST | `/admin/invite` `{ email, role }`, `/admin/moderation` `{ targetId, action: remove|dismiss, reason }` | |
| GET | `/admin/reviews` -> `{ reviews }` | moderation feed across creators |
| GET / POST | `/admin/escrow`, `/admin/escrow/:id/release|extend` | |
| GET / POST | `/admin/deletion-requests`, `/admin/deletion-requests/:id/approve|reject` | |
| GET / POST | `/admin/re-engagement` -> `{ segments, history, abandonedByStep, queue }`, `/admin/re-engagement/send` | |
| GET / PUT | `/admin/settings` | `{ platformFeePct, escrowReleaseDays, disputeWindowDays, deletionGraceDays, draftAbandonDays, inactiveDays, enquiryReplyHours, maintenance, maintenanceMessage }` |
| GET / PATCH / DELETE | `/admin/team`, `/admin/team/:id` | roles `owner | moderator | finance | support` |
