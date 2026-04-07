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
- Gemini 2.0 Flash-Lite via Supabase Edge Functions (Prayer Points + Guided Prayer generation)
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
id (uuid PK), text (varchar 500), category (enum), session_id (varchar), email (varchar nullable), prayer_points (text nullable — AI-generated bullet summary, approved by poster), guided_prayer (text nullable — AI-generated short prayer for pray-ers), prayer_count (int default 0), share_count (int default 0), report_count (int default 0), status (enum: active/updated/answered/removed/expired), anonymous (bool default true), urgency (enum: normal/high), update_text (varchar 280 nullable), expires_at (timestamp), share_slug (varchar unique), is_seed (bool default false), created_at, updated_at

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
- **Generate seeds:** Form to create seed prayer requests (text, category, prayer_count, created_at). All marked is_seed=true.
- **Bulk import:** Upload CSV/JSON of seed requests with staggered timestamps.
- **Set prayer count:** Manually set prayer_count on any request (seed or real). This updates the displayed number directly — no fake tap records needed for seeds.
- **Add answered updates:** Create seed answered-prayer updates on seed requests.
- **Expiry override:** Extend or reset expiry on any request.
- **Seed dashboard:** See count of seed vs organic requests, seed vs organic taps. Track when organic overtakes seeded.

### Moderation
- **Review queue:** Flagged/reported requests, auto-blocked content, self-harm triggers.
- **Actions:** Approve, remove, edit, ban session_id.
- **Crisis view:** Requests containing self-harm keywords — review and add resource links.

### Analytics (simple)
- Total requests (seed/organic split)
- Total prayer taps (seed/organic split)
- Coverage rate (% of requests with 1+ prayer in 24h)
- Active users (sessions in last 7 days)
- Share count
- Answered prayer count

## 5 Public Screens + 1 Admin Screen

### Screen 1: Home (Prayer Queue)
- 5-10 cards max, no infinite scroll
- Each card: category tag, Prayer Points summary (1-2 lines), "View full request" link, time left, prayer count, "I prayed" button
- Prayer Points are the primary visible text on each card (not the raw post)
- "View full request" expands to show original poster text
- No avatars, usernames, likes, comments, trending tabs
- "Load more" button, not auto-load

### Screen 2: Post Prayer Request
- Text field (280-500 chars with counter)
- 7 category pills (one tap, required)
- Anonymous toggle (ON by default)
- Urgency toggle (normal/high)
- Consent checkbox
- Auto-block: phone numbers, emails, URLs, hate terms, sexual content
- **After submit → AI generates Prayer Points + Guided Prayer (single API call)**
- Poster sees approval screen: "Here are the Prayer Points others will see:" + editable bullet list + preview of Guided Prayer
- Poster can edit Prayer Points before publishing
- Approve → request goes live with both original text and Prayer Points

### Screen 3: Prayer Detail (share link target)
- Prayer Points displayed prominently at top
- Full original text visible below (or via "View full request" expand)
- Category, prayer count (animates after prayer), time remaining
- Large "I Prayed" button
- **Tapping "I Prayed" opens Guided Prayer overlay/bottom sheet** — user reads a short AI-generated prayer based on the Prayer Points, then taps "Done ✓" to confirm. Counter increments only after "Done." This is intentional friction — every tap is a real pause.
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
2. Show one seeded prayer card with Prayer Points → user taps "I prayed" → Guided Prayer overlay appears → user reads and taps "Done ✓"
3. "Need prayer too?" → post form
4. AI generates Prayer Points → poster approves
5. Confirm: "Your prayer is live."
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
- Admin can adjust counts up or down at any time

### Phasing out
- Seeds expire naturally through 48h mechanic
- Stop creating new seeds once organic requests exceed seeded ones
- Admin dashboard shows seed vs organic ratio
- Filter seeds from public analytics

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
- AI-generated bot REPLIES to prayers (comments, messages, theology lectures)
- AI replacing human prayer (the pray-er is always a real person)
- Social feed mechanics (likes, shares, trending)
- Church management features
- Content library or devotionals

## AI Layer: Prayer Points + Guided Prayer

### What AI does in this product
AI is an **editorial and enablement layer**, not a replacement for human prayer:
1. **Prayer Points** — summarizes the poster's raw text into clean bullet points (2-4 items) that make it easy for pray-ers to know exactly what to pray for
2. **Guided Prayer** — generates a short prayer (2-4 sentences) that pray-ers can read/recite when they tap "I Prayed"

### What AI does NOT do
- AI never replies to prayer requests (no bot comments, no theology lectures)
- AI never replaces the human pray-er (every "I Prayed" is a real person pausing to read and pray)
- AI content is never shown without poster approval (Prayer Points are editable before publish)

### Why this exists
- Real prayer wall language is often raw, rambling, stream-of-consciousness. Prayer Points normalize quality.
- 28% of Gen Z say their top spiritual need is "learning how to pray." Guided Prayer removes that friction.
- PrayerRequest.com's core complaint is bot replies that feel hollow. Our AI helps humans pray better — it doesn't pretend to pray for them.

### AI Provider
- **Primary: Gemini 2.0 Flash-Lite** ($0.075/M input tokens — essentially free at any realistic volume)
- **Fallback: DeepSeek V3.2** ($0.28/M input — still pennies, OpenAI-compatible API)
- Single Supabase Edge Function handles both Prayer Points + Guided Prayer in one API call
- Cost at 10K requests/month: ~$0.30. Cost at 50K: ~$1.50.

### AI Prompt Structure (single call, JSON output)
Input: raw prayer text + category
Output (JSON): { prayer_points: string[], guided_prayer: string }
- Prayer Points: 2-4 bullet points, plain language, no theology jargon, specific to the request
- Guided Prayer: 2-4 sentences, warm, simple, addresses God directly, references the specific needs, ends with Amen
- Tone: gentle, plainspoken, non-denominational, no "thee/thou," no performative language

### Poster Approval Flow
1. Poster writes raw text → submits
2. Edge Function calls Gemini → returns Prayer Points + Guided Prayer
3. Poster sees approval screen: Prayer Points (editable) + Guided Prayer preview
4. Poster taps "Looks good" → request goes live
5. If AI call fails → request publishes with raw text only, no Prayer Points (graceful fallback)

### Pray-er Flow (Option A — intentional friction)
1. Pray-er taps "I Prayed" on any card
2. Bottom sheet / overlay slides up with Guided Prayer text
3. Pray-er reads the prayer
4. Taps "Done ✓" → prayer count increments, confirmation shows
5. This pause is the product. Every tap is a real moment.

### Seed Content
- Seed requests should also include pre-generated prayer_points and guided_prayer fields
- Admin can manually edit these in /admin panel

## Full Reference Docs
For complete details on competitive landscape, monetization, personas, and strategy, see:
- prayer-app-FINAL-reference.md (1,095 lines, 32 sections)
- prayer-app-market-research-FINAL.md (698 lines, 19 sections)
