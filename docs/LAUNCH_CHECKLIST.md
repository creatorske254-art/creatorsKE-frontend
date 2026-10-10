# Creatorske launch checklist

Built from Google's SRE launch coordination checklist, GitLab's production readiness template, the AWS Well-Architected pillars, the OWASP Top 10:2025, the Twelve-Factor App and web.dev's Core Web Vitals, keeping the items that apply to Creatorske (a React SPA on Vercel, an Express API on Vercel, Neon Postgres, M-Pesa, SMTP).

Status: **Pass** (met), **Fixed** (met by this pass), **Open** (needs action), **Decision** (needs a product call).

## Blockers before launch

| Item | Status | Action |
|---|---|---|
| Pricing page promises fees and plan limits the system does not apply (Pro 6% / Elite 4% fee, brand plans, deposits, plan gating) and paid plans are never billed | Decision | Bill plans (and end trials), then apply per-plan fees and limits; or change the pricing page to what exists |
| Creator withdrawals are recorded but never sent | Open | M-Pesa B2C, or an admin payout queue to pay by hand |
| Where the app lives (`creatorske.co.ke` serves the landing page) | Decision | Set `VITE_SITE_URL` (frontend), `FRONTEND_URL` and `CORS_ORIGINS` (backend) to that address |
| Backend branches `fix/emails-escrow-release` and `chore/production-hardening` not merged; `CRON_SECRET` not set | Open | Merge, set `CRON_SECRET`, redeploy |
| Real M-Pesa sandbox payment never run end to end (only simulated callbacks) | Open | One sandbox STK push through to "paid" on staging |

## Reliability and operations

| Item | Status | Notes |
|---|---|---|
| Architecture documented | Pass | README, BACKEND_API_SPEC.md, CLAUDE.md |
| Named owner and escalation contact | Open | Name who is on call for payments and outages |
| Timeouts on outbound calls | Pass | API client 15 s; Daraja 15/30 s |
| Graceful degradation | Pass | Error, empty and offline states; email failures never fail a request |
| Payment callback idempotent and authenticated | Pass | Secret in callback URL; funding only applies once |
| Backups and a tested restore | Open | Confirm Neon's restore window; restore once to a branch |
| Rate limiting effective on serverless | Open | Set `REDIS_URL` (Upstash) so limits are shared across instances |
| Load test / 2x launch spike | Open | k6 or similar against staging for directory, rate card, enquiry, pay |
| Recovery when a deploy replaces page files | Fixed | One automatic reload |
| Rollback | Pass | Vercel instant rollback for both projects |

## Monitoring

| Item | Status | Notes |
|---|---|---|
| Health check | Pass | `GET /api/health` |
| Browser crash reporting | Fixed | `POST /api/client-errors`, written to the server log with page, release, user |
| Logs keep their details (request id, path, user) | Fixed | Logger prints metadata; `X-Request-Id` on every response |
| No customer data in logs | Pass | No request bodies or tokens logged |
| Uptime monitor on the API and site | Open | External monitor on `/api/health` and the home page |
| Alerts on payment failures and 5xx spikes | Open | Vercel log alerts or Sentry |

## Security (OWASP Top 10:2025)

| Item | Status | Notes |
|---|---|---|
| A01 Access control | Pass | Role, party, admin-role and team-role checks covered by API sweeps |
| A02 Misconfiguration | Fixed | Production 5xx no longer leak internals; frontend CSP/HSTS/frame/nosniff headers |
| A03 Supply chain | Fixed | 0 known vulnerabilities in shipped dependencies (both repos); CI audit gate |
| A04 Cryptography | Pass | HTTPS + HSTS, bcrypt; confirm JWT secrets are long and random |
| A05 Injection | Pass | Parameterised SQL; React escaping; email and invoice HTML escaped; no raw HTML |
| A07 Authentication | Pass | Password policy, login rate limit, 2FA, session revocation |
| A08 Integrity | Fixed | Tokens out of URLs; callback secret |
| Open redirect after login | Fixed | React Router 7 and in-app-only redirect check |
| Secrets in the repos | Pass | Env files hold public URLs only |

## Delivery

| Item | Status | Notes |
|---|---|---|
| CI on every push and PR | Fixed | Frontend: lint, tests, build, audit. Backend: parse check, audit |
| Automated tests | Partial | Frontend: 33 unit tests. Backend: Jest suite is out of date; the local integration sweeps should be committed as tests |
| Branch protection and required review | Open | GitHub settings on `main` |
| Config in the environment | Pass | Twelve-factor |

## Experience, accessibility and search

Lighthouse (mobile, slow 4G), production build:

| Page | Performance / Accessibility / Best practices / SEO |
|---|---|
| Home | 95 / 100 / 100 / 100 |
| Pricing | 97 / 100 / 100 / 100 |
| Rate card | 88 / 100 / 100 / 100 |
| Login | 95 / 100 / 100 / 100 |
| Directory | 93 / 94 / 96 / 100 (before the last directory fixes) |

| Item | Status | Notes |
|---|---|---|
| Core Web Vitals | Partial | CLS under 0.1 everywhere; LCP 2.2 to 3.2 s in simulation, re-measure on production |
| Code splitting | Fixed | First download about 370 KB (was about 1.5 MB) |
| Text contrast (WCAG AA) | Fixed | Grey tokens darkened; dark footer uses light grey |
| Accessible names and tap targets | Fixed | Password toggles, rating stars, chat buttons |
| Invented marketing numbers ("2,400+ creators") | Fixed | Replaced with true statements |
| Canonical URL, robots.txt, sitemap, link previews | Fixed | Per-page canonical; absolute preview image |

## Privacy (Kenya Data Protection Act 2019)

| Item | Status | Notes |
|---|---|---|
| Privacy policy and terms | Pass | Client's legal text |
| Data export and account deletion | Pass | With a cancel option during the grace period |
| Marketing opt-out honoured | Pass | Re-engagement skips opted-out creators |
| Registration with the ODPC | Open | Business registration as data controller |
