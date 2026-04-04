# Prayer App: Scaffolding + Database + Auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold a Next.js 15 App Router project with Supabase backend, create all database tables with RLS policies, and implement anonymous auth via Supabase's `signInAnonymously()`.

**Architecture:** Next.js 15 App Router with server components by default. Supabase client split into `createClient()` (server) and `createBrowserClient()` (browser). Anonymous auth managed via middleware that checks/creates sessions on every request. Database uses 6 tables with row-level security enforcing session-based access.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS 4, Supabase (postgres + auth + realtime), `@supabase/ssr`, `@supabase/supabase-js`

---

## File Structure

```
prayer-app/
  .env.local                          # Supabase keys (gitignored)
  .env.example                        # Template for env vars
  next.config.ts                      # Next.js config
  tailwind.config.ts                  # Tailwind config with prayer app theme
  tsconfig.json                       # TypeScript config
  package.json                        # Dependencies
  middleware.ts                        # Auth session refresh middleware
  supabase/
    migrations/
      00001_create_enums.sql          # All enum types
      00002_create_tables.sql         # All 6 tables
      00003_create_indexes.sql        # Performance indexes
      00004_create_rls_policies.sql   # Row-level security
      00005_create_functions.sql      # DB functions (expire, increment)
  src/
    app/
      layout.tsx                      # Root layout with providers
      page.tsx                        # Home prayer queue (Screen 1)
      post/
        page.tsx                      # Post prayer request (Screen 2)
      r/
        [share_slug]/
          page.tsx                    # Prayer detail / share link (Screen 3, SSR)
      update/
        [id]/
          page.tsx                    # Update / answered flow (Screen 4)
      notifications/
        page.tsx                      # Notifications list (Screen 5)
      admin/
        page.tsx                      # Admin panel (Screen 6)
    lib/
      supabase/
        server.ts                     # createClient() for server components/actions
        client.ts                     # createBrowserClient() for client components
        middleware.ts                  # updateSession() helper for middleware
      types/
        database.ts                   # Generated/manual Supabase DB types
    components/
      providers.tsx                   # Client-side providers wrapper
```

---

## Task 1: Initialize Next.js 15 Project

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`, `.env.example`, `.gitignore`

- [ ] **Step 1: Scaffold Next.js 15 with create-next-app**

```bash
cd D:/Projects-Claude-Code/prayer-app
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack --yes
```

This creates the full Next.js project in the current directory. The `--yes` flag accepts defaults.

- [ ] **Step 2: Verify the scaffold works**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 3: Create .env.example**

Create `.env.example`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

- [ ] **Step 4: Update .gitignore to include .env.local**

Ensure `.gitignore` contains:
```
.env.local
.env*.local
```

(create-next-app usually adds this, verify it's there)

- [ ] **Step 5: Configure Tailwind with prayer app theme colors**

Update `tailwind.config.ts`:
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FFFDF7",
        "cream-dark": "#F5F0E8",
        amber: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
        },
        warm: {
          50: "#FFF7ED",
          100: "#FFEDD5",
          200: "#FED7AA",
          gray: "#6B7280",
          "gray-light": "#9CA3AF",
        },
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 6: Set up root layout with base styles**

Replace `src/app/layout.tsx`:
```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Prayer App",
  description: "Post a prayer. Get prayed for.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-cream text-gray-900 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 7: Set up globals.css with base styles**

Replace `src/app/globals.css`:
```css
@import "tailwindcss";

@theme {
  --color-cream: #FFFDF7;
  --color-cream-dark: #F5F0E8;
  --color-warm-50: #FFF7ED;
  --color-warm-100: #FFEDD5;
  --color-warm-200: #FED7AA;
  --color-warm-gray: #6B7280;
  --color-warm-gray-light: #9CA3AF;
}

body {
  font-family: var(--font-inter), system-ui, -apple-system, sans-serif;
}
```

- [ ] **Step 8: Replace homepage with placeholder**

Replace `src/app/page.tsx`:
```tsx
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-semibold text-gray-800 mb-2">
        Post a prayer. Get prayed for.
      </h1>
      <p className="text-warm-gray">Coming soon.</p>
    </main>
  );
}
```

- [ ] **Step 9: Verify build still passes**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 10: Initialize git and commit**

```bash
git init
git add -A
git commit -m "feat: scaffold Next.js 15 with Tailwind and prayer app theme"
```

---

## Task 2: Install and Configure Supabase Client Libraries

**Files:**
- Create: `src/lib/supabase/server.ts`, `src/lib/supabase/client.ts`, `src/lib/supabase/middleware.ts`, `src/lib/types/database.ts`
- Modify: `package.json` (via npm install)

- [ ] **Step 1: Install Supabase packages**

```bash
cd D:/Projects-Claude-Code/prayer-app
npm install @supabase/supabase-js @supabase/ssr
```

- [ ] **Step 2: Create database types file**

Create `src/lib/types/database.ts`:
```typescript
export type CategoryEnum =
  | "health"
  | "family"
  | "grief"
  | "finances"
  | "inner_struggle"
  | "work_school"
  | "other";

export type RequestStatusEnum =
  | "active"
  | "updated"
  | "answered"
  | "removed"
  | "expired";

export type UrgencyEnum = "normal" | "high";

export type TapSourceEnum = "community" | "screen_lock" | "seed";

export type UpdateTypeEnum = "update" | "answered";

export type AuthMethodEnum = "anonymous" | "email";

export type ReportReasonEnum =
  | "spam"
  | "inappropriate"
  | "harmful"
  | "self_harm"
  | "other";

export type NotificationTypeEnum =
  | "prayer_received"
  | "request_answered"
  | "expiry_warning"
  | "milestone";

export interface PrayerRequest {
  id: string;
  text: string;
  category: CategoryEnum;
  session_id: string;
  email: string | null;
  prayer_count: number;
  share_count: number;
  report_count: number;
  status: RequestStatusEnum;
  anonymous: boolean;
  urgency: UrgencyEnum;
  update_text: string | null;
  expires_at: string;
  share_slug: string;
  is_seed: boolean;
  created_at: string;
  updated_at: string;
}

export interface PrayerTap {
  id: string;
  request_id: string;
  session_id: string;
  source: TapSourceEnum;
  created_at: string;
}

export interface Update {
  id: string;
  request_id: string;
  type: UpdateTypeEnum;
  text: string;
  is_seed: boolean;
  created_at: string;
}

export interface User {
  id: string;
  session_id: string;
  auth_method: AuthMethodEnum;
  email: string | null;
  notification_enabled: boolean;
  push_token: string | null;
  trust_score: number;
  strike_count: number;
  is_admin: boolean;
  created_at: string;
}

export interface Report {
  id: string;
  request_id: string;
  reason: ReportReasonEnum;
  reporter_session_id: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_session_id: string;
  type: NotificationTypeEnum;
  request_id: string;
  read: boolean;
  created_at: string;
}
```

- [ ] **Step 3: Create server-side Supabase client**

Create `src/lib/supabase/server.ts`:
```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method is called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  );
}
```

- [ ] **Step 4: Create browser-side Supabase client**

Create `src/lib/supabase/client.ts`:
```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 5: Create middleware session helper**

Create `src/lib/supabase/middleware.ts`:
```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session. If no session exists, create an anonymous one.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    await supabase.auth.signInAnonymously();
  }

  return supabaseResponse;
}
```

- [ ] **Step 6: Verify build passes**

Run: `npm run build`
Expected: Build succeeds. (Will warn about missing env vars at runtime, that's fine.)

- [ ] **Step 7: Commit**

```bash
git add src/lib/ package.json package-lock.json
git commit -m "feat: add Supabase client libraries and database types"
```

---

## Task 3: Create Middleware for Anonymous Auth

**Files:**
- Create: `middleware.ts` (project root)

- [ ] **Step 1: Create the root middleware**

Create `middleware.ts` in project root:
```typescript
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, etc)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

- [ ] **Step 2: Verify build passes**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add middleware.ts
git commit -m "feat: add middleware for anonymous auth session management"
```

---

## Task 4: Create Database Migrations — Enums

**Files:**
- Create: `supabase/migrations/00001_create_enums.sql`

- [ ] **Step 1: Create migrations directory**

```bash
mkdir -p supabase/migrations
```

- [ ] **Step 2: Write enum migration**

Create `supabase/migrations/00001_create_enums.sql`:
```sql
-- Prayer request categories
CREATE TYPE category_enum AS ENUM (
  'health',
  'family',
  'grief',
  'finances',
  'inner_struggle',
  'work_school',
  'other'
);

-- Request status lifecycle
CREATE TYPE request_status_enum AS ENUM (
  'active',
  'updated',
  'answered',
  'removed',
  'expired'
);

-- Urgency levels
CREATE TYPE urgency_enum AS ENUM (
  'normal',
  'high'
);

-- Source of prayer taps
CREATE TYPE tap_source_enum AS ENUM (
  'community',
  'screen_lock',
  'seed'
);

-- Update types
CREATE TYPE update_type_enum AS ENUM (
  'update',
  'answered'
);

-- Auth methods
CREATE TYPE auth_method_enum AS ENUM (
  'anonymous',
  'email'
);

-- Report reasons
CREATE TYPE report_reason_enum AS ENUM (
  'spam',
  'inappropriate',
  'harmful',
  'self_harm',
  'other'
);

-- Notification types
CREATE TYPE notification_type_enum AS ENUM (
  'prayer_received',
  'request_answered',
  'expiry_warning',
  'milestone'
);
```

- [ ] **Step 3: Commit**

```bash
git add supabase/
git commit -m "feat: add database enum types migration"
```

---

## Task 5: Create Database Migrations — Tables

**Files:**
- Create: `supabase/migrations/00002_create_tables.sql`

- [ ] **Step 1: Write tables migration**

Create `supabase/migrations/00002_create_tables.sql`:
```sql
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- Users table
-- ============================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR NOT NULL UNIQUE,
  auth_method auth_method_enum NOT NULL DEFAULT 'anonymous',
  email VARCHAR,
  notification_enabled BOOLEAN NOT NULL DEFAULT true,
  push_token VARCHAR,
  trust_score INTEGER NOT NULL DEFAULT 100,
  strike_count INTEGER NOT NULL DEFAULT 0,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Prayer Requests table
-- ============================================================
CREATE TABLE prayer_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text VARCHAR(500) NOT NULL,
  category category_enum NOT NULL,
  session_id VARCHAR NOT NULL,
  email VARCHAR,
  prayer_count INTEGER NOT NULL DEFAULT 0,
  share_count INTEGER NOT NULL DEFAULT 0,
  report_count INTEGER NOT NULL DEFAULT 0,
  status request_status_enum NOT NULL DEFAULT 'active',
  anonymous BOOLEAN NOT NULL DEFAULT true,
  urgency urgency_enum NOT NULL DEFAULT 'normal',
  update_text VARCHAR(280),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '48 hours'),
  share_slug VARCHAR NOT NULL UNIQUE,
  is_seed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Prayer Taps table
-- ============================================================
CREATE TABLE prayer_taps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES prayer_requests(id) ON DELETE CASCADE,
  session_id VARCHAR NOT NULL,
  source tap_source_enum NOT NULL DEFAULT 'community',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (request_id, session_id)
);

-- ============================================================
-- Updates table
-- ============================================================
CREATE TABLE updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES prayer_requests(id) ON DELETE CASCADE,
  type update_type_enum NOT NULL,
  text VARCHAR(280) NOT NULL,
  is_seed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Reports table
-- ============================================================
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES prayer_requests(id) ON DELETE CASCADE,
  reason report_reason_enum NOT NULL,
  reporter_session_id VARCHAR NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Notifications table
-- ============================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_session_id VARCHAR NOT NULL,
  type notification_type_enum NOT NULL,
  request_id UUID NOT NULL REFERENCES prayer_requests(id) ON DELETE CASCADE,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/00002_create_tables.sql
git commit -m "feat: add database tables migration"
```

---

## Task 6: Create Database Migrations — Indexes

**Files:**
- Create: `supabase/migrations/00003_create_indexes.sql`

- [ ] **Step 1: Write indexes migration**

Create `supabase/migrations/00003_create_indexes.sql`:
```sql
-- Prayer requests: query active requests ordered by creation
CREATE INDEX idx_prayer_requests_status_created
  ON prayer_requests (status, created_at DESC);

-- Prayer requests: lookup by share slug (for share links)
CREATE INDEX idx_prayer_requests_share_slug
  ON prayer_requests (share_slug);

-- Prayer requests: lookup by session (for "my prayers")
CREATE INDEX idx_prayer_requests_session_id
  ON prayer_requests (session_id);

-- Prayer requests: find expired requests
CREATE INDEX idx_prayer_requests_expires_at
  ON prayer_requests (expires_at)
  WHERE status = 'active';

-- Prayer taps: lookup taps for a request
CREATE INDEX idx_prayer_taps_request_id
  ON prayer_taps (request_id);

-- Prayer taps: check if session already prayed
CREATE INDEX idx_prayer_taps_session_request
  ON prayer_taps (session_id, request_id);

-- Updates: lookup updates for a request
CREATE INDEX idx_updates_request_id
  ON updates (request_id);

-- Reports: lookup reports for a request
CREATE INDEX idx_reports_request_id
  ON reports (request_id);

-- Notifications: lookup unread notifications for a user
CREATE INDEX idx_notifications_user_unread
  ON notifications (user_session_id, read, created_at DESC);

-- Users: lookup by session_id
CREATE INDEX idx_users_session_id
  ON users (session_id);
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/00003_create_indexes.sql
git commit -m "feat: add database indexes migration"
```

---

## Task 7: Create Database Migrations — RLS Policies

**Files:**
- Create: `supabase/migrations/00004_create_rls_policies.sql`

- [ ] **Step 1: Write RLS policies migration**

Create `supabase/migrations/00004_create_rls_policies.sql`:
```sql
-- ============================================================
-- Enable RLS on all tables
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_taps ENABLE ROW LEVEL SECURITY;
ALTER TABLE updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Helper: get current user's session_id from users table
-- Maps Supabase auth.uid() to our session_id
-- ============================================================
CREATE OR REPLACE FUNCTION get_session_id()
RETURNS VARCHAR AS $$
  SELECT session_id FROM users WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- Users policies
-- ============================================================
-- Users can read their own record
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (id = auth.uid());

-- Users can update their own record
CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (id = auth.uid());

-- Allow insert for new anonymous users (triggered during sign-up)
CREATE POLICY "users_insert_own" ON users
  FOR INSERT WITH CHECK (id = auth.uid());

-- ============================================================
-- Prayer Requests policies
-- ============================================================
-- Anyone can read active, non-removed requests
CREATE POLICY "prayer_requests_select_active" ON prayer_requests
  FOR SELECT USING (
    status IN ('active', 'updated', 'answered')
    AND report_count < 3
  );

-- Authenticated users can create requests
CREATE POLICY "prayer_requests_insert" ON prayer_requests
  FOR INSERT WITH CHECK (session_id = get_session_id());

-- Only the original poster can update their request
CREATE POLICY "prayer_requests_update_own" ON prayer_requests
  FOR UPDATE USING (session_id = get_session_id());

-- ============================================================
-- Prayer Taps policies
-- ============================================================
-- Anyone can see tap counts (via prayer_requests.prayer_count)
-- Users can see their own taps
CREATE POLICY "prayer_taps_select_own" ON prayer_taps
  FOR SELECT USING (session_id = get_session_id());

-- Authenticated users can create a tap
CREATE POLICY "prayer_taps_insert" ON prayer_taps
  FOR INSERT WITH CHECK (session_id = get_session_id());

-- ============================================================
-- Updates policies
-- ============================================================
-- Anyone can read updates on visible requests
CREATE POLICY "updates_select" ON updates
  FOR SELECT USING (true);

-- Only original poster can create updates (enforced via session_id check on request)
CREATE POLICY "updates_insert" ON updates
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM prayer_requests
      WHERE id = request_id
      AND session_id = get_session_id()
    )
  );

-- ============================================================
-- Reports policies
-- ============================================================
-- Users can create reports
CREATE POLICY "reports_insert" ON reports
  FOR INSERT WITH CHECK (reporter_session_id = get_session_id());

-- Users can see their own reports
CREATE POLICY "reports_select_own" ON reports
  FOR SELECT USING (reporter_session_id = get_session_id());

-- ============================================================
-- Notifications policies
-- ============================================================
-- Users can read their own notifications
CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT USING (user_session_id = get_session_id());

-- Users can update (mark as read) their own notifications
CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE USING (user_session_id = get_session_id());

-- System inserts notifications (via service role, not user)
-- No insert policy needed for anon — notifications are created server-side
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/00004_create_rls_policies.sql
git commit -m "feat: add RLS policies migration"
```

---

## Task 8: Create Database Migrations — Functions

**Files:**
- Create: `supabase/migrations/00005_create_functions.sql`

- [ ] **Step 1: Write database functions migration**

Create `supabase/migrations/00005_create_functions.sql`:
```sql
-- ============================================================
-- Function: Increment prayer count atomically
-- Called when a user taps "I prayed"
-- ============================================================
CREATE OR REPLACE FUNCTION increment_prayer_count(p_request_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE prayer_requests
  SET prayer_count = prayer_count + 1,
      updated_at = now()
  WHERE id = p_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Function: Generate a unique share slug
-- 8-char alphanumeric, collision-resistant
-- ============================================================
CREATE OR REPLACE FUNCTION generate_share_slug()
RETURNS VARCHAR AS $$
DECLARE
  new_slug VARCHAR;
  slug_exists BOOLEAN;
BEGIN
  LOOP
    new_slug := substr(replace(encode(gen_random_bytes(6), 'base64'), '/', ''), 1, 8);
    SELECT EXISTS(SELECT 1 FROM prayer_requests WHERE share_slug = new_slug) INTO slug_exists;
    EXIT WHEN NOT slug_exists;
  END LOOP;
  RETURN new_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Function: Expire old requests
-- Run periodically (via cron or edge function)
-- ============================================================
CREATE OR REPLACE FUNCTION expire_old_requests()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE prayer_requests
  SET status = 'expired',
      updated_at = now()
  WHERE status = 'active'
    AND expires_at < now();

  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Trigger: Auto-generate share_slug on insert
-- ============================================================
CREATE OR REPLACE FUNCTION set_share_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.share_slug IS NULL OR NEW.share_slug = '' THEN
    NEW.share_slug := generate_share_slug();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prayer_requests_share_slug
  BEFORE INSERT ON prayer_requests
  FOR EACH ROW
  EXECUTE FUNCTION set_share_slug();

-- ============================================================
-- Trigger: Auto-update updated_at timestamp
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prayer_requests_updated_at
  BEFORE UPDATE ON prayer_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Function: Create user record on anonymous sign-up
-- Called via a Supabase auth hook or manually after signInAnonymously
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, session_id, auth_method)
  VALUES (NEW.id, NEW.id::VARCHAR, 'anonymous')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: auto-create user record when auth.users gets a new row
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/00005_create_functions.sql
git commit -m "feat: add database functions and triggers migration"
```

---

## Task 9: Create Route Placeholders

**Files:**
- Create: `src/app/post/page.tsx`, `src/app/r/[share_slug]/page.tsx`, `src/app/update/[id]/page.tsx`, `src/app/notifications/page.tsx`, `src/app/admin/page.tsx`

- [ ] **Step 1: Create post page**

Create `src/app/post/page.tsx`:
```tsx
export default function PostPrayer() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-semibold text-gray-800 mb-2">
        What do you need prayer for?
      </h1>
      <p className="text-warm-gray">Post form coming soon.</p>
    </main>
  );
}
```

- [ ] **Step 2: Create prayer detail page (SSR share link)**

Create `src/app/r/[share_slug]/page.tsx`:
```tsx
interface PrayerDetailProps {
  params: Promise<{ share_slug: string }>;
}

export default async function PrayerDetail({ params }: PrayerDetailProps) {
  const { share_slug } = await params;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-semibold text-gray-800 mb-2">
        Someone needs prayer
      </h1>
      <p className="text-warm-gray">Prayer detail for {share_slug}</p>
    </main>
  );
}
```

- [ ] **Step 3: Create update page**

Create `src/app/update/[id]/page.tsx`:
```tsx
interface UpdateProps {
  params: Promise<{ id: string }>;
}

export default async function UpdatePrayer({ params }: UpdateProps) {
  const { id } = await params;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-semibold text-gray-800 mb-2">
        Update your prayer
      </h1>
      <p className="text-warm-gray">Update form for {id}</p>
    </main>
  );
}
```

- [ ] **Step 4: Create notifications page**

Create `src/app/notifications/page.tsx`:
```tsx
export default function Notifications() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-semibold text-gray-800 mb-2">
        Notifications
      </h1>
      <p className="text-warm-gray">
        Nothing yet. We&apos;ll let you know when someone prays.
      </p>
    </main>
  );
}
```

- [ ] **Step 5: Create admin page**

Create `src/app/admin/page.tsx`:
```tsx
export default function Admin() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-semibold text-gray-800 mb-2">
        Admin Panel
      </h1>
      <p className="text-warm-gray">Password-protected. Coming soon.</p>
    </main>
  );
}
```

- [ ] **Step 6: Verify build passes with all routes**

Run: `npm run build`
Expected: Build succeeds. All routes compile.

- [ ] **Step 7: Commit**

```bash
git add src/app/
git commit -m "feat: add placeholder pages for all 6 routes"
```

---

## Task 10: Create Providers and Session Helper

**Files:**
- Create: `src/components/providers.tsx`, `src/lib/session.ts`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create session helper for server components**

Create `src/lib/session.ts`:
```typescript
import { createClient } from "@/lib/supabase/server";

export async function getSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getSessionId() {
  const user = await getSession();
  return user?.id ?? null;
}
```

- [ ] **Step 2: Create providers wrapper**

Create `src/components/providers.tsx`:
```tsx
"use client";

import { type ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return <>{children}</>;
}
```

- [ ] **Step 3: Update root layout to use providers**

Update `src/app/layout.tsx`:
```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Prayer App",
  description: "Post a prayer. Get prayed for.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-cream text-gray-900 antialiased min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Verify build passes**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/components/providers.tsx src/lib/session.ts src/app/layout.tsx
git commit -m "feat: add providers wrapper and session helpers"
```

---

## Summary

After all 10 tasks:
- Next.js 15 project scaffolded with Tailwind and prayer app theme
- Supabase client configured for server/client/middleware
- Anonymous auth via `signInAnonymously()` in middleware
- 5 SQL migrations ready: enums, tables, indexes, RLS, functions
- All 6 routes have placeholder pages
- Session helpers for accessing current user server-side
- Auto-created user record on Supabase auth via trigger
