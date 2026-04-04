# Prayer App — Final Master Reference

_Last updated: 2026-04-03_
_Merged from parallel analysis tracks. Confidence levels noted where applicable._

---

## 1. Executive summary

### The short version

There are two viable but very different products in this space:

1. A quiet, anonymous prayer exchange (consumer web app)
2. A prayer-based app blocker / intervention product (native app)

The prayer app is easier to validate, cheaper to ship, and creates the core content supply: real prayer requests from real people.

The blocker app has the better long-term business shape because the pain is immediate, usage is daily (multiple times per day), the subscription model is more natural, and retention is structurally stronger.

### The strongest combined thesis

- **Phase 1:** Build a lightweight prayer-request web app to prove people will post, strangers will pray, and the emotional loop works.
- **Phase 2:** Build a native blocker that uses those real prayer requests as the interruption mechanic.

The wedge is NOT "pray before unlock." That's taken.
The wedge IS: **"Pause and pray for a real person before opening your distraction app."**

### Most important conclusions

- Broad "Christian Reddit" is a bad idea.
- Generic "pray to unlock" is already crowded (10+ apps).
- The strongest product shape is quiet, anonymous, privacy-first, minimal, and emotionally real.
- The strongest business architecture is community/database first, blocker second.
- Tech stack is not the moat. Positioning, restraint, and loop design are the moat.
- Your moat is real human prayer supply + restraint + trust.

### Best single-sentence strategic summary

> Build the prayer-request system first so the blocker can eventually interrupt distraction with a real human need instead of a generic prompt.

### Best product principle

> This must feel like prayer, not content.

### Best business principle

> Monetize the utility around prayer and the habit around intervention — never the prayer itself.

---

## 2. Product definition

## 2.1 Core prayer product (Phase 1)

**One-line pitch:** Anonymous prayer support for strangers, in under 30 seconds.

**What it is:** A quiet, privacy-first prayer exchange where anyone can post an anonymous need, strangers pray for them, and the loop closes with an answered prayer update.

**What it feels like:** A prayer room, not a social feed.

**What it is NOT:**
- Not a Christian social network
- Not Christian Reddit
- Not a devotional content app
- Not a debate platform
- Not a church management product
- Not an AI prayer generator

**Core loop:**
Post request → strangers tap "I prayed" → user gets notified → user posts update / answered prayer → user shares link → new users enter via link

## 2.2 Core blocker product (Phase 2 — conditional)

**One-line pitch:** Pause and pray for a real person before opening your distraction app.

**What it is:** A native app blocker that interrupts selected apps and shows a real prayer request from the live prayer database instead of a generic prompt or AI prayer.

**What it solves:**
- Compulsive checking
- Dopamine loops
- Meaningless unlock friction
- Repetitive generic blocker prompts
- Stale prewritten spiritual gates

**What makes it different:** It turns the unlock moment into an act of service, not just self-control.

---

## 3. Non-negotiables

- Anonymous by default — no real names required
- No profiles, no following, no DMs, no comments
- No ads, ever
- No data selling, ever
- No politics, no debates
- Prayer requests expire in 48 hours unless updated
- Answered prayer update is the hero moment
- Every request has a shareable external link
- Strong moderation and reporting from day one
- Self-harm/crisis content triggers resource display, not public feed
- Kill the project if core loop metrics are weak by day 45

---

## 4. Product architecture

## 4.1 Why community-first, blocker-second

If you build blocker-first, you still need one of these:
- AI-generated prayers
- Prewritten prayers
- Static verses/prompts
- Your own editorial content library

That puts you back into a crowded template.

If you build community first, the blocker can show:
- Real requests from real people
- Fresh requests (never repetitive)
- Meaningful requests
- Answered prayer updates

That becomes much harder to copy.

## 4.2 System map

The prayer database is shared infrastructure powering:

1. **Public prayer web app** (Phase 1) — generates request supply, validates emotional loop, creates shareable moments
2. **Native blocker app** (Phase 2) — monetizes frequency, creates daily prayer volume, becomes habit engine
3. **Private circles** (Phase 3) — highest ARPU path, more intimate use case, better paid utility layer

## 4.3 Phase 2 prerequisites

Only build the blocker after:
1. Phase 1 community is live and generating 100+ real prayer requests per week
2. Manual validation: 20 beta users pray for one stranger before opening Instagram each morning for 7 days
3. If >70% find it meaningful → proceed
4. If >50% find it annoying/transactional → kill Phase 2 or redesign

## 4.4 Phase 2 risks

- **Toll booth risk:** People may tap "I prayed" mindlessly to unlock, inflating counts with meaningless taps
- **Emotional mismatch:** Someone trying to get to TikTok is in a different headspace than someone posting a vulnerable prayer
- **Christian Focus app** already has a Prayer Wall + Prayer Gate combination — so this isn't absolute white space
- **iOS constraints:** Apple's ShieldActionDelegate has no documented "open parent app" response, making the UX clunkier than Android
- **Android policy risk:** Google Play restricts accessibility-based interaction without explicit user consent

---

## 5. Why a feed is risky

A feed helps discovery, but it becomes dangerous if the product starts optimizing for dwell time.

### Good version
- Limited queue (5-10 visible items)
- "Load more" button, not infinite scroll
- Sorted by newest or "needs prayer now"
- Every card moves toward one action: pray

### Bad version
- Feed optimized for session length
- Algorithmic ranking
- Trending tabs
- Social reactions
- Content consumption for its own sake

### Rule
> Every screen should help someone ask for prayer, offer prayer, or close the loop — not browse.

---

## 6. Competitive landscape

## 6.1 Market truth

You do NOT have clean white space. You do have a possible wedge.

**What is crowded:**
- Guided prayer/content (Hallow, Pray.com)
- Generic Christian community (PrayerNet, Prayer Social, ActsSocial)
- Social prayer / group prayer apps
- Generic pray-to-unlock blockers (10+ apps)

**What appears less occupied:**
- Real human prayer request as unlock mechanic
- Anonymous, minimal, no-noise prayer exchange
- Blocker + live prayer supply sharing one backend

## 6.2 Lane A — prayer media/content giants

**Hallow** — 10M+ downloads, $50M+ raised, $9.99/month or $69.99/year
- Premium prayer/content/routine app. 10,000+ guided sessions.
- Uses Helium AI paywall (not RevenueCat) + Stripe for payments.
- No ads — clean premium-only model. Gold standard for prayer app monetization.
- Not a direct competitor but dominates "prayer app" mindshare.

**Pray.com** — 18M+ downloads, $34M raised, $59.99/year premium
- Broad faith media/community platform.
- APK confirms: Stripe + Sendbird chat + Braze engagement + Facebook SDK + ACCESS_FINE_LOCATION.
- Privacy scandal: BuzzFeed investigation revealed data mining of prayers, supplementing with broker data (ethnicity, political affiliation, income).
- March 2026 user reviews complain about ads interrupting prayer.
- Teaches: what NOT to do with privacy. Our "no tracking" promise is real differentiation.

## 6.3 Lane B — prayer utility / habit apps

**PrayerMate** — 100K+ downloads
- Calm prayer organizer with index-card model, reminders, categories.
- Best reference for restraint and non-social prayer UX.
- Teaches: prayer UX doesn't need to become social.

**Echo Prayer**
- Prayer tracking + group utility + reminders.
- User reviews complain about subscription model — prefer one-time purchase.
- Teaches: subscription fatigue is real in this category.

## 6.4 Lane C — prayer social / community apps

**PrayerNet** — 10K+ downloads
- Groups, requests, messaging, comments, likes, DMs, Bible study.
- Uses OneSignal + Google Gemini AI + Twitter/Facebook SDK.
- Reviews complain about users sending "demonic" messages with no block button.
- Teaches: this is a WARNING benchmark, not a template. Feature sprawl + weak moderation.

**Prayer Social** — 10K+ downloads
- Prayer with social/community dynamics. Flutter + full Firebase stack.
- Teaches: the market has already tried turning prayer into social interaction.

**ActsSocial**
- Christian social media platform trying to be everything — prayer, church finder, events, dating adjacent.
- Teaches: jack of all trades risks.

## 6.5 Lane D — prayer request / anonymous apps

**Pray4Me (com.liaxo.prayforme)** — 100+ downloads (launched Jan 2026)
- Closest direct competitor. Anonymous requests, no friends lists, no endless scrolling, prayer streaks.
- Free, no subscription. Small but sharp.
- Teaches: validates our concept but shows the market is still early.

**Pray4U (com.communitysm.pray4u)**
- Flutter + Firebase + RevenueCat (confirmed, with Amazon billing). Cleanest RevenueCat implementation.
- Teaches: how to implement RevenueCat in a Flutter prayer app.

## 6.6 Lane E — blocker / intervention apps

**Prayer Lock** — 73K+ users, subscription-only
- Faith-specific app blocker with AI-generated prayer gate.
- Uses Superwall for paywalls. FOREGROUND_SERVICE_DATA_SYNC + BIND_ACCESSIBILITY_SERVICE + SYSTEM_ALERT_WINDOW.
- Key class names: AppBlockingService, PrayerOverlayService, ShieldOverlayService.
- No push notifications — blocking mechanic IS the engagement.
- Teaches: the Android blocker pattern. The niche is real and monetizable.

**Pushscroll** — 100K+ downloads
- Most mature blocker benchmark. Uses Kotlin Multiplatform/Compose (not standard Flutter).
- PACKAGE_USAGE_STATS + SYSTEM_ALERT_WINDOW + REQUEST_IGNORE_BATTERY_OPTIMIZATIONS.
- RevenueCat + Superwall + OneSignal + Sentry.
- Teaches: what a polished blocker business looks like — subscription testing, notification loops, crash monitoring, OS reliability.

**Holy Focus, Bible Mode, Pray Focus, PrayLock, PrayGuard, God before Apps**
- Additional prayer lock variants on iOS and Android. All use AI/prewritten prayers, not real human requests.

**QUITTR**
- Ad-supported only (AdMob). No subscription, no billing.
- Teaches: ad-only model exists but is wrong for prayer context.

**Christian Focus (com.christianfocus)**
- Has Prayer Wall + Prayer Gate — closest to our Phase 2 concept already.
- Worth watching as potential direct Phase 2 competitor.

## 6.7 Lane F — church infrastructure (prayer walls in church software)

**Tithely** — flat-rate bundles, prayer wall is a small feature in a big platform.
**Pushpay** — $199/month full package, too expensive/bloated for small churches.

---

## 7. APK teardown summary

11 apps analyzed (April 2, 2026). Full detail in apk-teardown-report.md.

### Headline findings

1. 10 of 11 apps use standard Flutter + Firebase. Pushscroll uses Kotlin Multiplatform/Compose.
2. Hallow uses **Helium** AI paywall + **Stripe** (likely web checkout to reduce platform fees — inference from Android APK, not confirmed iOS behavior).
3. Pray.com has **Stripe** + **Sendbird** + **Braze** + **Facebook SDK** + **ACCESS_FINE_LOCATION** — confirms privacy scandal at code level.
4. Prayer Lock: **Superwall** + **BIND_ACCESSIBILITY_SERVICE** + **SYSTEM_ALERT_WINDOW** + **FOREGROUND_SERVICE_DATA_SYNC**. Class names: AppBlockingService, PrayerOverlayService, ShieldOverlayService.
5. Pray4U: **RevenueCat** with Amazon billing — cleanest subscription implementation.
6. Prayer Net: **Google Gemini** AI + **OneSignal** + Twitter/Facebook — most bloated.
7. QUITTR: **AdMob** only — no subscription. Wrong model for prayer.
8. Pushscroll: **PACKAGE_USAGE_STATS** + **SYSTEM_ALERT_WINDOW** + **REQUEST_IGNORE_BATTERY_OPTIMIZATIONS** + **Superwall** + **RevenueCat** + **OneSignal** + **Sentry**.
9. No competitor in these 11 apps uses Supabase — all Firebase. (Scoped to prayer/lock niche, not broader market.)
10. Three paywall tiers: custom billing (small), RevenueCat (mid — Pray4U), Superwall/Helium (top — Prayer Lock, Pushscroll, Hallow).

### Android screen lock implementation pattern (from Prayer Lock)
1. Accessibility service watches app opens (BIND_ACCESSIBILITY_SERVICE)
2. Overlay/shield appears (SYSTEM_ALERT_WINDOW → PrayerOverlayService / ShieldOverlayService)
3. User completes prayer action
4. App proceeds (AppBlockingService releases)
5. Monetized via subscription (Superwall paywall)

---

## 8. Tech stack

## 8.1 Phase 1 — web-first prayer community

**Stack:** Next.js 15 (App Router) + Supabase + Vercel + FCM (via Edge Functions)

**Why web-first:**
- Faster to ship (30-50% faster than native)
- No App Store review bottleneck (30% first-submission rejection rate)
- PWA installable to home screen
- Server-side rendering for share link pages (critical for OG meta tags)
- Deep-link/share works naturally on web

**Why Supabase over Firebase:**
- PostgreSQL — relational model fits prayer requests (foreign keys, joins, RLS)
- Real-time subscriptions for prayer count updates
- Row Level Security for anonymous users
- At production scale, 40-60% cheaper than Firebase
- No vendor lock-in — standard PostgreSQL, fully portable
- Free tier generous enough for MVP validation

**Notifications:** Supabase Edge Functions + Firebase Cloud Messaging
**Hosting:** Vercel (free tier)
**Analytics:** Mixpanel or PostHog (free tier)
**Email:** Resend (for email notifications if no push)

**Estimated cost (MVP):**

| Item | Cost |
|------|------|
| Supabase (free tier) | $0 |
| Vercel (free tier) | $0 |
| Domain name | $12-15/year |
| Firebase Cloud Messaging | $0 |
| Analytics (free tier) | $0 |
| Cursor AI (if coding yourself) | $20/month |
| **Total for 45 days** | **~$35-55** |

If hiring a freelance developer: $3,000-8,000 for the full MVP.

## 8.2 Phase 2 — native blocker (if validated)

**Stack:** Flutter + Superwall + RevenueCat + Supabase API

**Why Flutter:** 10 of 11 competitor apps use Flutter. Dominant framework in this niche.
**Paywall:** Superwall (Prayer Lock uses it at 73K+ users). Start with RevenueCat, graduate to Superwall if conversion optimization matters.
**Key Android permissions:** FOREGROUND_SERVICE_DATA_SYNC, BIND_ACCESSIBILITY_SERVICE, SYSTEM_ALERT_WINDOW, PACKAGE_USAGE_STATS, POST_NOTIFICATIONS
**iOS:** Family Controls entitlement required. UX more constrained than Android.
**Push:** Optional (Prayer Lock has 73K users without push notifications).

## 8.3 Design the schema for public API from day 1

Screen lock app needs to query prayer requests efficiently. Include in Phase 1 schema:
- API endpoint for "get random active prayer request" (lightweight, fast)
- Rate limiting per device
- Flag field on PrayerTap to distinguish community taps from screen-lock taps

---

## 9. Phase 1 screens (5 screens)

### Screen 1: Home (Prayer Queue)

**Purpose:** See active prayer requests without feeling like social media.

**Show:**
- 5-10 active requests max on screen
- Short text preview
- Category tag
- Time left before expiry (48h default)
- Prayer count
- "I prayed" button
- "Open" button to see full detail

**Do NOT show:**
- Likes, comments, usernames, follower counts
- "Trending" or algorithmic sorting
- Endless scroll (use "Load more" button)
- Avatars or profile pictures

**Design:** Warm, quiet, generous whitespace. Feels like a prayer room, not a feed.

### Screen 2: Post Prayer Request

**Fields:**
- Prayer text (280-500 chars, visible counter)
- Category prompt: "What kind of prayer do you need?" — 7 tappable pills:
  - **Health** (illness, surgery, recovery, diagnosis, pregnancy)
  - **Family** (children, parents, marriage, parenting)
  - **Grief** (loss, mourning, death of loved one)
  - **Finances** (job loss, bills, debt, housing, provision)
  - **Inner struggle** (anxiety, depression, addiction, temptation, fear, doubt, loneliness)
  - **Work & school** (exams, interviews, career, bosses, studies)
  - **Other** (guidance, gratitude, relationships, anything else)
- Anonymous toggle (defaulted ON)
- Urgency toggle (normal/high)
- Consent checkbox: "I confirm no private identifying info"

**Category UX rules:**
- One tap, pre-selected = none, required but effortless
- Categories are for posting structure and optional filtering, NOT primary navigation
- Home queue shows all categories mixed together by default
- Do NOT create category tabs or subreddit-style browsing
- "Inner struggle" not "mental health" — more spiritual, less clinical

**Rules:**
- No names unless explicit consent
- No phone numbers, email, addresses
- No politics
- No debate/opinion posts disguised as prayer
- Auto-block: phone numbers, emails, URLs, hate terms, sexual content, fundraising

### Screen 3: Prayer Detail (share link target)

**Show:**
- Full prayer text
- Category tag
- Prayer count (with subtle animation on tap)
- Time remaining
- "I prayed" button (large, prominent)
- "Share request" button → native share sheet
- "Report" button
- "Post update" button (only for original poster)

**This is the growth-critical page.** It must work perfectly as a standalone page from iMessage, WhatsApp, or Instagram stories. Server-side rendered with proper OG meta tags.

### Screen 4: Update / Answered Prayer

**Poster can:**
- Mark as "update" (still needs prayer)
- Mark as "answered"
- Add short note (280 chars)

**This is the retention + sharing engine.** Answered prayers are the most emotionally powerful content and the most shareable.

### Screen 5: Notifications

**User sees:**
- "12 people prayed for your request"
- "Someone shared your request"
- "Your request expires in 12 hours"
- "Post an update?"
- "A prayer you prayed for was answered!"

**Bring users back for meaningful reasons, not generic reminders.**

Settings/about accessible from this screen: privacy promise, support link, data deletion, reporting.

---

## 10. Data model

### Important identity note

Do NOT use device fingerprinting as the core identity model. It's brittle (changes with OS updates, reinstalls, privacy settings).

**Prefer:**
- Anonymous session token (generated on first launch)
- Optional email for notifications
- Push token for FCM

### prayer_requests
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| text | varchar(500) | The prayer request |
| category | enum | health, family, grief, finances, inner_struggle, work_school, other |
| session_id | varchar | Anonymous session token |
| email | varchar (nullable) | Optional, for notifications only |
| prayer_count | integer | Default 0 |
| share_count | integer | Default 0 |
| report_count | integer | Default 0 |
| status | enum | active, updated, answered, removed, expired |
| anonymous | boolean | Default true |
| urgency | enum | normal, high |
| update_text | varchar(280) | Nullable — filled when answered |
| expires_at | timestamp | Created_at + 48 hours |
| share_slug | varchar | Short unique string for share URLs |
| is_seed | boolean | Default false. Admin-created seed content. Filter from analytics. |
| created_at | timestamp | |
| updated_at | timestamp | |

### prayer_taps
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| request_id | uuid | FK → prayer_requests |
| session_id | varchar | Who prayed |
| source | enum | community, screen_lock, seed | Distinguish tap origin. Seed = admin-created. |
| created_at | timestamp | |

UNIQUE constraint on (request_id, session_id) — one prayer per person per request.

### updates
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| request_id | uuid | FK → prayer_requests |
| type | enum | update, answered |
| text | varchar(280) | |
| is_seed | boolean | Default false |
| created_at | timestamp | |

### users
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| session_id | varchar | Anonymous session token |
| auth_method | enum | anonymous, email |
| email | varchar (nullable) | |
| notification_enabled | boolean | Default true |
| push_token | varchar (nullable) | FCM token |
| trust_score | integer | Default 100 |
| strike_count | integer | Default 0 |
| is_admin | boolean | Default false |
| created_at | timestamp | |

### reports
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| request_id | uuid | FK → prayer_requests |
| reason | enum | spam, inappropriate, harmful, self_harm, other |
| reporter_session_id | varchar | |
| created_at | timestamp | |

### notifications
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| user_session_id | varchar | |
| type | enum | prayer_received, request_answered, expiry_warning, milestone |
| request_id | uuid | FK → prayer_requests |
| read | boolean | Default false |
| created_at | timestamp | |

---

## 11. Event tracking

### Acquisition events
- landing_page_view
- waitlist_signup
- app_open
- request_link_open (from share)
- install_to_first_action

### Core behavior events
- prayer_request_created
- prayer_request_viewed
- prayed_tapped
- notification_received
- notification_opened
- update_created
- answered_marked
- request_shared
- report_submitted

---

## 12. Moderation rules

### Auto-block (day one)
- Phone numbers, email addresses, URLs
- Hate terms, slurs
- Sexual content
- Fundraising/solicitation asks
- Medical emergency directives

### Manual review queue
- Self-harm language → hide from public, show crisis/support resources
- Violence references
- Child safety concerns
- Harassment
- Spam / repeated low-quality posts

### Community rules (displayed in-app)
1. Keep requests focused on prayer
2. No politics, debates, or arguments
3. No identifying information
4. No solicitation or fundraising
5. Treat every request with respect

---

## 13. Share link / Open Graph spec

**URL format:** `[domain]/r/[share_slug]`

**Link preview in iMessage/WhatsApp/social:**
- Title: "Someone needs prayer"
- Description: "[Category] — [First ~60 chars of request]..."
- Image: Simple warm branded card (auto-generated)

Must render server-side with proper OG meta tags. Must work in dark and light mode.
CTA: "Tap to pray"

---

## 14. Monetization

## 14.1 Non-negotiable trust boundary

**Never charge for:**
- Posting a prayer request
- Praying for someone
- Receiving a prayer count notification
- Getting notified that someone prayed
- Reading answered prayer updates
- Basic app functionality

**Never do:**
- Ads between prayer moments
- Data selling
- Pay-for-visibility prayer ranking
- Pay-to-pray mechanics

## 14.2 Layer 1 — Supporter donations (Month 3)

Earliest, easiest, least intrusive.

- Simple "Support this app" button
- Voluntary, no status attached
- Expected: $150-500/month at 5K users

## 14.3 Layer 2 — Premium utility subscription (Month 4-6)

Main realistic paid layer for the prayer app.

**Price:** $3.99/month or $29.99/year
**Use RevenueCat** for subscription management (cleanest Flutter implementation seen in Pray4U teardown).

**Premium features:**
- Prayer journal — save every prayer you've prayed for
- Answered-prayer timeline — personal history of prayers answered
- Extended request duration (7 days instead of 48 hours)
- Prayer reminders (daily nudge to pray for someone)
- Request history (past requests and outcomes)
- Custom categories
- Notification controls (digest vs real-time)

**Why $3.99 not higher:** Hallow charges $9.99/month but has thousands of hours of produced audio content. Our utility features don't justify the same price. Lower prices convert better (47.8% trial-to-paid vs 28.4% for high-priced — RevenueCat 2025 data).

**Revenue projections:**

| Users | Conversion (2-4%) | Monthly Revenue |
|-------|-------------------|----------------|
| 1,000 | 2-3% | $80-120 |
| 5,000 | 2-3% | $400-600 |
| 10,000 | 3% | $1,200 |
| 25,000 | 3-4% | $3,000-4,000 |
| 50,000 | 3-4% | $6,000-8,000 |

Conversion benchmark: median freemium is 2.18% (RevenueCat 2026). 3-5% is GOOD for consumer freemium.

## 14.4 Layer 3 — Private circles (Month 6-9)

Highest ARPU product extension.

**Price:** $9.99/month for circle creator, members join free.

**Features:**
- Invite-only prayer groups
- Non-anonymous within circle (trust-based)
- Group prayer activity dashboard
- Leader tools (moderate, invite, remove)

**Revenue:** 2% of user base creates circles. At 50K users = $10,000/month.

## 14.5 Layer 4 — Blocker subscription (Phase 2, if validated)

**Price:** $4.99-6.99/month

- Free: block 1 app, basic prayer prompts
- Premium: unlimited blocked apps, scheduling, streaks, urge analytics
- Prayer requests always come from the free community — never gated

## 14.6 Combined projection at 50K users (month 12-18)

| Layer | Revenue/Month |
|-------|--------------|
| Supporter donations | $500-750 |
| Premium subscriptions | $6,000-8,000 |
| Private circles | $5,000-10,000 |
| **Total** | **$11,500-18,750/month** |
| **Annual** | **$138K-225K/year** |

## 14.7 Business reality

The consumer prayer app alone is unlikely to become meaningfully profitable fast. The blocker app has the clearer subscription logic. This is why the two-product system is stronger: prayer product = trust + request supply, blocker product = frequency + monetization.

---

## 15. Success metrics

## 15.1 What matters (loop completion, not vanity)

| Metric | What it measures | Target |
|--------|-----------------|--------|
| Post rate | % of visitors who post a request | >5% |
| Pray rate | % of visitors who tap "I prayed" | >30% |
| Coverage | % of requests getting ≥5 prayers in 24h | >80% |
| Return rate | % of posters returning within 48h | >35% |
| Reciprocity | % of returners who pray for someone else | >25% |
| Answer rate | % of posters who post update or mark answered | >10% |
| Share rate | % of requests where share link is used | >10% |

## 15.2 Green signals
- Most requests receive prayer quickly
- Posters return soon after notifications
- A meaningful share percentage exists
- Answered updates appear naturally

## 15.3 Red signals (kill criteria)
- Fewer than 50% of requests get any prayer within 24h → feed is dead
- Fewer than 25% of posters come back within 48h → no habit
- Fewer than 15% of returning users pray for others → no reciprocity
- External share rate under 5% → no growth engine
- Moderation burden too high for the experience to feel safe

## 15.4 The goal is NOT
- High session length
- Vanity signup count
- Passive browsing

## 15.5 The goal IS
- Loop completion
- Emotional relevance
- Repeated meaningful use

---

## 16. Build timeline (45 days)

### Phase 1: Validate (Days 1-7)
- Pick name and positioning
- Build landing page
- Create mockups / screenshots
- Post content on TikTok, IG, Reddit, Christian Facebook groups
- Collect waitlist signups

### Phase 2: Build (Days 7-28)

**Week 1 (Days 7-14):**
- Day 7-8: Project setup — Next.js, Supabase, Vercel deploy pipeline
- Day 9-10: Database schema, Row Level Security, anonymous auth flow
- Day 11-12: Prayer request creation (Screen 2) + queue display (Screen 1)
- Day 13-14: "I prayed" action with real-time count update

**Week 2 (Days 15-21):**
- Day 15-16: Share link page with OG meta tags (Screen 3)
- Day 17-18: Answered prayer flow — update, answered badge, answered feed
- Day 19-20: Notification system — database triggers + Edge Functions + FCM
- Day 21: 48-hour expiry cron job via Supabase scheduled functions

**Week 3 (Days 22-28):**
- Day 22-23: Moderation — report button, auto-flag on keywords, admin review queue
- Day 24-25: PWA manifest, home screen install prompt, offline fallback
- Day 26-27: Visual polish — animations, transitions, typography, color refinement
- Day 28: Load testing, bug fixes, edge cases

### Phase 3: Seed and Launch (Days 29-37)
- Day 29-30: Seed 150-250 prayer requests across all categories + 20-30 answered updates
- Day 31-32: Invite first 50 waitlist users, monitor behavior
- Day 33-35: Invite remaining waitlist in batches of 50/day
- Day 36-37: Fix issues, respond to feedback, adjust based on real usage

### Phase 4: Measure and Decide (Days 38-45)
- Track all core metrics daily
- Go / pivot / kill decision

---

## 17. Seeding plan and admin controls

### Pre-launch seed content

Generate 200+ seed requests using AI, modeled on real prayer wall language (short, raw, specific, 1-3 sentences). Distribute:
- Health: 25%
- Family: 20%
- Inner struggle: 20%
- Finances: 10%
- Grief: 10%
- Work & school: 10%
- Other: 5%

Also seed 20-30 answered prayer updates.
Write them short and human. No melodrama. No fake miracle bait.
All seeded content marked `is_seed = true`.

### Admin prayer count controls

Admin can set prayer_count directly on any request via the /admin panel. For seed requests, set to realistic range (3-25). Admin can create seed prayer_taps with `source = seed` for data consistency. Admin can adjust counts up or down at any time on any request.

### Phasing out seeds

Seeds expire naturally through 48-hour mechanic. Stop creating new seeds once organic requests exceed seeded ones. Admin dashboard shows seed vs organic ratio in real time. Filter seeds from public-facing analytics.

### Admin panel (/admin, password-protected)

**Seed management:**
- Create individual seed requests (text, category, prayer_count, created_at)
- Bulk import from CSV/JSON with staggered timestamps
- Set/adjust prayer_count on any request
- Create answered-prayer updates on seed requests
- Override expiry on any request

**Moderation:**
- Review queue: flagged, reported, auto-blocked, self-harm triggers
- Actions: approve, remove, edit, ban session_id
- Crisis view: self-harm keyword matches with resource link tools

**Analytics dashboard:**
- Total requests (seed vs organic split)
- Total prayer taps (seed vs organic split)
- Coverage rate (% of requests with 1+ prayer in 24h)
- Active sessions (last 7 days)
- Share count, answered prayer count

---

## 18. What not to build

### Broad Christian social network
Why not: crowded, easy to sprawl, hard to moderate, weak differentiation. PrayerNet proves this.

### Generic pray-to-unlock blocker
Why not: already exists (10+ apps), easy to copy, spiritual novelty wears off, not enough moat.

### Content-heavy guided prayer subscription app
Why not: Hallow/Pray.com already dominate, content costs are higher, brand race is harder.

### Feed optimized for engagement time
Why not: wrong metric for this product, teaches browsing instead of prayer, undermines ethos.

### Pay-to-pray mechanics
Why not: trust-killing, spiritually wrong, creates exploitative optics instantly.

---

## 19. Positioning lines

### Public prayer app
- Post a prayer. Get prayed for.
- Prayer support for strangers, in under 30 seconds.
- A quiet place to ask for prayer.
- No noise. No profiles. No ads. Just prayer.

### Blocker app (Phase 2)
- Pause and pray for a real person before you scroll.
- Before TikTok, pray for someone who actually needs it.
- Turn distraction into intercession.
- Not AI. Not prewritten. A real person, right now.

---

## 20. Which competitor teaches what

| App | Study for | Do NOT copy |
|-----|-----------|-------------|
| Prayer Lock | Permission funnel, block trigger, prayer gate, minimal blocker architecture | Generic positioning |
| Pushscroll | Retention architecture, paywall strategy, reliability, serious ops stack | Fitness framing |
| PrayerMate | Calm UX, utility framing, non-social prayer interface restraint | Pure organizer-only model |
| PrayerNet | Feature sprawl danger, why prayer apps shouldn't become Christian social | Everything else |
| Pray.com | Scale stack, monetization ambition, what privacy-sensitive users distrust | Privacy practices |
| Hallow | Premium spiritual habit monetization, trustful no-ads model | Content arms race |
| Pray4Me | Validates anonymous prayer concept, closest conceptual competitor | It's still tiny |

---

## 21. Product roadmap

| Phase | Product | Timeline | Revenue |
|-------|---------|----------|---------|
| 1 | Anonymous prayer community (PWA) | Months 1-3 | $0 (free) |
| 1b | Premium utility subscription | Months 4-6 | $200-800/month |
| 2 | Screen lock native app (conditional) | Months 4-6 (if validated) | $1,000-5,000/month |
| 3 | Private prayer circles | Months 6-9 | $2,000-10,000/month |

Three products, one backend, one prayer database. Each feeds the others.

---

## 22. Beachhead Audience

The beachhead is NOT "all Christians." The core user and the early adopter are different people.

**Early adopter (acquire first):** Mobile-native Christians 18-34 who feel awkward asking for prayer offline. Already comfortable with anonymous online spaces. Find you through Reddit, TikTok, organic search, or share links. Post late at night about anxiety, loneliness, addiction, family stress.

**Core sustained user (grows through share links):** Women 28-55 who pray for their families. Find you through iMessage, WhatsApp, or Facebook shares. Post about health, family, grief. Also pray for others — often becoming the coverage backbone.

**Coverage backbone (keeps the product alive):** Faithful Intercessors, 45-70, who come specifically to pray for 10-20 requests per session. A small number solve the cold-start coverage problem. Find you through church groups, Facebook prayer communities, word of mouth.

**Sequencing:** Design the product for warmth and quiet (appeals to all three). Market the launch to the early adopter (18-34). Let share links pull in the core user (28-55). Let word of mouth attract the intercessor (45-70).

---

## 23. Two-Sided Jobs-to-be-Done

This is a two-sided marketplace. Both sides must be served or the product dies.

**For the person asking:**

| Job | What they need | What they fear |
|-----|---------------|----------------|
| "I need prayer right now" | Immediate posting, no friction | Creating an account, explaining themselves |
| "I don't want to explain myself" | Anonymity, short text | Being judged, recognized, questioned |
| "I want someone to actually respond" | Prayer count notifications, real taps | Bot responses, silence, being ignored |
| "I don't want advice or noise" | No comments, no DMs, no debates | Theological lectures, judgment |

**For the person praying:**

| Job | What they need | What they fear |
|-----|---------------|----------------|
| "I want a simple way to help" | One-tap, fresh requests | Guilt, obligation, time commitment |
| "I want a prayer habit that feels real" | Private streaks, summaries, reminders | Gamification, leaderboards, performance |
| "I want to know it mattered" | Answered prayer updates | Praying into a void |
| "I don't want another feed" | Limited queue, no infinite scroll | Doomscrolling prayer content |

---

## 24. Good vs Bad Habit Mechanics

**Good (private, meaning-centered):**
- Private prayer streak (only the user sees it)
- Weekly summary: "You prayed for 8 people this week"
- Answered-prayer follow-up notifications
- Saved prayer history (personal journal)
- Gentle reminders: "Someone needs prayer today"

**Bad (public, game-centered):**
- Public leaderboards
- Flashy badges or achievements
- XP or points
- Status tiers (Bronze/Silver/Gold)
- Streak-loss penalties or streak monetization

**Rule:** Habit mechanics should feel like a prayer journal, not a fitness app. PrayerRequest.com's leaderboard drama and Pray.com's streak manipulation prove that public gamification corrupts prayer spaces.

---

## 25. First-Session Onboarding Script

**Goal:** Remove fear. Prove value before asking for trust.

**Critical insight:** Let them pray for someone BEFORE asking them to post their own request.

**Screen 1 — Entry:**
Headline: "Post a prayer. Get prayed for."
Subhead: "Anonymous. No comments. No ads. Just prayer."
Primary CTA: "Pray for someone now" / Secondary: "Ask for prayer"

**Screen 2 — Prove the product:**
Show one real prayer request card (seeded). Large "I prayed" button. Counter animates on tap.
Microcopy: "Thank you. They'll know someone prayed."

**Screen 3 — Bridge:**
"Someone will feel that. Need prayer too?"

**Screen 4 — Post form:**
Short text, 7 category pills, anonymous ON by default.
Reassurance: "No names needed. No profile required."

**Screen 5 — Confirmation:**
"Your prayer is live. We'll let you know when someone prays."

---

## 26. Landing Page Wireframe

**Above the fold:**
- Headline: Post a prayer. Get prayed for.
- Subhead: Anonymous prayer support with real response — no profiles, no comments, no ads.
- Primary CTA: Ask for prayer
- Secondary CTA: Pray for someone now
- UI proof: One real prayer card with category, prayer count, "I prayed" button

**Section 2:** "Need prayer, but don't know who to ask?" — ask quietly, receive prayer, come back to updates.

**Section 3:** How it works (5 steps: post → pray → notify → update → share)

**Section 4:** Why it feels different (anonymous, no comments, no ads, 48h expiry, built for prayer not browsing)

**Section 5:** Product screens (4 mockups: queue, "I prayed" moment, notification, answered update)

**Section 6:** Trust footer ("We never sell your prayer data. No ads. Delete your data anytime.")

---

## 27. Ad Testing Matrix

**Validated priority order (based on user-language evidence):**

**1. Awkwardness relief (LEAD)**
Hook: "Need prayer, but hate asking people you know?"
Body: Post anonymously. No comments. No profiles. Just prayer.
Why strongest: Matches direct user language — women describe feeling "needy," "embarrassed," hiding vulnerability.
Channels: Reddit, Instagram stories, TikTok

**2. Real response (SECOND)**
Hook: "Anonymous prayer support with real response."
Body: Post a prayer. Get notified when someone prays. Come back to what mattered.
Why strong: Directly attacks the #1 market failure — PrayerRequest.com's "too many requests, too few pray-ers."
Channels: Google search ads, Reddit

**3. Anti-social-noise (DIFFERENTIATOR)**
Hook: "Not another Christian social app."
Body: No feed. No debate. No DMs. Just prayer requests, prayer, and updates.
Why useful: Instant differentiation. Signals restraint. Works better as positioning than lead hook.
Channels: Facebook (Christian groups), Instagram

**4. Quiet habit (SECONDARY)**
Hook: "Pray for someone in under 30 seconds."
Body: A calmer daily habit than another scroll.
Why secondary: Appeals to pray-er side. Real but weaker as acquisition hook — better for retention.
Channels: TikTok (faith creators), Instagram reels

**Test plan:** Run all four as landing page variants. Kill weakest two after 500 impressions each. Scale top two.

---

## 28. Trust Copy and Objection Handling

| Objection | Source | Copy Response |
|-----------|--------|---------------|
| "Is this just another Pray.com?" | Billing scandals, ads | "No ads. No data selling. No recurring charges unless you choose premium." |
| "Will anyone actually pray?" | PrayerRequest.com — unanswered requests | "Every request gets prayer. We'll notify you when someone prays." |
| "Is it really anonymous?" | Privacy anxiety | "No names required. No profiles. We don't track your location." |
| "Will I get preached at?" | Auto-replies with theology | "No comments. No replies. No advice. Just prayer." |
| "Is this a scam?" | Pray.com unauthorized charges | "Free. Premium is optional. Cancel anytime." |
| "What about harmful content?" | Moderation concerns | "Every request is moderated. Crisis content triggers support resources." |

**Trust signals to include everywhere:**
- "No ads, ever" — footer, landing page, app store listing
- "No data selling, ever" — explicitly contrast with Pray.com
- "Delete your data anytime"
- Privacy policy in plain English
- No tracking pixels, no Facebook SDK, no location permissions

---

## 29. Key learnings

1. Community identity > mechanic — the wrapper matters more than the feature
2. Instapray died because it had no monetization model — Peter Thiel money wasn't enough
3. Pray.com alienated users with ads between prayers — never do this
4. Pray.com data-mines prayer content with broker data — never do this
5. PrayerNet has moderation problems — users report harassment with no block button
6. Echo Prayer users hate subscriptions for simple tools — consider one-time purchase
7. Hallow found payment creates commitment — users 2.4x more likely to build prayer habit when they invest
8. 72% of annual subscribers cancel in Year 1 (2026) — start monthly, prove retention before annual
9. Freemium converts at 2.1% median — plan economics around 2-4%, not 10%
10. 80-90% of all trials happen on Day 0 — onboarding is everything
11. The app economy is a sorting machine — top 10% grew 306%, median 5.3%
12. Revenue anchored in older cohorts — apps launched 2025+ contribute just 3% of subscription revenue
13. Prayer lock category is crowded but undifferentiated — 10+ apps all use AI/pre-written prayers
14. iOS Screen Time API has UX limitations — no documented "open parent app" from ShieldActionDelegate
15. Android Accessibility Service has policy risk — Google Play restricts without explicit consent
16. Toll booth risk is unvalidated — must test before Phase 2
17. 10 of 11 competitors use Flutter — dominant native framework in this niche
18. Hallow and Pray.com integrate Stripe alongside Play Billing — likely web checkout (inference, not confirmed)
19. Prayer Lock has 73K users with NO push notifications — blocking mechanic IS the engagement
20. No competitor in these 11 apps uses Supabase — our choice is differentiated within this niche
21. Pray.com APK confirms ACCESS_FINE_LOCATION + Braze + Sendbird — privacy scandal is in the binary

---

## 30. Decisions log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-02 | Consumer app, not church SaaS | Founder's vision is community-first |
| 2026-04-02 | Anonymous by default | Competitors validate this (Pray4Me), trust is core |
| 2026-04-02 | 48h expiry (not 24 or 72) | 24 too short, 72 gets stale |
| 2026-04-02 | Web-first PWA, not native | 30-50% faster launch, skip App Store review |
| 2026-04-02 | Next.js + Supabase + Vercel | Best 2026 stack for this use case, cheapest, fastest |
| 2026-04-02 | $3.99/month premium (not $4.99) | Lower price converts better per RevenueCat data |
| 2026-04-02 | No ads ever | Pray.com backlash proves this is a competitive weapon |
| 2026-04-02 | No data selling ever | Pray.com scandal proves this is a real differentiator |
| 2026-04-02 | Screen lock is Phase 2, not MVP | Requires community first + validation of toll booth risk |
| 2026-04-02 | Two-product strategy | Community = content infrastructure, lock = distribution + revenue |
| 2026-04-02 | Design schema for public API from day 1 | Enables screen lock app to query prayer requests later |
| 2026-04-02 | APK teardown completed (11 apps) | All Flutter+Firebase. Hallow=Helium, PrayerLock=Superwall, Pray4U=RevenueCat |
| 2026-04-02 | Use RevenueCat for monetization | Cleanest implementation seen in Pray4U teardown |
| 2026-04-02 | Phase 2: Flutter + Superwall | Prayer Lock proves Superwall works at 73K+ users |
| 2026-04-03 | 7 categories (health, family, grief, finances, inner struggle, work & school, other) | Based on real prayer wall data. Categories for posting, not navigation. |
| 2026-04-03 | Session tokens, not device fingerprinting | Device IDs are brittle. Anonymous session tokens are cleaner. |
| 2026-04-03 | Beachhead: 18-34 mobile-native, not "all Christians" | Early adopters are anonymous-comfortable. Core user (28-55) grows through shares. |
| 2026-04-03 | Two-sided JTBD: asker safety + pray-er habit | Both sides must be served or product dies. Coverage is existential. |
| 2026-04-03 | Onboarding: pray first, then post | Reduces fear, proves value, teaches loop in 60 seconds. |
| 2026-04-03 | Ad angle priority: awkwardness → real response → anti-noise → quiet habit | Validated against real user language from prayer walls, forums, and app reviews. |
| 2026-04-03 | Private habit mechanics only | Public leaderboards corrupt prayer spaces (PrayerRequest.com proof). |
| 2026-04-03 | Trust copy is strategic, not branding | Pray.com's privacy scandal creates a real trust opening. Elevate to core messaging. |
| 2026-04-03 | Seed requests AND prayer counts via admin panel | Cold-start requires populated feel. Admin controls prayer_count directly. is_seed flag for filtering analytics. |

---

## 31. Open questions

- App name (not decided yet)
- One-time purchase vs subscription (worth testing — Echo users prefer one-time)
- Screen lock Phase 2: validate toll booth risk before committing
- Church/group angle (let it emerge naturally from consumer usage)
- Content moderation staffing (founder-only for first 3 months, then?)
- Screen lock pricing: $4.99 or $6.99?
- Blocker app name and positioning (separate from prayer app brand?)

---

## 32. Confidence levels

### High confidence (proven or strongly supported)
- Blocker niche is real and monetizable (73K+ users on Prayer Lock)
- Prayer social/community is fragmented and easy to bloat
- Anonymous quiet prayer exchange is the clearest public prayer shape
- Two-product architecture is the strongest overall strategy
- Blocker is the better subscription engine
- All major competitors use Flutter + Firebase
- Pray.com tracks location and uses data brokers (confirmed in APK)
- Privacy-first positioning is genuine differentiation

### Directional (reasonable inference, not absolute proof)
- Hallow uses Stripe to bypass Apple's 30% (inference from Android APK)
- Exact competitor store counts at any future date
- Revenue projections (based on industry medians, not validated for this specific app)
- Toll booth risk severity (unvalidated — could be minor or fatal)
- "No one combines real prayer requests with screen lock" (directionally true from 11 apps, not exhaustively verified across all stores)
- $3.99 as optimal price point (reasonable from data, but needs A/B testing)
