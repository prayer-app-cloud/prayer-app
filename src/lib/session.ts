import { createClient } from "@/lib/supabase/server";

export async function getSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Get session ID, creating an anonymous session if none exists.
 * This replaces the middleware-based approach since Next.js 16
 * deprecated middleware in favor of proxy.
 */
export async function getSessionId() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) return user.id;

  // No session — create anonymous one
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) {
    console.error("[session] Anonymous sign-in failed:", error.message);
    return null;
  }

  return data.user?.id ?? null;
}
