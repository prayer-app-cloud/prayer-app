# CLAUDE.md — Prayer App Build Reference

## What this is
Anonymous prayer exchange PWA. Post a prayer, strangers tap "I prayed," get notified, post updates. Phase 1 only. No blocker, no screen lock, no native app yet.

## One-line pitch
Post a prayer. Get prayed for.

## Stack
- Next.js 15 (App Router)
- Supabase (PostgreSQL + Auth + Realtime + Edge Functions)
- Vercel (hosting)
- FCM via Edge Functions (push notifications)
- No Firebase. No ads SDK. No tracking pixels. No Facebook SDK. No location permissions.

## Non-negotiables
- Anonymous by default (session tokens, NOT device fingerprinting)
- No profiles, no following, no DMs, no comments
- No ads ever. No data selling ever.
- Requests expire in 48 hours unless updated
- No infinite scroll — "Load more" button, max 10 cards visible
- No public leaderboards, no XP, no badges, no streak monetization
- Self-harm language triggers resource display, not public posting
- Moderation from day one

## 7 Categories (enum)
health, family, grief, finances, inner_struggle, work_school, other

Categories are tappable pills on the post screen. NOT primary navigation. Home queue shows all categories mixed.

## Database Schema

### prayer_requests
id (uuid PK), text (varchar 500), category (enum), session_id (varchar), email (varchar nullable), prayer_count (int default 0), share_count (int default 0), report_count (int default 0), status (enum: active/updated/answered/removed/expired), anonymous (bool default true), urgency (enum: normal/high), update_text (varchar 280 nullable), expires_at (timestamp), share_slug (varchar unique), is_seed (bool default false), created_at, updated_at

### prayer_taps
id (uuid PK), request_id (uuid FK), session_id (varchar), source (enum: community/screen_lock/seed), created_at
UNIQUE constraint on (request_id, session_id)

### updates
id (uuid PK), request_id (uuid FK), type (enum: update/answered), text (varchar 280), is_seed (bool default false), created_at

### users
id (uuid PK), session_id (varchar), auth_method (enum: anonymous/email), email (varchar nullable), notification_enabled (bool default true), push_token (varchar nullable), trust_score (int default 100), strike_count (int default 0), is_admin (bool default false), created_at

### reports
id (uuid PK), request_id (uuid FK), reason (enum: spam/inappropriate/harmful/self_harm/other), reporter_session_id (varchar), created_at

### notifications
id (uuid PK), user_session_id (varchar), type (enum: prayer_received/request_answered/expiry_warning/milestone), request_id (uuid FK), read (bool default false), created_at

## Admin / Moderator Panel (password-protected route, /admin)

### Seed Management
- **Create seed requests:** Form with text, category, prayer_count, created_at. All marked is_seed=true.
- **Set prayer count:** Manually set prayer_count on any request (seed or real). This updates the displayed number directly.
- **Create seed taps:** Admin can create prayer_taps with source=seed for data consistency.
- **Adjust counts:** Admin can increase or decrease prayer_count on any request at any time.
- **Add answered updates:** Create answered-prayer updates on seed requests.
- **Expiry override:** Extend or reset expiry on any request.

### Moderation
- **Review queue:** Flagged/reported requests, auto-blocked content, self-harm triggers.
- **Actions:** Approve, remove, edit, ban session_id.

### Analytics (v1 — keep simple)
- Total requests (seed/organic split)
- Total prayer taps (seed/organic split)
- Coverage rate (% of requests with 1+ prayer in 24h)
- Active users (sessions in last 7 days)

## 5 Public Screens + 1 Admin Screen

### Screen 1: Home (Prayer Queue)
- 5-10 cards max, no infinite scroll
- Each card: category tag, short text preview, time left, prayer count, "I prayed" button
- No avatars, usernames, likes, comments, trending tabs
- "Load more" button, not auto-load

### Screen 2: Post Prayer Request
- Text field (280-500 chars with counter)
- 7 category pills (one tap, required)
- Anonymous toggle (ON by default)
- Urgency toggle (normal/high)
- Consent checkbox
- Auto-block: phone numbers, emails, URLs, hate terms, sexual content

### Screen 3: Prayer Detail (share link target)
- Full text, category, prayer count (animates on tap), time remaining
- Large "I prayed" button
- Share button → native share sheet
- Report button
- "Post update" (only for original poster)
- SSR with OG meta tags — this page IS the growth engine

### Screen 4: Update / Answered Prayer
- Mark as "update" or "answered"
- Short note (280 chars)
- This is the retention + sharing engine

### Screen 5: Notifications
- "12 people prayed for your request"
- "A prayer you prayed for was answered"
- "Your request expires in 12 hours"
- Meaningful reasons only, no generic reminders

## Share Link / OG Meta
URL: [domain]/r/[share_slug]
Title: "Someone needs prayer"
Description: "[Category] — [First 60 chars]..."
Must render server-side. Must work in iMessage, WhatsApp, Instagram stories.

## Onboarding Flow (first session)
1. Show headline: "Post a prayer. Get prayed for." + "Pray for someone now" CTA
2. Show one seeded prayer card → let user tap "I prayed"
3. "Need prayer too?" → post form
4. Confirm: "Your prayer is live."
Do NOT start with sign-up wall or feature slideshow.

## Auto-block Rules
Phone numbers, email addresses, URLs, hate terms, slurs, sexual content, fundraising/solicitation, medical emergency directives

## Seeding System (Cold Start)

### Pre-launch seeding
- Generate 200+ seed requests using AI, modeled on real prayer wall language patterns (short, raw, specific, 1-3 sentences)
- Distribute: health 25%, family 20%, inner_struggle 20%, finances 10%, grief 10%, work_school 10%, other 5%
- Load with staggered created_at timestamps across 48 hours
- All marked is_seed=true, source=seed on taps
- Include 20-30 answered prayer updates on seed requests

### Admin controls prayer counts
- Admin can set prayer_count directly on any request via /admin panel
- For seed requests, set prayer_count to realistic range (3-25)
- Admin can also create seed prayer_taps with source=seed if needed for data consistency
- Admin can adjust counts up or down at any time on any request

### Phasing out
- Seeds expire naturally through 48h mechanic
- Stop creating new seeds once organic requests exceed seeded ones
- Admin dashboard shows seed vs organic ratio
- Filter seeds from public-facing analytics

## Key Metrics to Track
- prayer_request_created, prayed_tapped, notification_opened, update_created, answered_marked, request_shared, report_submitted
- Coverage: >80% of requests get prayer within 24h
- Return rate: >35% of posters return within 48h

## Visual Direction
- Warm, not cold. Cream/off-white backgrounds, soft amber/gold accents
- Generous spacing, rounded cards, no sharp edges
- Subtle motion only (prayer count rise, gentle confirmation)
- No confetti, no celebratory animation, no gamification visuals
- This should feel like a quiet room with a candle, not a social feed

## Copy Rules
- Short sentences, everyday words, present tense
- "Someone prayed for your request" NOT "Your request has been successfully submitted"
- "What do you need prayer for?" NOT "Submit your prayer request"
- Never say: "join the community," "engage with believers," "unlock breakthrough," "top prayers this week"

## What NOT to Build
- Comments or replies on prayers
- User profiles or following
- Category-based browsing/tabs (categories for posting only)
- Public leaderboards or prayer rankings
- AI-generated prayer responses
- Social feed mechanics (likes, shares, trending)
- Church management features
- Content library or devotionals

## Deferred / Out of Scope (do NOT build these in MVP)
- Screen lock / blocker logic (Phase 2)
- Private prayer circles (Phase 3)
- Premium paywall / RevenueCat / subscriptions
- Email auth (anonymous session tokens only for now)
- Advanced analytics beyond simple admin dashboard
- Recommendation or ranking algorithms
- AI-generated prayer content
- Localization / i18n
- Native app packaging (App Store / Play Store)
- Social features of any kind (following, DMs, comments, profiles)

## MVP is Complete When
- Anonymous user can post a prayer request in under 30 seconds
- User can tap "I prayed" on any request (once per request per session)
- Prayer count updates in real time on tap
- Poster receives notification when someone prays
- Poster can post an update or mark as answered
- Share links render correctly with OG metadata (title, description, image)
- Share link page works as standalone entry point from iMessage/WhatsApp
- Moderation review queue works (flag, remove, approve)
- Auto-block rules catch phone numbers, emails, URLs, hate terms
- Requests expire after 48 hours unless updated
- Admin can create seed requests with set prayer counts
- No profiles, comments, or DMs exist anywhere in the app
- Self-harm keywords trigger resource display, not public posting

## Route Map
- `/` — Home prayer queue (Screen 1)
- `/post` — Post prayer request (Screen 2)
- `/r/[share_slug]` — Prayer detail / share link page (Screen 3, SSR with OG tags)
- `/update/[id]` — Poster update / answered flow (Screen 4)
- `/notifications` — Notifications list (Screen 5)
- `/admin` — Moderator panel (password-protected)

## Permissions Rules
- Only the original session_id can update or mark their own request as answered
- One session_id can only tap "I prayed" once per request (enforced by UNIQUE constraint)
- Only admin (is_admin=true) can edit, remove, or ban other users' content
- Self-harm flagged posts are hidden from public queue immediately, visible only in admin review
- Expired requests are hidden from the main queue but remain accessible to the original poster and admin

## Empty State Rules
- If queue is empty: show seeded content, never show "No prayers yet" with a blank screen
- If no notifications: show calm empty state with copy like "Nothing yet. We'll let you know when someone prays."
- If no updates on a request: show gentle prompt "No updates yet"
- First-time visitor: show onboarding flow (pray for someone first, then invite to post)

## Full Reference Docs
For complete details on competitive landscape, monetization, personas, and strategy, see:
- prayer-app-FINAL-reference.md (1,131 lines, 32 sections)
- prayer-app-market-research-FINAL.md (698 lines, 19 sections)
