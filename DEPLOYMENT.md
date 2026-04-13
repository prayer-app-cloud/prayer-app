# DEPLOYMENT.md — Prayer App Deployment Guide

## Current Status (April 13, 2026)

### ✅ COMPLETED
- All 3 premium build passes executed and verified
- Post-pass fixes applied (notification throttling, follow language, sessionCount, journal prompt bug)
- Both migrations run against live Supabase
- 222 seed prayers inserted, 23 with answered updates
- Seed route updated to use service role key (bypasses RLS)
- .env.local confirmed pointing to correct Supabase project (hucznektbzklptcvxrhl)
- .env.local never committed to git (verified via git log)
- GitHub repo set to private

### ⬜ PENDING
- AI generation for seeds (guided_prayer + prayer_points = 0 on all seeds)
  - Root cause: Gemini Google Cloud project suspended (CONSUMER_SUSPENDED since April 8)
  - Fix: create new Gemini API key from new Google account, update .env.local, re-seed
  - Alternative: deploy without AI content — app works, prayers show raw text, guided prayer overlay won't appear
- Secure seed endpoint before production (move key to env var or disable route)
- Deploy to Vercel
- Multi-session smoke test on deployed URL
- App name not finalized (candidates: Ember, Solace, Lifted, Held, Prayed, Light Up)

## Environment

### Supabase
- Project ref: hucznektbzklptcvxrhl
- URL: https://hucznektbzklptcvxrhl.supabase.co
- 7 migration files total

### Required .env.local variables
```
NEXT_PUBLIC_SUPABASE_URL=https://hucznektbzklptcvxrhl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
GEMINI_API_KEY=<working gemini key>
```

### Dev shortcuts
- Dev server: `npm run dev` from D:\Projects-Claude-Code\prayer-app
- Premium toggle: `?premium=true` URL param sets localStorage
- Dev mode: `localStorage.devMode = "true"` shows Reset Onboarding button in Me tab
- Seed endpoint: `POST /api/seed?key=prayer-seed-2026` (uses service role key)

## Deployment Sequence

### Step 1: Fix Gemini API key
1. Create new Google account (new Gmail)
2. Go to https://aistudio.google.com/apikey
3. Generate new Gemini API key (fresh account = fresh free tier)
4. Update GEMINI_API_KEY in .env.local

### Step 2: Re-seed with AI content
```powershell
cd D:\Projects-Claude-Code\prayer-app
npm run dev
# In separate terminal or Claude Code:
curl.exe -X POST "http://localhost:3000/api/seed?key=prayer-seed-2026"
```
Wait for response. Should show aiGenerated > 0.

### Step 3: Secure seed endpoint
Either:
- Move seed key to Vercel env var (SEED_SECRET) and check against process.env.SEED_SECRET
- Or disable/delete the /api/seed route before pushing to production

### Step 4: Deploy to Vercel
```powershell
git add -A
git commit -m "Full premium build: follow, updates, notifications, today, me, journal, reminders, premium gate"
git push
```
Vercel auto-deploys from push. Add all env vars to Vercel dashboard too.

### Step 5: Smoke test on deployed URL
Test across 3 separate sessions (close and reopen between each):

**Session 1:**
- Fresh visit → onboarding flow → pray for someone → post a prayer
- Check Today tab: your prayer module, daily prayer card
- Check Prayer Room: interleaved feed, follow buttons, "Need prayer?" CTA
- Follow a prayer

**Session 2:**
- Pray for 3-4 more people
- Check notification bell for unread
- Post an update on your prayer
- Verify "Updated" indicator in feed
- Check Me tab: my prayers, following, stats

**Session 3:**
- Pray a few more (total 5+)
- Write journal entries 1, 2, 3 (should work free)
- Attempt entry 4 → should see "More journal and answered history unlock after a few more sessions" (since 3 sessions + 5 prayers now met)
- If thresholds met AND cooldown clear: premium bottom sheet appears

**Also verify:**
- Journal prompt appears inside guided prayer sheet after "Done"
- "Need prayer?" CTA goes to post form
- Follow/Following text consistent across feed and detail
- Bell icon only appears after onboarding
- Answered prayer teaser on Today with gold treatment
- Reminders toggle works in Me settings
- "Go deeper" card only shows with 3+ journal/timeline entries

## PowerShell Notes
- Use `curl.exe` not `curl` (PowerShell aliases curl to Invoke-WebRequest)
- For piping SQL: `Get-Content file.sql | npx supabase db query --linked`
- Or use Git Bash where `<` redirect works normally

## Key Technical Notes
- sessionCount incremented ONLY in providers.tsx (once per app open, not in Me tab)
- Guided prayer sheet: journal prompt shows INSIDE sheet, defers onDone() until save/skip
- Notification throttling: 60-minute cooldown on prayer_received (time-based, not per-pray-er)
- Feed ordering: interleaved in both initial load AND load-more (same logic)
- Seed route: uses @supabase/supabase-js directly with service role key (not the RLS-restricted server client)
- Premium trigger: ONLY on entry #4 of journal/timeline, ONLY with engagement thresholds, ONLY if cooldown expired
- Today followed-prayers: shows all followed prayers broadly (not filtered to updated/answered only)

## Migration Files
1. `20250101_initial.sql` — base schema
2. `20250102_rls_policies.sql` — row level security
3. `20250103_events.sql` — events table
4. `20250104_prayer_follows.sql` — follows table
5. `20250105_display_names.sql` — display name fields
6. `20260413_add_request_updated_notification_type.sql` — request_updated enum value
7. `20260413_create_journal_and_reminders.sql` — journal + reminders tables with RLS

## Build Passes Summary

### Pass 1: Continuity Loop
- Follow/save on feed cards and detail page
- Update/answered flow with timeline on detail page
- Notification inbox with bell icon, 5 notification types
- Throttled prayer_received (60-min cooldown)
- Milestone notifications at 5, 10, 25

### Pass 2: Personal Prayer System
- Today tab rewritten as daily ritual destination
- Me tab rewritten with real ownership (my prayers, following, answered)
- Social proof engine: featured rotation, feed interleaving, seed timestamp staggering
- Onboarding prayer selection: mid-range count, relatable categories

### Pass 3: Premium Conversion Layer
- Prayer journal with 3-free gate
- Answered timeline with 3-free gate
- Reminders (free, not gated)
- Premium config (cents/currency, engagement thresholds)
- Premium bottom sheet with engagement-based trigger and 7-day cooldown
- FAB replaced with "Need prayer?" text CTA
- All event logging

### Post-Pass Fixes
- Notification throttling changed from per-pray-er to 60-minute cooldown
- Follow language normalized ("Follow"/"Following" everywhere, not "Save")
- Bell icon verified inside post-onboarding render path
- sessionCount increment removed from me-tab.tsx (only in providers.tsx)
- prayer_reminders UNIQUE constraint on session_id verified
- Guided prayer → journal prompt bug fixed (deferred onDone until save/skip)
- Seed route updated to use service role key
- Today followed-prayers query kept broad (not filtered to updated/answered)
- Load-more feed ordering updated to match initial interleaving logic
