import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@supabase/supabase-js";

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

// POST /api/backfill-ai — generate AI content for prayers missing it
// Protected: requires ?key=<SEED_SECRET> query param
export async function POST(req: Request) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key");
  const seedSecret = process.env.SEED_SECRET || "prayer-seed-2026";

  if (key !== seedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY not set" }, { status: 500 });
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // Fetch all prayers missing guided_prayer
  const { data: rows, error: fetchErr } = await supabase
    .from("prayer_requests")
    .select("id, title, text, category")
    .is("guided_prayer", null)
    .order("created_at", { ascending: true });

  if (fetchErr) {
    return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  }

  const prayers = rows ?? [];
  const results = { total: prayers.length, updated: 0, skipped: 0, failed: 0 };

  for (let i = 0; i < prayers.length; i++) {
    const prayer = prayers[i];

    // Rate limit: 1 request every 4 seconds (safe for 15 RPM free tier)
    if (i > 0) {
      await new Promise((r) => setTimeout(r, 4000));
    }

    const title = prayer.title ?? prayer.text.slice(0, 60);
    const category = Array.isArray(prayer.category) ? prayer.category[0] : prayer.category;

    const ai = await generatePrayerAI(title, prayer.text, category ?? "other", geminiKey);

    if (!ai) {
      results.failed++;
      continue;
    }

    const { error: updateErr } = await supabase
      .from("prayer_requests")
      .update({
        prayer_points: JSON.stringify(ai.prayer_points),
        guided_prayer: ai.guided_prayer,
      })
      .eq("id", prayer.id);

    if (updateErr) {
      results.failed++;
    } else {
      results.updated++;
    }
  }

  return NextResponse.json(results);
}
