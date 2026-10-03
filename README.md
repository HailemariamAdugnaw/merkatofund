# The Merkato Fund — Full-Stack Platform

The official website of **The Merkato Fund**, the "Hybrid Financial Ecosystem for Everyday Ethiopia", built as a production-grade full-stack application.

- **5 Million Birr Daily Liquidity** presented through a full-screen cinematic hero slider: Ken Burns zoom on every background photo, staggered text reveal (eyebrow → title → body → buttons → stat chip), 6-second autoplay with a thin progress bar (hover pauses), and four navigation options (arrows, pill dots, keyboard arrows, touch swipe) plus a `01 / 03` slide counter. The background photo always stays locked to the hero container at every screen size — full-bleed behind the text on desktops, and on phones and tablets the crop, overlay strength and spacing adapt automatically so the picture remains visible while the text stays readable
- Seven editorial articles rendered as a golden vertical timeline in a zig-zag split layout — every article card is paired with a companion image on the opposite side, so no half of the screen is ever empty
- **Media uploads in Strapi**: hero slide and article photos can be uploaded from the local device or picked from the Media Library
- Click-to-play video explainer section
- Contact form with database persistence
- Floating social dock + footer social bar (Facebook, Telegram, TikTok, Instagram)
- **Strapi headless CMS** so non-technical staff can edit all text and links without touching code
- **Django + DRF API** that syncs content from Strapi, caches it in PostgreSQL, and serves it to the site
- Meta-tag optimization for `Ethiopian Investment`, `Merkato Fund`, `Daily Liquidity`
- **Google Analytics 4** engagement tracking
- Deployment blueprints for **Vercel** (frontend) and **Render** (backend + CMS + databases)

---

## 1. Architecture

```
┌─────────────────────────┐      ┌──────────────────────────┐      ┌─────────────────────────┐
│  React SPA (Vite)       │      │  Django + DRF API        │      │  Strapi CMS (v5)        │
│  Vercel / localhost:3000│ ───► │  Render / localhost:8000 │ ───► │  Render / localhost:1337│
│                         │      │                          │      │                         │
│  - Hero slider          │ JSON │  - /api/articles/        │ HTTP │  - Article (x7)         │
│  - Golden Flow banner   │      │  - /api/hero-slides/     │      │  - Hero Slide (x3)      │
│  - Articles timeline    │      │  - /api/settings/        │      │  - Site Setting         │
│  - Video + contact      │      │  - /api/contact/  POST   │      │    (socials, video URL, │
│  - Meta tags + GA4      │      │  - /api/events/   POST   │      │     contact info)       │
└─────────────────────────┘      │  - /api/health/          │      └─────────────────────────┘
                                 └────────────┬─────────────┘
                                              ▼
                                     ┌──────────────────┐
                                     │   PostgreSQL     │
                                     │  (Render / local)│
                                     └──────────────────┘
```

**How the content flows:** staff edit text in Strapi → publish → Django pulls the published content from Strapi's REST API (with a 120-second TTL cache), stores it in its own PostgreSQL database, and serves it to the React frontend. If Strapi is ever unreachable, Django keeps serving the last synced copy; if Django is unreachable, React falls back to a bundled snapshot of the same content. The site never goes blank.

| Layer | Technology | Folder |
|---|---|---|
| Frontend | React 18 + Vite 5, react-helmet-async, hand-crafted CSS ("Modern Heritage" theme) | `/` (root) |
| Backend API | Django 5 + Django REST Framework, django-cors-headers, WhiteNoise, Gunicorn | `/backend` |
| CMS | Strapi 5 (users-permissions plugin, SQLite locally / PostgreSQL in production) | `/strapi-cms` |
| Database | PostgreSQL (production) / SQLite (local development fallback) | managed via env vars |
| Frontend hosting | Vercel | `vercel.json` |
| Backend + CMS hosting | Render (with `render.yaml` blueprint) | `render.yaml` |

## 2. Project structure

```
.
├── index.html                  Meta tags, OG/Twitter cards, JSON-LD, Google Fonts
├── vercel.json                 Vercel build + SPA rewrite config
├── render.yaml                 Render blueprint: Django + Strapi + 2 PostgreSQL instances
├── .env.example                Frontend environment variables
├── public/
│   ├── logo.jpg                Official Merkato Fund brand mark (site logo + favicon)
│   ├── og-cover.svg            Social share card
│   └── images/                 Hero slide infographics (image1-3.jpg) + video thumbnail
├── src/
│   ├── App.jsx                 Layout, scrollspy, reveal animations, GA bootstrap
│   ├── components/             Navbar, HeroSlider, GoldenFlow, StatsBar,
│   │                           ArticlesTimeline, VideoSection, ContactSection,
│   │                           Footer, FloatingSocial, Seo, Icons
│   ├── hooks/                  useContent (API + fallback), useActiveSection, useCountUp
│   ├── lib/                    api.js (REST client), analytics.js (GA4), socials.js
│   ├── data/fallback.js        Bundled snapshot of all content (offline resilience)
│   └── styles/                 base.css, layout.css, sections.css
├── backend/
│   ├── config/                 Django settings (env-driven), URLs, WSGI
│   └── core/
│       ├── models.py           Article, HeroSlide, SiteSetting, ContactMessage,
│       │                       EngagementEvent, SyncState
│       ├── services.py         Strapi sync engine (fetch → normalize → cache)
│       ├── defaults.py         Seed content matching the specification
│       ├── views.py            DRF endpoints
│       └── management/commands/sync_content.py
└── strapi-cms/
    ├── config/                 Server, admin, database (SQLite/PostgreSQL switch)
    └── src/
        ├── index.js            Auto-seeds content + enables public API on first boot
        └── api/                article, hero-slide, site-setting content types
```

## 3. Prerequisites

| Tool | Version | Check |
|---|---|---|
| Node.js | 18 / 20 / 22 / 24 | `node -v` |
| npm | 9+ | `npm -v` |
| Python | 3.11 – 3.13 | `python --version` |
| pip | 23+ | `pip --version` |

PostgreSQL is **not** required locally (both Django and Strapi default to SQLite in development) — it is used automatically in production via the `DATABASE_URL` / `DATABASE_CLIENT=postgres` environment variables.

## 4. Quick start (3 terminals)

### Terminal 1 — Django backend (port 8000)

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

The API is now live at `http://localhost:8000`:

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/articles/` | GET | The 7 articles (normalized paragraphs) |
| `/api/hero-slides/` | GET | Hero slider slides |
| `/api/settings/` | GET | Site settings (social links, video URL, contacts) |
| `/api/contact/` | POST | Store a contact message `{name, email, phone, message}` |
| `/api/events/` | POST | Store an engagement event `{name, path, metadata}` |
| `/api/health/` | GET | Health check for Render |
| `/admin/` | — | Django admin (contact inbox) |

Create a Django superuser to inspect contact messages and events:

```bash
cd backend
python manage.py createsuperuser
```

### Terminal 2 — Strapi CMS (port 1337)

```bash
cd strapi-cms
npm install
npm install better-sqlite3@^12.2.0
cp .env.example .env
npm run develop
```

On first boot Strapi will:
1. Create its database schema.
2. **Auto-seed** all 7 articles, 3 hero slides and the site settings (published).
3. **Auto-enable public read access** for the three content types.

Open `http://localhost:1337/admin`, create the first administrator account through the welcome screen, and the CMS is ready. (If an admin already exists, sign in with it instead.)

> Generate your own secrets for `.env` with `openssl rand -base64 32` — one value each for `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET` and four comma-separated values for `APP_KEYS`.

### Terminal 3 — React frontend (port 3000)

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. In development the Vite dev server proxies `/api/*` to Django on port 8000 automatically — no environment variables needed.

To use the production-style flow instead (frontend calling a remote API), create `.env.local` in the project root:

```
VITE_API_BASE_URL=https://your-django-service.onrender.com
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Verify the full pipeline

1. Open Strapi admin → *Content Manager* → *Hero Slide* → open "A New Dawn for".
2. Change **Stat value** from `5M` to `5M+` → **Save** → **Publish**.
3. Wait up to 2 minutes (Django content cache TTL), then reload the website — the hero infographic shows `5M+`.
4. Force an instant sync instead of waiting: `cd backend && python manage.py sync_content --force`.

## 5. Editing content in Strapi (for non-technical staff)

Log in at `http://localhost:1337/admin` (or `https://your-strapi-url.onrender.com/admin` in production). All website text lives in three places under **Content Manager**:

### 5.1 Edit an article

1. **Content Manager → Article** — the seven numbered articles appear.
2. Click the article to open it.
3. Edit any field:
   - **Title / Subtitle** — headings on the timeline card.
   - **Nav label** — the short name shown in the top navigation bar.
   - **Highlight** — the golden pull-quote under the article.
   - **Body** — the article text. Write paragraphs separated by **one empty line**; each paragraph becomes its own styled block on the website.
4. Click **Save**, then click **Publish**. Changes appear on the website instantly when the webhook below is configured (otherwise within ~2 minutes, or right after a forced sync).

> Changing the **Order** number re-positions the article in the timeline and navigation. Keep numbers 1–7 unique.

### 5.1b Change a hero slide (banner + photo)

1. **Content Manager → Hero Slide** — the three rotating banners appear.
2. Edit any field:
   - **Eyebrow / Heading / Accent** — the top banner text.
   - **Body** — the paragraph under the heading.
   - **Image** — the slide photo (slow Ken Burns zoom is applied automatically). Click the field and either **pick a picture from the Media Library** or **drag-and-drop / upload a new one from your computer**. Leave it empty to fall back to the slide's default picture. Landscape images around 1280×720 or larger work best. The photo always fills the hero container edge-to-edge — on desktops it is gently darkened on the left for the text, and on phones and tablets the overlay is rebalanced so both the picture and the message stay readable at small sizes.
   - **Stat value / Stat label** — the gold chip under the text (e.g. `5M` / `Birr Daily Liquidity`).
   - **CTA labels / links** — the two buttons.
3. **Save** → **Publish**. Changes appear instantly with the webhook configured (otherwise within ~2 minutes).

### 5.1c Add or change an article photo (timeline)

1. **Content Manager → Article** — open any of the seven articles.
2. Scroll to the **Image** field and upload a picture from your computer or pick one from the **Media Library**.
3. **Save** → **Publish**. The picture appears next to the article card in the timeline — on the opposite side of the text, alternating row by row. Articles without a picture fall back to the built-in brand infographics.

### 5.2 Update social links (floating icons + footer bar)

1. **Content Manager → Site Setting** (single entry).
2. Scroll to `Facebook URL`, `Telegram URL`, `TikTok URL`, `Instagram URL`.
3. Paste the full profile link, e.g. `https://t.me/TheMerkatoFund`.
4. **Save** → **Publish**. The floating dock, contact section and footer update everywhere at once.

The same screen controls **Video URL** (see 5.3), contact phone/email/location, tagline, slogan and footer texts.

### 5.3 Add the explainer video

1. Upload the video to YouTube (visibility can stay *Unlisted* if preferred).
2. Copy the share link, e.g. `https://youtu.be/dQw4w9WgXcQ` or the full `https://www.youtube.com/watch?v=...` URL.
3. Paste it into **Site Setting → Video URL** → **Save** → **Publish**.

The video section converts any YouTube link into an embedded click-to-play player automatically. While the field is empty, visitors see the branded "coming soon" thumbnail.

### 5.4 Optional: secure the content API

Public read access is intentionally open (the website needs it). To additionally restrict write/modify access or create machine tokens:

1. **Settings → API Tokens → Create new API Token** (type: *Read-only*).
2. Copy the token into the backend environment variable `STRAPI_API_TOKEN`.
3. Restart the Django service. Requests from Django to Strapi are now authenticated.

### 5.5 Publish, unpublish or delete content — and make it stick

The website does not read Strapi directly. Content flows **Strapi → Django (sync) → website**, so every publish/unpublish/delete in Strapi must reach the Django copy. The sync engine keeps the two in sync with these rules:

- **Unpublish** an entry (or delete it) → it is removed from the website at the next sync. Strapi is the source of truth: only entries that are published in Strapi stay on the site.
- **Rename / re-order** an entry → the website updates the same entry (entries are tracked by their Strapi `documentId`, so no duplicates or leftovers appear).
- **Safety guard**: if a sync finds a collection completely empty (zero published entries), it deliberately keeps the existing content — this protects the site from wiping everything when the CMS is misconfigured. Keep at least one entry published in each collection; if you truly want a collection empty, delete the leftover rows in Django admin.
- **Seed content**: the built-in default articles/slides only exist while Strapi has never provided content; as soon as Strapi serves a collection, its entries replace the defaults.

To make unpublish/delete propagate **instantly** (instead of waiting for the ~2 minute cache window), register a Strapi webhook:

1. Generate a secret once, e.g. `openssl rand -hex 32`.
2. Set it as the backend environment variable `STRAPI_WEBHOOK_SECRET` (already wired in `render.yaml`) and redeploy the backend.
3. In Strapi: **Settings → Webhooks → Create new webhook**:
   - **Name**: `Django content sync`
   - **URL**: `https://<your-backend-domain>/api/webhooks/strapi`
   - **Events**: tick *Entry create*, *Entry update*, *Entry publish*, *Entry unpublish*, *Entry delete*
   - **Headers**: add `X-Strapi-Webhook-Secret` with the same secret value
4. **Save**. Press **Trigger** on the webhook row — it should answer `200` with `{"status":"accepted"}`.

From now on every save, publish, unpublish or delete in Strapi triggers an immediate forced sync, and the website reflects it within a couple of seconds.

> The webhook endpoint rejects requests without the matching `X-Strapi-Webhook-Secret` header (401) and debounces bursts so rapid successive saves trigger a single sync.

## 6. Google Analytics 4

### 6.1 Create the property and get the Measurement ID

1. Sign in at [analytics.google.com](https://analytics.google.com) → **Admin** (gear icon).
2. **Property → Create property** → name it `The Merkato Fund`, set timezone `Ethiopia` and currency `ETB`.
3. In the new property: **Data streams → Add stream → Web**.
4. Enter the website URL (e.g. `https://merkato-fund-frontend.vercel.app`) and name it.
5. Copy the **Measurement ID** — it looks like `G-AB12CD34EF`.

### 6.2 Install it

Set the ID once as an environment variable — no code changes required:

- **Locally:** put `VITE_GA_MEASUREMENT_ID=G-AB12CD34EF` in `.env.local` in the project root, restart `npm run dev`.
- **Vercel:** Project → Settings → Environment Variables → add `VITE_GA_MEASUREMENT_ID` → redeploy.

The app injects `gtag.js` only when the variable is present, so development stays clean.

### 6.3 Engagement events tracked

Beyond automatic pageviews, the site sends these GA4 events:

| Event | Trigger | Parameters |
|---|---|---|
| `article_read` | A visitor scrolls an article into view (once per article) | `article` (slug), `order` (1–7) |
| `video_play` | Explainer video thumbnail clicked | `video_url` |
| `contact_submit` | Contact form submitted | `status` (`success` / `error`) |
| `social_click` | Floating / footer / contact social icon clicked | `network`, `location` |
| `hero_cta` | Hero slider call-to-action clicked | `target` |
| `hero_slide_change` | Slider navigated | `direction`, `method` (`arrow` / `dot` / `keyboard` / `swipe`) |
| `nav_click` | Navigation link clicked | `target` |

Every event is also mirrored to the Django `/api/events/` endpoint and stored in the `EngagementEvent` table (viewable in Django admin) — a privacy-friendly first-party record independent of Google.

### 6.4 Hero slider timing

The slider advances every **6 seconds**. To change the pace, edit both of these (they must stay in sync):

1. `AUTOPLAY_MS` at the top of `src/components/HeroSlider.jsx`
2. the `6s` duration inside `.hero-progress-fill` in `src/styles/layout.css`

Hovering the hero with a mouse pauses the countdown (the progress bar freezes and resumes in place). The Ken Burns zoom is the 8.5s `kenBurnsIn` / `kenBurnsOut` keyframes in `layout.css` — even-numbered slides zoom out for variety.

### 6.5 Verify

Open GA4 → **Reports → Realtime** in one tab, browse the site in another: active users, `article_read` and `social_click` events appear within seconds.

## 7. Deployment

### 7.1 Frontend → Vercel

1. Push this repository to GitHub.
2. [vercel.com](https://vercel.com) → **Add New → Project** → import the repository.
3. Vercel auto-detects the root `vercel.json` (framework: Vite, build: `npm run build`, output: `dist`, SPA rewrite included).
4. **Environment Variables** (Production + Preview):
   | Name | Example |
   |---|---|
   | `VITE_API_BASE_URL` | `https://merkato-backend.onrender.com` |
   | `VITE_GA_MEASUREMENT_ID` | `G-AB12CD34EF` |
5. **Deploy**. Note the final domain (e.g. `https://merkato-fund-frontend.vercel.app`) — you will paste it into the backend CORS list.

### 7.2 Backend + CMS + databases → Render (blueprint, recommended)

1. [dashboard.render.com](https://dashboard.render.com) → **New → Blueprint** → select the repository. Render reads `render.yaml` and provisions:
   - `merkato-backend` (Django web service)
   - `merkato-strapi` (Strapi web service)
   - `merkato-db` + `merkato-strapi-db` (two free PostgreSQL instances)
2. When prompted, provide a value for `STRAPI_API_TOKEN` (leave blank to start unauthenticated — see 5.4).
3. **Apply** — Render builds and starts everything. First Strapi boot seeds all content automatically.
4. Wire the URLs together (one-time, ~2 minutes):
   - Copy the Strapi URL (e.g. `https://merkato-strapi.onrender.com`) → open `merkato-backend` → Environment → set `STRAPI_BASE_URL` to it → **Save & Deploy**.
   - Copy the backend URL → set it as `VITE_API_BASE_URL` in Vercel → redeploy the frontend.
   - In `merkato-backend` → Environment → append your Vercel domain to `CORS_ALLOWED_ORIGINS` → Save & Deploy.
   - In `merkato-strapi` → Environment → set `CORS_ORIGIN` to your backend URL → Save & Deploy.
   - Copy the generated `STRAPI_WEBHOOK_SECRET` from `merkato-backend` → Environment, then create the Strapi webhook described in **5.5** (URL: `https://merkato-backend.onrender.com/api/webhooks/strapi`).
5. Open the Strapi dashboard URL, create the admin account, and the production CMS is live.

> Render free-tier services sleep after ~15 minutes of inactivity; the first request afterwards takes ~30–60 seconds while they wake. Upgrade the plan for always-on production traffic.

### 7.3 Manual Render setup (alternative to the blueprint)

If you prefer clicking through manually, create two **PostgreSQL** instances, then:

- **Web service `merkato-backend`**: Root directory `backend`, build `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate`, start `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 2`, health check `/api/health/`, plus the env vars from `render.yaml` (`DATABASE_URL` linked to the first database).
- **Web service `merkato-strapi`**: Root directory `strapi-cms`, build `npm install && npm run build`, start `npm run start`, health check `/_health`, `DATABASE_CLIENT=postgres` + discrete `DATABASE_*` variables linked to the second database, `DATABASE_SSL=true`, `DATABASE_SSL_REJECT_UNAUTHORIZED=false`, and the four secret salts (generate with `openssl rand -base64 32`).

### 7.4 Scheduled content sync (optional hardening)

Django already re-checks Strapi every 120 seconds on live traffic. To also pull content on a fixed schedule (e.g. hourly), add a **Cron Job** on Render: command `cd backend && python manage.py sync_content --force`, schedule `0 * * * *`.

## 8. SEO implementation reference

| Requirement | Where it lives |
|---|---|
| Keywords `Ethiopian Investment`, `Merkato Fund`, `Daily Liquidity` | `<meta name="keywords">`, title tag, description, article headings in `index.html` |
| Dynamic per-article titles + descriptions | `src/components/Seo.jsx` (react-helmet-async) — scroll to any article and the document title/meta update |
| Open Graph + Twitter cards | `index.html` + dynamic overrides, share image `/og-cover.svg` |
| Structured data | JSON-LD `Organization` + `WebSite` graph in `index.html` |
| Canonical URL | `<link rel="canonical">` — update to your real domain at launch |
| Crawl directives | `<meta name="robots" content="index, follow">` + `strapi-cms/public/robots.txt` |
| Performance | Vite build ≈ 64 KB gzipped JS, preconnected fonts, no heavy frameworks |

## 9. Environment variables reference

**Frontend** (`.env.local` / Vercel):

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | *(empty — uses Vite dev proxy)* | Django base URL in production |
| `VITE_GA_MEASUREMENT_ID` | *(empty — GA disabled)* | GA4 Measurement ID |

**Backend** (`backend/.env` / Render):

| Variable | Default | Purpose |
|---|---|---|
| `DJANGO_SECRET_KEY` | insecure dev key | Set in production |
| `DJANGO_DEBUG` | `True` | Set `False` in production |
| `DJANGO_ALLOWED_HOSTS` | `localhost,127.0.0.1` | Add your Render domain |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000,...` | Frontend origins allowed to call the API |
| `DATABASE_URL` | SQLite fallback | PostgreSQL connection string (Render injects it) |
| `STRAPI_BASE_URL` | `http://localhost:1337` | CMS URL to sync from |
| `STRAPI_API_TOKEN` | *(empty)* | Optional read token from Strapi |
| `STRAPI_WEBHOOK_SECRET` | *(empty)* | Shared secret for Strapi → Django webhook; receiver is disabled while empty (see 5.5) |
| `CONTENT_SYNC_TTL_SECONDS` | `120` | Cache window between Strapi pulls |
| `STRAPI_TIMEOUT_SECONDS` | `2.5` | Sync HTTP timeout |

**Strapi** (`strapi-cms/.env` / Render):

| Variable | Purpose |
|---|---|
| `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET` | Secrets — generate with `openssl rand -base64 32` |
| `DATABASE_CLIENT` | `sqlite` (local) or `postgres` (production) |
| `DATABASE_HOST/PORT/NAME/USERNAME/PASSWORD` | PostgreSQL connection (production) |
| `DATABASE_SSL`, `DATABASE_SSL_REJECT_UNAUTHORIZED` | `true` / `false` on Render |
| `CORS_ORIGIN` | Origins allowed to call the CMS API |

## 10. IT implementation checklist (from the specification)

| # | Checklist item | Status |
|---|---|---|
| 1 | Domain and hosting setup (high uptime) | Vercel + Render blueprints ready; point your domain at Vercel |
| 2 | "The Merkato Fund" logo in header | Gold coin logo mark, sticky navbar |
| 3 | SSL certificate (HTTPS) | Automatic on Vercel and Render |
| 4 | 7 content sections created & populated | Seeded in Strapi, Django and the frontend fallback |
| 5 | Video player embedded and tested | Click-to-play section; paste the YouTube URL in Strapi → Site Setting |
| 6 | Social buttons linked (FB/TG/TikTok/IG) | Floating dock + contact chips + footer bar, editable in Strapi |
| 7 | Contact form & footer information | Form persists to the `ContactMessage` table, viewable in Django admin |
| 8 | Mobile responsiveness (iOS & Android) | Verified at 390 px: drawer nav, stacked timeline, bottom social bar |
| 9 | Speed optimization & caching | 64 KB gzipped bundle, Django content cache (TTL), WhiteNoise compression, CDN on Vercel |
| 10 | Analytics & meta-tags verified | GA4 events + dynamic meta tags; test in GA4 Realtime |
| 11 | Sign-off & approval | Ready for Product Strategy Lead review |

## 11. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Frontend shows content but contact form fails | Django not running | Start `python manage.py runserver` in `backend/` |
| Django logs `Content sync ... failed ... Connection refused` | Strapi not running | Start `npm run develop` in `strapi-cms/`; the site keeps serving cached content meanwhile |
| Strapi admin shows empty Content Manager on a fresh install | Admin account not created yet | Open `/admin`, register the first administrator |
| Edited content not appearing | Cache window | Wait ~2 minutes, run `python manage.py sync_content --force`, or configure the webhook in 5.5 |
| Unpublished/deleted entry still shows on the site | Webhook not configured + cache window not elapsed, or collection sync failing | Check the webhook (5.5) returns 200; run `python manage.py sync_content --force`; check backend logs for `Content sync ... failed` |
| Webhook returns 401 | Header secret mismatch | Compare `X-Strapi-Webhook-Secret` in Strapi's webhook with the backend's `STRAPI_WEBHOOK_SECRET` (no quotes/whitespace) |
| All entries of a collection were removed but the site still shows them | Deliberate safety guard: an empty Strapi collection never wipes live content | Keep at least one entry published, or delete the leftover rows in Django admin |
| `better-sqlite3` install errors on Strapi boot | Native driver missing | `cd strapi-cms && npm install better-sqlite3@^12.2.0` |
| CORS errors in the browser console | Frontend origin not whitelisted | Add the origin to `CORS_ALLOWED_ORIGINS` (backend) and `CORS_ORIGIN` (Strapi), then redeploy |
| GA Realtime shows nothing | Measurement ID missing | Set `VITE_GA_MEASUREMENT_ID` and redeploy |
| Database errors on Strapi start with SQLite | Stale `.tmp` folder | `cd strapi-cms && rm -rf .tmp && npm run develop` (re-seeds automatically) |
