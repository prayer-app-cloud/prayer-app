# CLAUDE.md — Prayer App Build Reference (Post-Premium Build)

## WHO THIS IS FOR — READ THIS FIRST

**Christian moms, 28-42, in a hard season.**

This is the beachhead niche. Every product decision — copy, onboarding, seed content, visual tone, ad angles, category labels — is built for her first.

She is overwhelmed, emotionally isolated, carrying burdens she can't say out loud at church or in her friend group. She prays but doesn't know who to ask for prayer. She opens her phone at 11pm when the house is quiet and needs someone — anyone — to pray for her.

### How the niche shows up in the product
- **Seed content:** 60-70% mom-coded (marriage stress, parenting overwhelm, postpartum, kid struggles, financial pressure, mom guilt, isolation). 30-40% broader (grief, health, addiction, loneliness, job loss, faith doubt) so the app doesn't feel exclusionary.
- **Onboarding copy:** "A safe place for the prayers you carry alone" / "No names needed. No one will comment or reply. Just prayer."
- **Onboarding prayer:** Prefers inner_struggle and family categories — the prayers that feel most relatable to a mom in crisis.
- **Seed prayer examples:** "He doesn't know how bad it is" / "I raised my voice again" / "I don't enjoy being a mom right now" / "Everyone thinks I have it together" — raw, specific, first-person, sounds like a text at 11pm.
- **Visual tone:** Quiet, warm, private. Prayer journal, not social feed. Candlelight, not stage lighting.
- **Ad angles:** Awkwardness relief first ("Need prayer, but hate asking people you know?"). Mapped to channels where moms are (Instagram, Facebook groups, iMessage shares).

### The niche is the wedge, not the ceiling
The app works for anyone who prays. But marketing, content, and first impression are tuned for this one person. If she doesn't feel "this is for me" in 3 seconds, the product fails. Everyone else benefits from the warmth and restraint that comes from designing for her.

---

## What this is
Anonymous prayer exchange PWA. Post a prayer, strangers tap "I prayed," get notified, post updates. Includes follow/save, update/answered loop, notification inbox, prayer journal, answered timeline, reminders, and premium conversion layer. Phase 1 only. No blocker, no screen lock, no native app yet.

## One-line pitch
Post a prayer. Get prayed for.

## Stack
- Next.js 15 (App Router)
- Supabase (PostgreSQL + Auth + RLS)
- Vercel (hosting)
- Gemini 2.0 Flash-Lite via Next.js API route (Prayer Points + Guided Prayer generation)
- No Firebase. No ads SDK. No tracking pixels. No Facebook SDK. No location permissions.

## Non-negotiables
- Anonymous by default (session tokens, NOT device fingerprinting)
- No public profiles, no DMs, no comments
- No ads ever. No data selling ever.
- Requests expire in 48 hours unless updated
- No infinite scroll — "Load more" button, max 10 cards visible
- No public leaderboards, no XP, no badges, no streak monetization
- Self-harm language triggers resource display, not public posting
- Moderation from day one
- Zero-friction anonymous posting — no captcha, no signup wall

## 7 Categories (multi-select, 1-3 max)
health, family, grief, finances, inner_struggle, work, school, other

Categories stored as `category_enum[]` array type. Tappable pills on the post screen. NOT primary navigation. Feed shows all categories mixed.

## Database Schema

### prayer_requests
id (uuid PK), title (varchar nullable), text (varchar 500), category (category_enum[]), session_id (varchar), display_name_snapshot (varchar nullable), email (varchar nullable), prayer_points (text nullable — AI-generated), guided_prayer (text nullable — AI-generated), prayer_count (int default 0), share_count (int default 0), report_count (int default 0), status (enum: active/updated/answered/removed/expired), anonymous (bool default true), urgency (enum: normal/high), update_text (varchar 280 nullable), expires_at (timestamp), share_slug (varchar unique), is_seed (bool default false), created_at, updated_at

### prayer_taps
id (uuid PK), request_id (uuid FK), session_id (varchar), source (enum: community/screen_lock/seed), created_at
UNIQUE constraint on (request_id, session_id)

### prayer_follows
id (uuid PK), user_session_id (varchar), prayer_request_id (uuid FK), created_at
UNIQUE constraint on (user_session_id, prayer_request_id)

### updates
id (uuid PK), request_id (uuid FK), type (enum: update/answered), text (varchar 280), is_seed (bool default false), created_at

### prayer_journal_entries
id (uuid PK), session_id (varchar), request_id (uuid FK nullable), text (varchar 500), created_at
INDEX on session_id

### prayer_reminders
id (uuid PK), session_id (varchar UNIQUE), reminder_time (varchar), enabled (bool default true), created_at

### users
id (uuid PK), session_id (varchar), auth_method (enum: anonymous/email), email (varchar nullable), notification_enabled (bool default true), push_token (varchar nullable), trust_score (int default 100), strike_count (int default 0), is_admin (bool default false), created_at

### reports
id (uuid PK), request_id (uuid FK), reason (enum: spam/inappropriate/harmful/self_harm/other), reporter_session_id (varchar), created_at

### notifications
id (uuid PK), user_session_id (varchar), type (enum: prayer_received/request_answered/request_updated/expiry_warning/milestone), request_id (uuid FK), read (bool default false), created_at

## 3-Tab Architecture
Today (default) | Prayer Room | Me

### Today Tab (daily ritual destination)
Layout top to bottom:
- A. Header: "Today" + date + "You don't have to carry it alone today."
- B. Hero image (category illustration)
- C. "Your prayer" module: shows user's most recent active request with prayer count, "Share an update" and "Mark as answered" buttons. Falls back to "Need prayer?" CTA if no active request.
- D. "Pray for someone" module: one un-prayed prayer card (not featured, prefers fresh). Full guided prayer flow on tap. After praying: thank-you + verse + "Pray for another" button loads next card.
- E. "Followed prayers" module: up to 2 followed prayers. Shows status and prayer count. Only renders if user follows any.
- F. "Answered prayer" teaser: 1 recently answered community prayer with gold gradient treatment.
- No "coming soon" placeholders. Every module is functional.
- No premium surfaces on Today tab.

### Prayer Room Tab (public feed)
- Feed uses interleaved ordering: even positions (0,2,4,6,8) = newest; odd positions (1,3,5,7,9) = needs-prayer (lowest prayer_count). Load-more uses same logic.
- Each card: category tag, title/prayer points, time left, prayer count, "Pray" button, "Follow"/"Following" button with bookmark icon
- Answered prayers: gold accent border + "Answered" badge
- Updated prayers: stone left border + "Updated [time ago]"
- Featured prayer: weighted by prayer_count × (1 / hours_since_created), random from top 5 by score. Changes on each page load.
- "Need prayer?" text CTA above tab bar (replaced pencil FAB). Amber rounded-full style.
- "Load more" button, not auto-load

### Me Tab (personal prayer system)
Layout top to bottom:
- A. Display name + edit
- B. Stats row: 3 columns — Prayers lifted, Requests posted, Following. Serif numbers, soft labels.
- C. "My prayers" section: user's prayer requests with status indicators (active/updated/answered/expired). Tappable to detail.
- D. "Following" section: followed prayers with status badges.
- E. "Answered prayers you were part of": visual timeline with gold left-border accent, gold dots, category chips, answered text. First 3 free, then premium-gated.
- F. "Journal" section: private prayer journal entries in reverse chronological order. Compose button, 500 char textarea. Each entry shows text, date, linked prayer title if applicable. First 3 free, then premium-gated.
- G. "Go deeper" card: subtle premium CTA, only shows if user has 3+ journal or timeline entries AND meets engagement thresholds.
- H. Settings: daily prayer reminder toggle + time picker (free, not gated), notification toggle, about, reset onboarding (hidden behind devMode), delete data.
- No "coming soon" or locked teaser cards. Everything visible is functional.

## Prayer Detail Page (/r/[share_slug])
- Prayer points displayed prominently
- Full text below
- Category, prayer count (animates), time remaining
- "Pray" button → Guided Prayer overlay → "Done ✓" → journal note prompt → prayer count increments
- Follow/Following button
- Update timeline: chronological list of all updates, each with type, text, timestamp
- Owner actions (if session matches): "Share an update" + "Mark as answered" side-by-side. Hidden once answered.
- Share button, report button
- SSR with OG meta tags

## Follow/Save System
- Bookmark icon + "Follow"/"Following" text on feed cards and detail page
- After guided prayer completion: "Follow this prayer for updates" prompt (5-6 second dismissible)
- Server actions: followPrayer, unfollowPrayer, fetchFollowedPrayers, fetchFollowedRequestIds
- Events: prayer_followed, prayer_unfollowed

## Update/Answered Loop
- Owner buttons on detail page: "Share an update" / "Mark as answered"
- Updates table stores chronological history
- Submitting update/answered notifies all followers AND all pray-ers (deduplicated)
- Feed shows visual indicators for updated/answered status

## Notification Inbox
- Bell icon top-right of tab shell header. Red dot badge when unread > 0.
- Bottom sheet with notification list, newest first
- Notification types and copy:
  - prayer_received: "People are praying for your request: [title]" (aggregate-friendly)
  - request_answered: "A prayer you followed was answered: [title]"
  - request_updated: "Update on a prayer you're following: [title]"
  - expiry_warning: "Your prayer request expires in 12 hours"
  - milestone: "5/10/25 people have prayed for your request"
- Tap → marks read + navigates to detail
- "Mark all read" button
- Throttling: prayer_received uses 60-minute cooldown (not per-pray-er, time-based)
- Milestone notifications at prayer_count = 5, 10, 25
- Bell icon only renders after onboarding

## Prayer Journal
- Table: prayer_journal_entries
- Entry points: after guided prayer "Done" (inside sheet, before close), standalone compose in Me tab
- 500 char limit, optional link to prayer request
- First 3 entries free, then premium-gated
- Events: journal_entry_created

## Prayer Reminders (FREE, not gated)
- Table: prayer_reminders (session_id UNIQUE)
- Toggle + time picker in Me tab settings
- Upsert on session_id
- Saves preference only — actual push delivery is future backend task
- Events: reminder_preference_set, reminder_preference_changed

## Premium Conversion Layer

### Pricing config: src/lib/premium-config.ts
```
PREMIUM_CONFIG = {
  monthlyPriceCents: 399,
  yearlyPriceCents: 2999,
  currency: "USD",
  trialEnabled: true,
  trialLengthDays: 7,
  freeJournalEntries: 3,
  freeTimelineEntries: 3,
  engagementThresholds: { minPrayers: 5, minPosts: 2, minSessions: 3 }
}
```
All UI reads prices via formatPrice(). No dollar amounts hardcoded in components.

### Premium state
- localStorage key: "premiumActive" (boolean)
- Toggleable via ?premium=true URL param or admin panel
- Future: RevenueCat integration

### Premium trigger logic
- ONLY triggers when user hits entry #4 on journal or answered timeline
- Requires engagement: 5+ prayers OR 2+ posted, AND 3+ sessions
- 7-day cooldown after dismissal (premiumDismissedAt ISO date in localStorage)
- If engagement not met but user hits entry #4: soft message "More journal and answered history unlock after a few more sessions" — no paywall, no pricing

### Premium bottom sheet
- Header: "Your prayer life is growing"
- Stats: "You've prayed for X people · Y prayers followed · Z answered"
- 2 feature cards: "Prayer Journal — Save prayers and private reflections" / "Answered Timeline — Revisit the prayers that changed"
- Reminders NOT listed (reminders are free)
- Extended Requests NOT listed (feels like pay-for-visibility)
- Primary: "Get early access" → toast "You're on the list — we'll let you know when it's ready"
- Secondary: "Maybe later" → sets premiumDismissedAt
- Style: warm cream, amber accent, serif header. Invitation, not sales popup.

### What is gated vs free
PREMIUM (gated): Journal entries beyond 3, answered timeline entries beyond 3
FREE (never gated): Posting, praying, following, notifications, Today tab, Prayer Room, reminders, first 3 journal entries, first 3 timeline entries

## Onboarding Flow (5 screens)
1. Headline + subhead: "A safe place for the prayers you carry alone" / "No names needed. No one will comment or reply. Just prayer."
2. One seeded prayer card → user taps "Pray" → Guided Prayer overlay → "Done ✓"
3. "Need prayer too?" → post form
4. AI generates Prayer Points → poster approves
5. "Your prayer is live." → lands on Today tab
- Onboarding prayer selection: mid-range count (8-18), must have guided_prayer, prefers inner_struggle/family categories

## Social Proof Engine
- Featured prayer: score = prayer_count / hours_since_created, random from top 5
- Feed interleaving: newest at even positions, needs-prayer at odd positions
- Seed timestamp staggering: evening bias (7pm-11pm weighted), 3am-6am suppressed
- Seed prayer counts distributed: 0-2 (just posted), 3-8 (traction), 9-18 (proof), 19-25 (high proof)
- 222 seed prayers total, 23 with answered updates
- expires_at = created_at + 48 hours (corrected from earlier bug)

## Seeding System
- POST /api/seed?key=prayer-seed-2026 — uses service role key to bypass RLS
- Clears old seeds, inserts 222 new ones, runs AI generation on each
- Seed route uses @supabase/supabase-js directly with SUPABASE_SERVICE_ROLE_KEY (not the anon client)
- **Seed content is niche-first:** 60-70% mom-coded (marriage, parenting, postpartum, kid struggles, mom guilt, isolation, finances as a family). 30-40% broader (grief, health, addiction, loneliness, job loss, faith)
- Every seed must sound like a real text at 11pm — raw, specific, 1-3 sentences, first-person. NOT devotional copy. NOT polished. Grammar errors are fine.
- AI generation calls /api/generate-prayer for each seed

## AI Layer: Prayer Points + Guided Prayer
- See gemini-prayer-prompt.md for full prompt spec
- Provider: Gemini 2.0 Flash-Lite (primary). Cost: ~$0.01 for full seed run.
- API route: /api/generate-prayer
- Graceful fallback: if AI fails, prayer publishes with raw text only
- Guided prayer sheet: after "Done", shows journal note prompt inside sheet. onDone() deferred until save/skip.

## Session Management
- sessionCount incremented ONLY in providers.tsx (once per app open)
- Me tab and other components only READ sessionCount, never write
- This is critical for premium trigger accuracy

## Event Logging
All logged via logEvent():
- pray_tapped, prayer_followed, prayer_unfollowed
- update_posted, marked_answered
- inbox_opened
- journal_entry_created
- reminder_preference_set, reminder_preference_changed
- premium_preview_seen, premium_preview_tapped, premium_dismissed

## Admin Panel (/admin, password-protected)
- Seed management: generate, bulk import, set counts, add answered updates
- Moderation: review queue, actions, crisis view
- Analytics: seed vs organic split, coverage rate, active users

## Key Files
- src/lib/premium-config.ts — pricing, thresholds, free limits
- src/components/tab-shell.tsx — 3-tab architecture, bell icon, ?premium=true handler
- src/components/today-tab.tsx — daily ritual destination
- src/components/prayer-room-tab.tsx — feed with interleaving, follow, text CTA
- src/components/me-tab.tsx — personal prayer system with journal, timeline, reminders, premium gates
- src/components/guided-prayer-sheet.tsx — guided prayer + journal note prompt
- src/components/notification-inbox.tsx — in-app notification inbox
- src/components/premium-sheet.tsx — premium bottom sheet
- src/app/actions.ts — all server actions
- src/app/api/seed/route.ts — seed endpoint (service role key)
- src/app/api/generate-prayer/route.ts — AI generation endpoint

## Supabase Details
- Project ref: hucznektbzklptcvxrhl
- URL: https://hucznektbzklptcvxrhl.supabase.co
- 7 migration files total (5 original + 2 from premium build)
- RLS policies on all tables
- Anonymous auth via middleware calling signInAnonymously() on no-session

## Visual Direction
- Warm, not cold. Cream/off-white backgrounds, soft amber/gold accents
- Generous spacing, rounded cards, no sharp edges
- Serif headers, soft labels
- Answered prayers: warm gold gradient treatment
- Updated prayers: stone left border
- This should feel like a quiet room with a candle, not a social feed
- Think: what a 34-year-old exhausted mom would trust at 11pm on her phone. Not church software. Not Instagram. Not a wellness app. A quiet, safe place.

## Copy Rules
- Short sentences, everyday words, present tense
- "People are praying for your request" NOT "Someone prayed"
- "Need prayer?" NOT "Submit your prayer request"
- "Follow" / "Following" everywhere (not "Save" / "Bookmark")
- Copy should sound like what a friend texts, not what a church bulletin says
- Seed prayers should sound like a real text from a real mom at 11pm — not devotional copy
- Never say: "join the community," "engage with believers," "unlock breakthrough," "top prayers this week," "moms helping moms" (niche should feel natural, not labeled)

## What NOT to Build
- Comments or replies on prayers
- Public user profiles
- Category-based browsing/tabs
- Public leaderboards or prayer rankings
- AI-generated bot REPLIES to prayers
- Social feed mechanics (likes, shares, trending)
- Church management features
- Content library or devotionals
- Circles (deferred to later phase)
- Audio prayers (deferred)
- Email auth (deferred)

## Full Reference Docs
- prayer-app-FINAL-reference.md — strategy, competitive landscape, monetization, personas
- prayer-app-market-research-FINAL.md — market research, user language, onboarding
- apk-teardown-report.md — APK analysis of 11 competitor apps
- gemini-prayer-prompt.md — AI prompt spec for Prayer Points + Guided Prayer
- creative-brief.md / creative-brief-evidence-backed.md — marketing briefs
