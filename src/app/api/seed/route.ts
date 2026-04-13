import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@supabase/supabase-js";
import { SEED_PRAYERS, getAnsweredSeeds } from "@/lib/seed-prayers";
import { generateDisplayName } from "@/lib/display-names";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent";

const SYSTEM_PROMPT = `Given a raw prayer request, produce JSON with:
1. prayer_points: 2-4 short bullet points naming specific needs. Plain language, under 15 words each.
2. guided_prayer: A short prayer (2-4 sentences, under 60 words). Address God directly. Mention specific needs. End with Amen.
Write like a normal person. No church jargon, no flowery language.
Respond ONLY with valid JSON: {"prayer_points": ["..."], "guided_prayer": "God, ..."}`;

async function generatePrayerAI(
  title: string,
  text: string,
  category: string,
  apiKey: string,
): Promise<{ prayer_points: string[]; guided_prayer: string } | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `Prayer request (category: ${category}):\n\nTitle: ${title}\n${text}` }],
          },
        ],
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 512,
          responseMimeType: "application/json",
        },
      }),
    });
    clearTimeout(timeout);

    if (!res.ok) return null;

    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return null;

    const parsed = JSON.parse(rawText);
    if (!Array.isArray(parsed.prayer_points) || typeof parsed.guided_prayer !== "string") return null;

    return { prayer_points: parsed.prayer_points, guided_prayer: parsed.guided_prayer };
  } catch {
    return null;
  }
}

// POST /api/seed — clear old seeds, insert new ones, run AI on each
// Protected: requires ?key=<SEED_SECRET> query param
// Uses service role key to bypass RLS for admin seed operations
export async function POST(req: Request) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key");
  const seedSecret = process.env.SEED_SECRET || "prayer-seed-2026";

  if (key !== seedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const results = { deleted: 0, inserted: 0, answered: 0, aiGenerated: 0, errors: [] as string[] };

  // 1. Delete old seed taps, follows, updates, notifications, then seed requests
  const { data: oldSeeds } = await supabase
    .from("prayer_requests")
    .select("id")
    .eq("is_seed", true);

  if (oldSeeds && oldSeeds.length > 0) {
    const oldIds = oldSeeds.map((s) => s.id);

    await supabase.from("prayer_taps").delete().in("request_id", oldIds);
    await supabase.from("prayer_follows").delete().in("prayer_request_id", oldIds);
    await supabase.from("updates").delete().in("request_id", oldIds);
    await supabase.from("notifications").delete().in("request_id", oldIds);
    await supabase.from("prayer_requests").delete().eq("is_seed", true);
    results.deleted = oldIds.length;
  }

  // 2. Prepare all seeds
  const answeredSeeds = getAnsweredSeeds();
  const answeredIndices = new Set(answeredSeeds.map((a) => a.index));

  // Build seed rows with timestamps
  const seedRows = SEED_PRAYERS.map((seed, i) => {
    const isAnswered = answeredIndices.has(i);
    const answeredText = isAnswered ? answeredSeeds.find((a) => a.index === i)?.text : null;

    // Stagger across 48 hours with evening bias
    const rawHoursAgo = Math.random() * 48;
    const hourOfDay = (24 - (rawHoursAgo % 24)) % 24;
    let weight = 0.7;
    if (hourOfDay >= 19 || hourOfDay <= 1) weight = 1.0;
    else if (hourOfDay >= 2 && hourOfDay <= 6) weight = 0.3;
    const hoursAgo = Math.random() < weight ? rawHoursAgo : Math.random() * 48;
    const createdAt = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();
    const expiresAt = new Date(Date.now() - hoursAgo * 60 * 60 * 1000 + 48 * 60 * 60 * 1000).toISOString();

    return { index: i, seed, isAnswered, answeredText, createdAt, expiresAt };
  });

  // 3. Process in batches of 3 with parallel AI, 4s pause between batches (free tier: 20 RPM)
  const BATCH_SIZE = 3;
  const BATCH_DELAY_MS = 4000;
  for (let b = 0; b < seedRows.length; b += BATCH_SIZE) {
    const batch = seedRows.slice(b, b + BATCH_SIZE);

    // Rate limit: pause between batches (skip first)
    if (b > 0 && geminiKey) {
      await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
    }

    // Generate AI for all items in batch in parallel
    const aiResults = await Promise.all(
      batch.map(({ seed }) =>
        geminiKey
          ? generatePrayerAI(seed.title, seed.text, seed.category[0], geminiKey)
          : Promise.resolve(null)
      )
    );

    // Insert each seed
    for (let j = 0; j < batch.length; j++) {
      const { seed, isAnswered, answeredText, createdAt, expiresAt } = batch[j];
      const ai = aiResults[j];
      const displayName = generateDisplayName();

      if (ai) results.aiGenerated++;

      const { data: inserted, error } = await supabase
        .from("prayer_requests")
        .insert({
          title: seed.title,
          text: seed.text,
          category: seed.category,
          session_id: "seed-" + Math.random().toString(36).slice(2, 10),
          anonymous: true,
          urgency: "normal",
          prayer_count: seed.prayer_count,
          prayer_points: ai ? JSON.stringify(ai.prayer_points) : null,
          guided_prayer: ai?.guided_prayer ?? null,
          is_seed: true,
          display_name_snapshot: displayName,
          status: isAnswered ? "answered" : "active",
          update_text: answeredText ?? null,
          created_at: createdAt,
          expires_at: expiresAt,
        })
        .select("id")
        .single();

      if (error) {
        results.errors.push(`Seed ${batch[j].index} "${seed.title}": ${error.message}`);
      } else {
        results.inserted++;

        if (isAnswered && answeredText && inserted) {
          const { error: updateErr } = await supabase.from("updates").insert({
            request_id: inserted.id,
            type: "answered",
            text: answeredText,
            is_seed: true,
          });
          if (!updateErr) results.answered++;
        }
      }
    }
  }

  return NextResponse.json(results);
}
