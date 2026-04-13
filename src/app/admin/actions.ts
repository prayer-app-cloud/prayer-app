"use server";

import { createClient } from "@/lib/supabase/server";
import { getSeedPrayers, getAnsweredUpdates } from "@/lib/seed-prayers";
import { generateDisplayName } from "@/lib/display-names";
import type { PrayerRequest } from "@/lib/types/database";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "prayer-admin-2026";

function verifyPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

// ── Verify admin access ────────────────────────────────────────
export async function verifyAdmin(password: string): Promise<{ success: boolean }> {
  return { success: verifyPassword(password) };
}

// ── Generate all seed prayers ──────────────────────────────────
export async function generateSeeds(password: string): Promise<{
  success: boolean;
  count?: number;
  answeredCount?: number;
  error?: string;
}> {
  if (!verifyPassword(password)) {
    return { success: false, error: "Invalid password." };
  }

  const supabase = await createClient();
  const seeds = getSeedPrayers();
  const answeredUpdates = getAnsweredUpdates();
  const answeredIndices = new Set(answeredUpdates.map((u) => u.index));

  const now = Date.now();
  let inserted = 0;
  let answeredInserted = 0;

  for (let i = 0; i < seeds.length; i++) {
    const seed = seeds[i];

    // Stagger timestamps: spread across last 36 hours
    const hoursAgo = (i / seeds.length) * 36;
    const createdAt = new Date(now - hoursAgo * 60 * 60 * 1000).toISOString();
    const expiresAt = new Date(now - hoursAgo * 60 * 60 * 1000 + 48 * 60 * 60 * 1000).toISOString();

    const displayName = generateDisplayName();
    const isAnswered = answeredIndices.has(i);

    const { data, error } = await supabase
      .from("prayer_requests")
      .insert({
        title: seed.title,
        text: seed.text,
        category: seed.category,
        session_id: `seed-${i}-${Date.now()}`,
        prayer_count: seed.prayer_count,
        status: isAnswered ? "answered" : "active",
        anonymous: true,
        urgency: "normal",
        is_seed: true,
        created_at: createdAt,
        expires_at: expiresAt,
        display_name_snapshot: displayName,
        update_text: isAnswered ? answeredUpdates.find((u) => u.index === i)?.text ?? null : null,
      })
      .select("id")
      .single();

    if (error) {
      console.error(`Seed insert error for index ${i}:`, error);
      continue;
    }

    inserted++;

    // Insert answered update
    if (isAnswered && data) {
      const updateText = answeredUpdates.find((u) => u.index === i)?.text;
      if (updateText) {
        const { error: updateError } = await supabase.from("updates").insert({
          request_id: data.id,
          type: "answered",
          text: updateText,
          is_seed: true,
        });

        if (!updateError) answeredInserted++;
      }
    }
  }

  return { success: true, count: inserted, answeredCount: answeredInserted };
}

// ── Clear all seed data ────────────────────────────────────────
export async function clearSeeds(password: string): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!verifyPassword(password)) {
    return { success: false, error: "Invalid password." };
  }

  const supabase = await createClient();

  // Delete seed updates first (FK constraint)
  await supabase.from("updates").delete().eq("is_seed", true);

  // Delete seed prayer requests
  const { error } = await supabase.from("prayer_requests").delete().eq("is_seed", true);

  if (error) {
    console.error("clearSeeds error:", error);
    return { success: false, error: "Failed to clear seeds." };
  }

  return { success: true };
}

// ── Fetch all prayer requests for admin view ───────────────────
export async function fetchAdminPrayers(password: string): Promise<{
  prayers: PrayerRequest[];
  error?: string;
}> {
  if (!verifyPassword(password)) {
    return { prayers: [], error: "Invalid password." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("prayer_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("fetchAdminPrayers error:", error);
    return { prayers: [], error: "Failed to fetch prayers." };
  }

  return { prayers: (data ?? []) as PrayerRequest[] };
}

// ── Update prayer count ────────────────────────────────────────
export async function updatePrayerCount(
  password: string,
  requestId: string,
  newCount: number
): Promise<{ success: boolean; error?: string }> {
  if (!verifyPassword(password)) {
    return { success: false, error: "Invalid password." };
  }

  if (newCount < 0 || newCount > 9999) {
    return { success: false, error: "Count must be between 0 and 9999." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("prayer_requests")
    .update({ prayer_count: newCount })
    .eq("id", requestId);

  if (error) {
    console.error("updatePrayerCount error:", error);
    return { success: false, error: "Failed to update count." };
  }

  return { success: true };
}

// ── Get seed vs organic stats ──────────────────────────────────
export async function fetchAdminStats(password: string): Promise<{
  seedCount: number;
  organicCount: number;
  answeredCount: number;
  totalPrayers: number;
  error?: string;
}> {
  if (!verifyPassword(password)) {
    return { seedCount: 0, organicCount: 0, answeredCount: 0, totalPrayers: 0, error: "Invalid password." };
  }

  const supabase = await createClient();

  const [seedResult, organicResult, answeredResult, prayersResult] = await Promise.all([
    supabase.from("prayer_requests").select("id", { count: "exact", head: true }).eq("is_seed", true),
    supabase.from("prayer_requests").select("id", { count: "exact", head: true }).eq("is_seed", false),
    supabase.from("prayer_requests").select("id", { count: "exact", head: true }).eq("status", "answered"),
    supabase.from("prayer_requests").select("prayer_count"),
  ]);

  const totalPrayers = (prayersResult.data ?? []).reduce((sum, r) => sum + (r.prayer_count ?? 0), 0);

  return {
    seedCount: seedResult.count ?? 0,
    organicCount: organicResult.count ?? 0,
    answeredCount: answeredResult.count ?? 0,
    totalPrayers,
  };
}
