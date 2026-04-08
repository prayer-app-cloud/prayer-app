import { createClient } from "@/lib/supabase/server";
import { generateDisplayName } from "@/lib/display-names";

export async function getSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Get session ID, creating an anonymous session if none exists.
 * Also ensures the user has a display_name in the users table.
 */
export async function getSessionId() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await ensureDisplayName(supabase, user.id);
    return user.id;
  }

  // No session — create anonymous one
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) {
    console.error("[session] Anonymous sign-in failed:", error.message);
    return null;
  }

  const userId = data.user?.id ?? null;
  if (userId) {
    await ensureDisplayName(supabase, userId);
  }

  return userId;
}

/**
 * Get the current user's display name from the users table.
 */
export async function getDisplayName(): Promise<string | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("users")
    .select("display_name")
    .eq("session_id", user.id)
    .single();

  return data?.display_name ?? null;
}

/**
 * Ensure the user row exists with a display_name.
 * If the user already exists but has no display_name, generate one.
 */
async function ensureDisplayName(supabase: Awaited<ReturnType<typeof createClient>>, sessionId: string) {
  const { data: existing } = await supabase
    .from("users")
    .select("display_name")
    .eq("session_id", sessionId)
    .single();

  if (existing?.display_name) return;

  const displayName = generateDisplayName();

  if (existing) {
    // User exists but no display_name
    await supabase
      .from("users")
      .update({ display_name: displayName })
      .eq("session_id", sessionId);
  } else {
    // Create user row
    await supabase
      .from("users")
      .insert({
        session_id: sessionId,
        auth_method: "anonymous",
        display_name: displayName,
      });
  }
}
