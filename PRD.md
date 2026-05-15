# Product Requirements Document (PRD)

**Product:** The Organic Buzz — AI-Powered Outbound System (Landing Page + Course Platform)
**Domains:** `theorganicbuzz.com` (marketing) · `course.intentledsales.com` (portal)
**Owner:** Anirudh Gupta / IntentLedSales
**Document Version:** 1.0
**Status:** Living document — blueprint for development, design, and QA
**Last Updated:** 2026-05-15

---

## 1. Executive Summary

The Organic Buzz is a paid, self-paced online training program that teaches freelancers, agency owners, consultants, and SMB sales reps how to build an AI-powered outbound machine that books 30+ qualified sales meetings per month on autopilot. This product comprises three tightly coupled experiences in a single codebase:

1. **A high-conversion marketing landing page** that sells the course.
2. **A gated course portal** (auth-protected) that delivers video lessons, resources, and a downloadable lead database, with per-user progress tracking.
3. **An internal admin portal** for managing modules, lessons, resources, coupons, pricing tiers, and members, plus viewing analytics.

The system also includes geo-aware pricing (India / SAARC / International), Razorpay-based checkout with coupon support, GST-compliant invoicing, an AI chatbot for pre-sale Q&A, and ad-platform conversion tracking (Reddit Pixel + Conversions API).

---

## 2. Goals & Non-Goals

### 2.1 Business Goals
- **G1:** Convert cold landing-page traffic to paid course enrollments at ≥ 3% on India tier, ≥ 1.5% on International tier.
- **G2:** Deliver an instant, frictionless post-purchase experience (account auto-created → email → portal access within 60 seconds).
- **G3:** Maximize average revenue per visitor by serving region-appropriate pricing without sacrificing the brand's premium positioning.
- **G4:** Reduce support load by surfacing course/refund/setup info through an always-on AI chatbot.
- **G5:** Enable a non-technical operator to ship content updates (new lessons, resources, pricing changes, coupons) without a developer.

### 2.2 Product Goals
- **P1:** Sub-3s LCP on the landing page on a median mobile connection.
- **P2:** Lifetime course access for buyers with progress that persists across devices.
- **P3:** Zero hard-coded prices in checkout — pricing tier is determined at runtime by visitor IP.
- **P4:** Single source of truth (Supabase) for content, with safe static fallback if the DB is empty/unreachable.

### 2.3 Non-Goals
- A native mobile app (responsive web only).
- Live cohorts, scheduled classes, or instructor-graded assignments.
- A marketplace, affiliate program, or multi-instructor support.
- Course content authoring inside the app (video is hosted on Loom; admin only references it).
- Internationalization of UI copy (English only; pricing currency varies).

---

## 3. Target Users & Personas

| Persona | Pain Today | What They Buy |
|---|---|---|
| **Freelancer** (₹50K+/client) | Feast-or-famine; competing on price | Predictable inbound-style pipeline |
| **Agency Owner** (₹5L–50L ARR) | 30% revenue drop per churn; referrals not enough | Scalable outbound that doesn't need more BDR hires |
| **Consultant / Coach** | Spending more time hunting than serving | Calendar filled with qualified prospects |
| **Sales Rep at SMB** | Quota with no tools, no training | Personal AI prospecting machine |

**Secondary user:** Admin / course operator (internal, single-seat for v1).

---

## 4. Product Surface Area

The product is delivered as a single React 19 + Vite SPA with serverless API routes (Vercel functions under `/api/*`). All persistence is in Supabase (Postgres + Auth). Videos are hosted on Loom and embedded.

### 4.1 Public Routes
| Path | Purpose |
|---|---|
| `/` | Landing page (13 marketing sections + sticky mobile CTA + chatbot) |
| `/checkout` | Geo-priced Razorpay checkout with coupon support |
| `/thank-you` | Post-purchase confirmation + portal entry |
| `/login` | Email/password sign-in |
| `/forgot-password` | Request password reset email |
| `/reset-password` | Set new password from email link |

### 4.2 Auth-Gated Routes (member)
| Path | Purpose |
|---|---|
| `/course` | Course dashboard — modules grid, progress, "continue where you left off" |
| `/course/:moduleId/:lessonId` | Lesson player (Loom video + resources + next/prev) |
| `/course/resources` | All downloadable resources in one place (lead DB, blueprints) |

### 4.3 Admin-Gated Routes
| Path | Purpose |
|---|---|
| `/admin/login` | Admin email/password sign-in (separate from member auth) |
| `/admin` | Module list with reorder/delete |
| `/admin/modules/:id` | Edit a module + manage its lessons |
| `/admin/lessons/:id` | Edit a lesson (title, Loom URL, status, resources) |
| `/admin/members` | View/search members; manual access grant; export |
| `/admin/analytics` | Sales, signups, completion stats |
| `/admin/coupons` | Create/edit/expire coupon codes |
| `/admin/pricing` | Edit pricing tiers (India / SAARC / International) |

---

## 5. Landing Page Specification

The landing page is the conversion engine. Every section ends in a CTA scrolling to `/checkout`. The full copy spec is the source of truth in `CONTENT_OUTLINE.md`; this section describes structure and behavior.

### 5.1 Section Order & Behavior
1. **Navbar** — sticky on scroll; anchors to: How It Works, What You Get, Who am I, Proof, Testimonials, FAQ. Primary CTA: "Get Access Now".
2. **Hero** — H1 promise ("30+ Qualified Sales Meetings Every Month. On Complete Autopilot."), VSL video (`/videos/vsl.mov`), social-proof badges (1132+ users, 4.9/5), urgency (42/50 spots), dual CTA (Buy / Watch).
3. **Before / After** — 4 pain points vs. 4 outcomes with animated arrow.
4. **Testimonials** — 6 student screenshots in a Swiper carousel + stats strip (1132+ students, 2,847 meetings, ₹4.2Cr+ pipeline).
5. **System Funnel** — The 4-stage framework (Discovery → Personalization → Infra → Booking) with per-stage outcomes and embedded tool logos.
6. **Instructor** — `/videos/intro.mp4` (poster preloaded), 5 credentials, "Why I'm sharing this" note.
7. **Complete System (What You Get)** — 8 deliverable cards with ₹ value per card and screenshots (flowchart, copy frameworks, lead lists, community).
8. **Dashboard Showcase** — Real campaign screenshots (2 big + 6 small) + stats badges (23% reply rate, 30+ meetings/mo, 1000+ emails/day).
9. **Personas** — 4 ICP cards (Freelancer, Agency, Consultant, SMB Rep).
10. **Value Stack** — Stacked ₹37,000 value vs. ₹3,497 price; vs. hiring-a-BDR comparison.
11. **Risk Reversal** — 30-day completion-based money-back guarantee.
12. **Urgency** — Countdown timer (48h), spots progress bar (44/50), price-increase warning.
13. **FAQ** — 10 Q/A items in an accordion; #1 and #2 default-open.
14. **Footer** — Brand, quick links (Privacy, Terms, Refund), support email/phone, trust badges, copyright.
15. **Sticky Mobile CTA** — Bottom-fixed bar with strike-through price and "Enroll Now".

### 5.2 Functional Requirements
- **FR-LP-1:** All prices on the landing page render from the active pricing tier (not hard-coded). India sees ₹, others see $.
- **FR-LP-2:** Every primary CTA navigates to `/checkout`. Anchor CTAs (e.g., "Watch 6-Min Breakdown") scroll-and-play.
- **FR-LP-3:** Hero VSL must autoplay muted on `canplay`; user can unmute.
- **FR-LP-4:** Countdown timer in the Urgency section is **per-visitor** (localStorage-anchored, 48h from first visit), not real-time global, to avoid "always 00:00" embarrassment.
- **FR-LP-5:** Spot counter ("44/50") is a static editable constant; admin can update without redeploy via env/constants file in v1.
- **FR-LP-6:** Landing page must be fully usable with JavaScript enabled but should server-render meta tags (title, description, OG) statically in `index.html`.
- **FR-LP-7:** Lazy-load below-the-fold sections and the chatbot widget. Hero must paint without waiting for any lazy chunk.

### 5.3 Performance Requirements
- LCP ≤ 2.5s on 4G mobile (Moto G4 emulation).
- CLS ≤ 0.05.
- Hero video poster must paint before video buffers.
- Initial JS ≤ 180 KB gzip; chatbot, checkout, course, admin all code-split.

### 5.4 SEO / Social
- `<title>`: "The Organic Buzz | 30+ Sales Meetings on Autopilot"
- Meta description, OG title/description/image, theme color `#0D0D12`, favicon all set in `index.html`.

---

## 6. Checkout & Payments

### 6.1 Flow
1. User clicks any "Buy" CTA → `/checkout`.
2. App calls `GET /api/pricing` with visitor IP → returns tier (`INDIA` / `SAARC` / `INTERNATIONAL`) with `basePrice`, `originalPrice`, `currency`, `symbol`, `gstRate`.
3. User enters: full name, email, phone, country (auto-detected, editable), and optional coupon code.
4. Coupon validated via `POST /api/validate-coupon` → returns discounted amount or rejection reason.
5. On "Pay Now": app calls `POST /api/create-order` → creates a Razorpay order with the final amount (incl. GST for India tier) → opens Razorpay checkout modal.
6. On successful payment webhook handshake, app calls `POST /api/create-contact` which:
   - Verifies the Razorpay signature.
   - Creates the Supabase user (or finds an existing one) and grants course access.
   - Generates a GST invoice (India tier) via `/api/admin/generate-invoices`.
   - Sends a Reddit CAPI `Purchase` event (server-side) mirroring the client-side Reddit Pixel.
   - Records the lead/contact + order.
7. User is redirected to `/thank-you` with a magic-link / pre-set session that bounces them to `/course`.

### 6.2 Functional Requirements
- **FR-CK-1:** Pricing is determined **server-side** by IP geolocation (`/api/pricing` → `src/services/geolocation.js`). The client cannot override the tier.
- **FR-CK-2:** Fallback tiers in `src/constants/pricing.js` are used only if `/api/pricing` is unreachable; database (`pricing_tiers`) is the runtime source of truth.
- **FR-CK-3:** GST is computed and shown as a line item only for the `INDIA` tier (18%).
- **FR-CK-4:** Coupons may be: percent-off, flat-off, or geo-restricted. Each has a max-uses counter and an `expires_at`. Validation must be **race-safe** (uses are atomic-incremented after payment success, not at validation time).
- **FR-CK-5:** Order creation must idempotently handle a repeat-click — never create two Razorpay orders for the same client-generated nonce.
- **FR-CK-6:** All payment-bearing endpoints verify the Razorpay HMAC signature before mutating data.
- **FR-CK-7:** If account creation fails after a successful payment, the failure must be logged with the Razorpay `payment_id` and surface a recoverable error UI (no money taken without access granted).

### 6.3 GST Invoicing (India)
- Auto-generated on purchase, downloadable from the thank-you page and the member portal.
- Invoice contains: business name, GSTIN, address, state code (from env), customer name, GSTIN if provided, line items, CGST/SGST or IGST split.

### 6.4 Refunds
- 30-day money-back guarantee, **contingent on the buyer completing 100% of the course**. Manual process; admin marks order as refunded in `/admin/members`.

---

## 7. Authentication & Account Lifecycle

### 7.1 Member Auth (Supabase Auth)
- Email + password. No social login in v1.
- Password set automatically at purchase time (random, emailed to user) **or** prompted via reset-password link on first login (decide via product config — default: emailed reset link).
- Sessions persisted via Supabase JS SDK. Refresh handled by SDK.
- `/forgot-password` triggers Supabase reset email; `/reset-password` consumes the token.
- Optional **Cloudflare Worker proxy** (`cloudflare-worker/supabase-proxy.js`) to route Supabase traffic when blocked in certain regions; configured via `VITE_SUPABASE_PROXY_URL`.

### 7.2 Admin Auth (custom, JWT)
- Single admin credential pair stored in env (`ADMIN_EMAIL`, `ADMIN_PASSWORD`, `JWT_SECRET`).
- `/api/admin-auth.js` issues a signed JWT on successful login; stored in `admin_sessions` table for revocation.
- `ProtectedAdminRoute` validates the JWT and route is denied otherwise.
- Out of scope v1: multi-admin, role-based permissions, audit log.

---

## 8. Course Portal

### 8.1 Information Architecture
- **Course → Modules → Lessons → Resources.**
- A lesson has: title, description, Loom video URL (share or embed), status (`available` / `coming_soon` / `draft`), display order, and zero or more resources.
- A resource has: title, URL, type (`link`, `whimsical`, `gdrive`, `gdoc`, `notion`, `file`).

### 8.2 Functional Requirements
- **FR-CP-1:** `/course` shows a module grid with per-module progress bar (computed from completed lessons in the module) and an overall progress header.
- **FR-CP-2:** Lessons with `coming_soon` or `draft` status are visible (greyed) but not navigable.
- **FR-CP-3:** Lesson page embeds Loom (share URLs auto-converted to `/embed/` form), shows description, lists attached resources, and offers Prev/Next within the module.
- **FR-CP-4:** Completing a lesson (90% watched **or** explicit "Mark complete" tap) writes to `user_progress.completed_lessons` (text array of lesson IDs) and updates `current_lesson` + `last_accessed`.
- **FR-CP-5:** `/course/resources` aggregates every resource across every lesson, grouped by module, with filter-by-type.
- **FR-CP-6:** Course content has a **DB-first, static-fallback** read strategy: if the `modules` table is empty or unreachable, the app falls back to `src/constants/courseData.js`. The frontend caches DB course data for 5 minutes.
- **FR-CP-7:** Row-Level Security: a member can only read/write their own `user_progress`. Service-role key (server only) bypasses RLS for account provisioning.

### 8.3 Loom URL Normalizer
The helper in `courseData.js::getLoomEmbedUrl` accepts a Loom share URL (with or without `?sid=`) and returns the `/embed/` form. Admin UI uses the same helper and shows a live preview before save.

---

## 9. Admin Portal

### 9.1 Capabilities
| Page | What it does |
|---|---|
| **Modules** | CRUD modules. Drag/reorder via up/down arrows. Cascading delete prompts for confirmation. |
| **Module Editor** | Edit title/description; CRUD lessons within; reorder lessons. |
| **Lesson Editor** | Edit title/description/Loom URL/status; CRUD resources; live Loom preview. |
| **Members** | Searchable table (email, name, signup date, last login, % complete). Manually grant/revoke access. Export CSV. |
| **Analytics** | Aggregate KPIs: total members, MRR-equivalent, course completion rate, top lessons, refunds. |
| **Coupons** | CRUD codes with type (percent/flat), value, max-uses, expires-at, allowed tier(s). |
| **Pricing** | Edit `pricing_tiers` rows for INDIA / SAARC / INTERNATIONAL (basePrice, originalPrice, gstRate, currency, symbol). |

### 9.2 Functional Requirements
- **FR-AD-1:** All admin writes go through `/api/admin/*` endpoints that verify the admin JWT server-side; client cannot write directly to Supabase tables with the anon key.
- **FR-AD-2:** Reorder endpoints (`/api/admin/modules/reorder`, `/api/admin/lessons/reorder`) accept a full ordered ID list and update `order` atomically in a transaction.
- **FR-AD-3:** Pricing edits propagate within 5 minutes (matches frontend cache window).
- **FR-AD-4:** Coupon updates apply on the next validation call (no client cache).

---

## 10. AI Chatbot

### 10.1 Purpose
Reduce pre-sale friction by answering questions (curriculum, pricing, refunds, tools, who-it's-for) inline.

### 10.2 Behavior
- Floating widget mounted on every public page (`ChatWidget` is lazy-loaded as a separate bundle).
- Pre-chat form captures name + email (optional) before first message → captured as a lead via `/api/leads`.
- Conversation streams from `/api/chat` which is grounded by `intentledsales-course-knowledge-base.md` / `course_knowledge_base_new.md` via `src/lib/systemPrompts.js`.
- Suggested chips (e.g., "What's the price?", "Is this for beginners?") seeded for the first turn.
- State managed in Zustand (`src/store/chatStore.js`); resets per session.

### 10.3 Constraints
- The bot may **not** fabricate prices, features, or guarantees not in the knowledge base.
- Must not collect payment or attempt to enroll users; always link to `/checkout`.
- Hard limit: 20 messages per visitor per day per IP (rate-limit at API).

---

## 11. Pricing & Geolocation

### 11.1 Tiers (defaults; admin-editable at runtime)
| Tier | Currency | Base Price | Original Price | GST |
|---|---|---|---|---|
| INDIA (`IN`) | INR ₹ | 3,999 | 49,999 | 18% |
| SAARC (`BD`, `PK`, `NP`, `LK`, `BT`) | USD $ | 47 | 1,499 | 0% |
| INTERNATIONAL (all others) | USD $ | 129 | 3,999 | 0% |

**Note:** Marketing copy in `CONTENT_OUTLINE.md` references ₹3,497 — this is overridden at runtime by DB pricing; copy/numbers should be templated rather than hard-coded where feasible.

### 11.2 Determination
- Server-side IP lookup via `src/services/geolocation.js` → maps ISO country to tier via `tierForCountry()`.
- Fallback to `INTERNATIONAL` if geolocation fails.

---

## 12. Analytics, Tracking & Compliance

### 12.1 Conversion Tracking
- **Reddit Pixel** (client-side) for `PageVisit`, `ViewContent`, `Lead`, `Purchase`.
- **Reddit Conversions API** (server-side) mirrors `Purchase` from `/api/create-contact` for de-dup-able server attribution. Uses `REDDIT_CONVERSION_TOKEN`, `REDDIT_PIXEL_ID`. Optional `REDDIT_CAPI_TEST_ID` routes events to Reddit's test bucket — must be unset in production.

### 12.2 Internal Analytics
- Admin Analytics page reads aggregate counts from Supabase (`orders`, `auth.users`, `user_progress`).
- No third-party analytics SDK is mandatory; if added (e.g., GA4, PostHog), must be cookie-banner-gated for EU traffic.

### 12.3 Legal Pages
- Privacy Policy, Terms & Conditions, Refund Policy are linked from the footer. Markdown content sourced from `/public` or rendered via `react-markdown`. (Static for v1.)

---

## 13. Data Model

### 13.1 Core Tables (Supabase / Postgres)
- `auth.users` — Supabase-managed; member identity.
- `user_progress` — `user_id`, `completed_lessons` (text[]), `current_lesson`, `last_accessed`. RLS: own-row only.
- `modules` — `id`, `title`, `description`, `order`, `created_at`.
- `lessons` — `id`, `module_id` (FK), `title`, `description`, `loom_url`, `status`, `order`.
- `resources` — `id`, `lesson_id` (FK), `title`, `url`, `type`, `order`.
- `orders` — `id`, `user_id`, `razorpay_order_id`, `razorpay_payment_id`, `amount`, `currency`, `tier`, `coupon_code`, `gst_amount`, `invoice_url`, `status`, `created_at`.
- `coupons` — `code`, `type` (`percent`/`flat`), `value`, `max_uses`, `times_used`, `allowed_tiers` (text[]), `expires_at`.
- `pricing_tiers` — `tier`, `currency`, `symbol`, `base_price`, `original_price`, `gst_rate`.
- `admin_sessions` — `id`, `jwt_jti`, `created_at`, `expires_at`, `revoked_at`.
- `leads` — `id`, `email`, `name`, `phone`, `source`, `created_at` (chatbot / pre-checkout capture).

### 13.2 Indexes
- `user_progress(user_id)` unique.
- `orders(razorpay_order_id)`, `orders(razorpay_payment_id)`.
- `coupons(code)` unique-case-insensitive.

---

## 14. API Specification

All endpoints are Vercel serverless functions under `/api`. JSON in, JSON out.

| Endpoint | Method | Purpose | Auth |
|---|---|---|---|
| `/api/pricing` | GET | Returns active tier for caller's IP | None |
| `/api/validate-coupon` | POST | Validates a coupon for `{code, tier, amount}` | None |
| `/api/create-order` | POST | Creates Razorpay order for `{email, amount, currency, tier, coupon?}` | None (signature on next call) |
| `/api/create-contact` | POST | Finalizes purchase: verifies Razorpay sig, provisions user, sends Reddit CAPI, invoices | Razorpay sig |
| `/api/leads` | POST | Captures pre-sale lead from chatbot/forms | None |
| `/api/chat` | POST | Streams chatbot reply, grounded by KB | Rate-limited |
| `/api/progress` | GET/POST | Read/write `user_progress` | Member JWT |
| `/api/course-data` | GET | Returns full course tree (modules + lessons + resources) | Member JWT |
| `/api/admin-auth` | POST | Admin login → JWT | None |
| `/api/admin/modules` | CRUD | Manage modules | Admin JWT |
| `/api/admin/lessons` | CRUD | Manage lessons | Admin JWT |
| `/api/admin/resources` | CRUD | Manage resources | Admin JWT |
| `/api/admin/coupons` | CRUD | Manage coupons | Admin JWT |
| `/api/admin/pricing` | CRUD | Manage pricing tiers | Admin JWT |
| `/api/admin/members` | GET | List members + progress | Admin JWT |
| `/api/admin/analytics` | GET | Aggregated KPIs | Admin JWT |
| `/api/admin/generate-invoices` | POST | Backfill/regenerate GST invoices | Admin JWT |
| `/api/admin/modules/reorder` | POST | Reorder modules atomically | Admin JWT |
| `/api/admin/lessons/reorder` | POST | Reorder lessons atomically | Admin JWT |

---

## 15. Tech Stack

| Layer | Choice |
|---|---|
| Frontend framework | React 19 + Vite 7 |
| Routing | react-router-dom 7 |
| Styling | Tailwind CSS 4 (via `@tailwindcss/vite`) |
| Animation | Framer Motion 12 |
| Icons | lucide-react, react-icons |
| Carousels | Swiper 12 |
| Markdown | react-markdown + remark-gfm |
| State | Zustand 5 (chat); React Context (Auth, AdminAuth, Pricing) |
| Toasts | react-hot-toast |
| Backend | Vercel serverless functions (Node) |
| Database / Auth | Supabase (Postgres + Auth) |
| Payments | Razorpay |
| Video hosting | Loom (embed) |
| Email | Supabase Auth emails + transactional via Resend/SES (TBD, must be configured) |
| Ad tracking | Reddit Pixel + Reddit Conversions API |
| Optional egress | Cloudflare Worker (Supabase proxy) |
| Hosting | Vercel (per `vercel.json`) |

Lint: ESLint 9 flat config. Type system: JavaScript (TS only in the experimental `ANICOURSE/` Next.js workspace).

---

## 16. Environment Configuration

Required env vars (see `.env.example`):

**Frontend (`VITE_*`)**
- `VITE_RAZORPAY_KEY_ID`
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_PROXY_URL` (optional)

**Server**
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `RAZORPAY_KEY_SECRET`
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `JWT_SECRET`
- `BUSINESS_NAME`, `BUSINESS_GSTIN`, `BUSINESS_ADDRESS`, `BUSINESS_STATE`, `BUSINESS_STATE_CODE`
- `REDDIT_CONVERSION_TOKEN`, `REDDIT_PIXEL_ID`, `REDDIT_CAPI_TEST_ID` (test only)

---

## 17. Non-Functional Requirements

### 17.1 Performance
- LCP ≤ 2.5s; TTI ≤ 4s on 4G mobile.
- Hero JS bundle ≤ 180 KB gzip.
- API p95 latency ≤ 600ms (pricing/coupon/order endpoints).

### 17.2 Availability
- Target 99.9% uptime (limited by Vercel + Supabase + Razorpay SLAs).
- DB-first content reads must degrade to static fallback on Supabase outage.
- Checkout failure must never silently drop a paid order — alert via logs + email to admin.

### 17.3 Security
- All payment endpoints verify Razorpay HMAC.
- Service-role Supabase key never reaches the client.
- Admin JWT signed with HS256 + `JWT_SECRET` (rotate quarterly).
- RLS enabled on every member-owned table; service-role used only server-side.
- Inputs validated server-side (Zod or equivalent, TBD).
- HTTPS-only; HSTS via Vercel default.
- Secrets never committed; `.env*` git-ignored.
- Rate-limit: `/api/chat`, `/api/validate-coupon`, `/api/leads` by IP.

### 17.4 Privacy / Compliance
- India PII handling per IT Act; collect only name, email, phone, country.
- GST invoice retained 7 years.
- Refund/cancellation policy linked at footer and at checkout.
- Cookie banner required if GA/PostHog/Meta cookies added (not currently used).

### 17.5 Accessibility
- WCAG 2.1 AA target.
- All interactive elements keyboard-reachable with visible focus.
- Color contrast ≥ 4.5:1 against the `#0D0D12` brand background.
- Video players expose native controls; captions on VSL where available.

### 17.6 Browser Support
- Last 2 versions of Chrome, Safari, Edge, Firefox.
- iOS Safari 16+, Android Chrome 110+.

### 17.7 Observability
- Structured server logs (request id, user id, order id) on every `/api` endpoint.
- Surfaced errors to admin via email digest (TBD).
- Razorpay webhook events stored raw for audit.

---

## 18. Design System

| Token | Value |
|---|---|
| Background | `#0D0D12` |
| Accent (cyan) | `#00D4FF` |
| Body text | white / `text-white/80` |
| Section heading | bold, gradient on key promise words |
| CTA button | solid cyan; hover lifts + glow |
| Card | dark surface `#15151E` + 1px hairline border `#FFFFFF/10` |

- Spacing scale: Tailwind defaults.
- Radius: `rounded-xl` (cards), `rounded-full` (chips, primary CTA).
- Motion: Framer Motion `fadeInUp` on scroll-into-view, 0.4s ease-out. No motion if `prefers-reduced-motion`.

---

## 19. Release Plan & Acceptance Criteria

### 19.1 v1.0 (current target)
Acceptance:
- ✅ Landing page renders correctly on mobile + desktop, all 13 sections functional.
- ✅ India / SAARC / International tier is selected automatically; manual override impossible on client.
- ✅ Razorpay checkout completes a real ₹3,999 + 18% GST transaction in test mode; webhook provisions user and grants `/course` access.
- ✅ Member can log in, watch a lesson, mark it complete, and see progress persisted on a second device.
- ✅ Admin can create a module, add a lesson with a Loom URL, see the embed render correctly in the member view within 5 minutes.
- ✅ Reddit CAPI receives a `Purchase` event with the test ID set; identical event hits the Pixel client-side.
- ✅ GST invoice PDF is generated and emailed for an India-tier purchase.

### 19.2 v1.1 (post-launch)
- Multi-admin with roles (content vs. finance).
- Audit log on admin actions.
- GA4 / PostHog with cookie consent.
- Affiliate referral codes (extension of coupon model).
- Email drip sequence on signup (Day 1 / 3 / 7 / 14).
- Course completion certificate.

### 19.3 v1.2 (exploratory — see `ANICOURSE/`)
- Next.js + TS rebuild of the course portal for SSR + improved video page TTI.
- Native mobile-friendly download manager for the lead DB.

---

## 20. Testing Strategy

### 20.1 Manual / QA
- **Conversion smoke test** (every release): land → click hero CTA → complete checkout in Razorpay test mode → reach `/thank-you` → log in → play first lesson → mark complete → see progress on dashboard.
- **Geo pricing matrix:** verify India / SAARC (Pakistan VPN) / International (US VPN) all see correct currency and amount in the page and Razorpay modal.
- **Coupon matrix:** valid / expired / max-used / wrong-tier / invalid-code each yield the documented UX.
- **Refund path:** admin marks order refunded → member loses `/course` access on next session refresh.

### 20.2 Automated
- ESLint must pass (`npm run lint`) on every PR.
- Build must succeed (`npm run build`) on every PR.
- Unit tests (Vitest, to be added) for: `tierForCountry`, `formatPrice`, `buildPricing`, `getLoomEmbedUrl`, coupon math, GST math.
- Integration tests (Playwright, to be added) for the checkout smoke test against a Razorpay test account.

### 20.3 Performance Guardrails
- Lighthouse CI on every PR; LCP/CLS regressions fail the check.

---

## 21. Open Questions / Decisions Needed

1. **Password creation at purchase:** auto-set random + email vs. force reset-link first-login? (Default: email reset link.)
2. **Transactional email provider:** Resend, SES, or Postmark? (Cost vs. India deliverability.)
3. **Marketing copy ₹3,497 vs. DB tier ₹3,999:** which is canonical? Templating copy from pricing is recommended to avoid drift.
4. **Spot counter (44/50) source:** static constant for v1, but should it eventually count real orders left in the day?
5. **Course content licensing language:** clarify "Lifetime access" terms (account suspension policy).
6. **Cookie consent:** required now (only Reddit Pixel) or only if EU traffic exceeds a threshold?
7. **Affiliate program timing** — v1.1 or later?

---

## 22. Glossary

- **ICP** — Ideal Customer Profile.
- **BDR** — Business Development Representative.
- **VSL** — Video Sales Letter (hero video).
- **SAARC** — South Asian regional pricing group: IN-equivalent affordability tier (BD, PK, NP, LK, BT).
- **CAPI** — Conversions API (server-to-server attribution).
- **RLS** — Postgres Row-Level Security.
- **GST** — Goods & Services Tax (India, 18% on this product).
- **Loom** — Third-party video hosting; all lesson videos are embedded from it.
