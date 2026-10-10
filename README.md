# Creatorske web app

The marketplace for Kenya's content creators and the brands who book them. Creators publish a rate card and portfolio, brands find them in the directory and send enquiries, and bookings are paid into escrow by M-Pesa and released when the brand approves the delivery.

This repository is the frontend: a React 18 single-page app built with Vite. It talks to the Creatorske API ([creatorske254-art/backend](https://github.com/creatorske254-art/backend)) over REST.

## Getting started

Requirements: Node 20.19 or later (Vite 7).

```bash
npm install
cp .env.example .env.development.local   # optional, see below
npm run dev                              # http://localhost:5173
```

The API address comes from `VITE_API_BASE_URL`:

| File | Value | Used by |
|---|---|---|
| `.env.development` | `http://localhost:5000/api` | `npm run dev`, against the local mock API |
| `.env.production` | `https://api.creatorske.co.ke/api` | `npm run build` |
| `.env.development.local` | your override, git-ignored | to run the dev server against a local copy of the real API |

### Which API to develop against

- **The local mock** (`backend/`, git-ignored): an Express server with seeded data that implements every endpoint in [BACKEND_API_SPEC.md](./BACKEND_API_SPEC.md). Start it with `cd backend && npm install && npm start`. Its sign-ins are in `backend/README.md`. It is for development only and is never committed.
- **The real API**, run locally from the backend repository. Point the dev server at it with `VITE_API_BASE_URL=http://localhost:5001/api` in `.env.development.local`.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serves the production build locally |
| `npm run lint` | ESLint with zero warnings allowed (`.eslintrc.cjs`) |

There is no test runner yet.

## How the app is organised

```
src/
  main.jsx              App entry: React Query client, providers, router
  routes/               The route tree (index.jsx) and ProtectedRoute (sign-in and role checks)
  pages/                One file per screen, grouped by audience
    public/             Home, directory, pricing, public rate card and portfolio, legal pages
    auth/               Log in (with the 2FA step), sign up, verify email, reset password
    onboarding/         Plan selection after sign-up
    creator/            Dashboard, rate card builder, portfolio builder, enquiries, money, settings
    brand/              Dashboard, shortlist, enquiries, campaigns, billing, transactions, settings
    admin/              Overview, accounts, disputes, reviews, escrow, deletion requests, re-engagement, settings
    shared/             Pages every role uses (notifications)
    error/              Not found, offline, server error
  features/             Domain logic, one folder per area of the product
    <feature>/
      services/         API calls for that area (one object or set of functions per file)
      hooks/            React Query hooks that wrap the services (loading, errors, cache updates)
      components/       UI that belongs to that area
      constants/        Status names and other lookups
  components/
    layouts/            The shell for each role (sidebar, navbar, drawer) plus public/auth shells
    settings/           The shared settings shell and cards used by all three settings pages
    charts/             The one chart kit (Recharts wrapped in ChartFrame, TrendChart, BarChart, ...)
    shared/             Empty, error and confirm states, availability badge
    ui/                 Base controls: Modal, Select, Skeleton, CollapsibleCard, SmartImage
  context/              Auth, notifications (bell count) and theme providers
  lib/                  The API client (api.js), formatting helpers (utils.js) and small hooks
  index.css             Design tokens and the component class set (the styling source of truth)
```

Features: `admin`, `auth`, `brand-dashboard`, `creator-dashboard`, `directory`, `enquiry`, `messaging`, `notifications`, `payments`, `plans`, `portfolio`, `rate-card`, `reviews`.

The rule of thumb: a page composes hooks and components; a hook wraps a service; only services call the API client. Every service file starts with a comment listing the endpoints it calls.

## How the app talks to the backend

- **One client.** `src/lib/api.js` holds the only axios instance. It attaches the bearer token from `localStorage`, unwraps the API's `{ success, data, message }` envelope so callers get `data` directly, turns errors into `{ status, message, data }`, and sends the user to `/login` on a 401.
- **The contract.** [BACKEND_API_SPEC.md](./BACKEND_API_SPEC.md) lists every path, request body and response field the pages use. Every call in `src/` matches a route in the backend.
- **Data on screen comes from the API.** A failed request shows an error state with a retry, an empty response shows an empty state, and loading shows skeletons. Failed actions show the server's own message in a toast.
- **Sign-in.** Tokens and the user object live in `localStorage` (`creatorske_token`, `creatorske_user`) and are managed by `AuthContext`. Signing in or out also clears the React Query cache, so one account never sees another's data on a shared browser.

### The main flows

1. **Booking.** A brand sends an enquiry from a creator's public rate card (`POST /enquiries`). The enquiry is also its chat thread. When the creator accepts, the backend opens an unpaid campaign.
2. **Escrow.** The brand pays from the campaign page (`POST /brands/campaigns/:id/pay`, an M-Pesa STK push). The page checks back until the payment lands. The creator can only mark the booking delivered once it is paid.
3. **Delivery and release.** The creator marks it delivered with files attached. The brand approves (which releases the money), disputes within the booking's dispute window, or the backend releases it automatically after the release window.
4. **Money.** The creator's balance, earnings and transactions come from completed bookings. Withdrawals are recorded as pending.
5. **Teams and roles.** Admins have a role (super, moderator, finance, support); brands can invite teammates who work on the brand's account under their own login. `/auth/me` carries `adminRole`, or `teamRole` and `brandId`.

## Conventions

Styling, typography, spacing, icons, charts, settings pages and the other house rules are described in [CLAUDE.md](./CLAUDE.md). The short version:

- Import with the `@/` alias (`@/features/...`), never long relative paths.
- Use the design tokens and classes in `src/index.css`; no raw colours or pixel spacing.
- Icons come from `@tabler/icons-react` with a size class (`icon-sm`, `icon-md`, ...).
- Charts use the kit in `src/components/charts/`; dropdowns use `components/ui/Select`.
- Copy describes only what the product actually does. A setting with nothing behind it is removed, not left as a promise.

## Deployment

`npm run build` produces a static site in `dist/`. Both environment variables are read at build time, so a change to either needs a rebuild:

| Variable | Production value | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | `https://api.creatorske.co.ke/api` | Where the app sends API requests. A production build without it logs an error and every request fails. |
| `VITE_SITE_URL` | `https://creatorske.co.ke` | The app's own address, used for link previews (`og:image`) and the canonical URL. |

`vercel.json` configures hosting on Vercel:

- **Single-page routing.** Every path serves `index.html`, so deep links such as `/c/<handle>` or an emailed `/verify-email?token=...` open directly.
- **Caching.** Files in `/assets/` have content hashes in their names and are cached for a year; `index.html` is always revalidated, so a deploy reaches users on their next visit. A tab left open across a deploy reloads itself once when it asks for a page file that no longer exists (`src/main.jsx`).
- **Security headers.** HSTS, no framing, no MIME sniffing, a strict referrer policy and a Content Security Policy that allows scripts only from this site, fonts from Google Fonts and API calls only to `https://api.creatorske.co.ke`. **If the API moves, update `connect-src` in `vercel.json` along with `VITE_API_BASE_URL`.**

On another host, configure the same three things: serve `index.html` for unknown paths, cache `/assets/` long-term, and send the headers above.

The backend has to know where the app lives: its `FRONTEND_URL` (used in email links) must be this app's address, and its `CORS_ORIGINS` must include it, or the browser blocks every request.

### Performance

Pages load on demand: the first visit downloads the app shell (about 420 KB before compression) and then only the code for the screens opened. The chart library loads only on pages with charts.
