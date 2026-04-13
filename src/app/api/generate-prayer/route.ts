import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are writing prayer points and a guided prayer for an anonymous prayer app.

Given a raw prayer request, produce two things as JSON:

1. PRAYER POINTS: 2-4 short bullet points. Each one names a specific need the person mentioned. Write the way a friend would talk, not the way a pastor would preach.

2. GUIDED PRAYER: A short prayer (2-4 sentences, under 60 words) someone can read to pray for this person. Address God directly. Mention the specific needs. End with Amen.

WRITING RULES — read these carefully:
- Write like a normal person. Short sentences. Plain words.
- Use "is" and "are" and "has." Do not write "serves as" or "stands as" or "represents."
- Do not write "testament to," "speaks to," "reflects," or "underscores."
- Do not group things in threes. Two items or four items are fine. Not three.
- Do not use em dashes (—). Use commas or periods instead.
- Do not use -ing phrases to add fake depth ("highlighting," "showcasing," "fostering," "ensuring," "reflecting").
- Do not inflate importance. No "pivotal," "crucial," "vital," "profound," "transformative," "deeply rooted," "enduring."
- Do not use flowery language. No "tapestry," "journey," "landscape," "beacon," "testament," "resilient."
- Do not use church jargon. No "thee," "thou," "Lord we just," "hedge of protection," "move mightily."
- Do not start the guided prayer with "Dear" or "Heavenly Father." Start with "God," "Lord," or go straight into the prayer.
- Do not add needs the person did not mention.
- Do not give advice or theological commentary.
- Do not reference the person's name even if they included one.
- Keep prayer points under 15 words each.
- Do not use exclamation marks.

GOOD prayer point examples:
- "Healing from surgery recovery"
- "Peace about the job situation"
- "Strength to get through this week"
- "That the test results come back clear"

BAD prayer point examples (do not write like this):
- "Healing and restoration of physical well-being during this challenging season"
- "That God would provide a beacon of hope, strength, and clarity"
- "Peace that transcends understanding in the midst of uncertainty"

GOOD guided prayer example:
"God, be with this person as they wait for test results. Calm their worry. Give their doctors clear answers. Amen."

BAD guided prayer example (do not write like this):
"Heavenly Father, we come before you lifting up this precious soul who stands at a crossroads of uncertainty, seeking your divine guidance, strength, and peace during this transformative season."

Respond ONLY with valid JSON, no markdown, no preamble:
{"prayer_points": ["point 1", "point 2"], "guided_prayer": "God, ..."}`;

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent";

export async function POST(request: NextRequest) {
  try {
    const { text, title, category } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(null, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("[generate-prayer] GEMINI_API_KEY not set");
      return NextResponse.json(null);
    }

    const titleLine = title ? `Title: ${title}\n` : "";
    const userPrompt = `Prayer request (category: ${category}):\n\n${titleLine}${text}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: userPrompt }],
          },
        ],
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1024,
          responseMimeType: "application/json",
        },
      }),
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.error("[generate-prayer] Gemini API error:", response.status);
      return NextResponse.json(null);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      console.error("[generate-prayer] No text in Gemini response");
      return NextResponse.json(null);
    }

    const parsed = JSON.parse(rawText);

    // Validate shape
    if (
      !Array.isArray(parsed.prayer_points) ||
      parsed.prayer_points.length === 0 ||
      typeof parsed.guided_prayer !== "string"
    ) {
      console.error("[generate-prayer] Invalid JSON shape from Gemini");
      return NextResponse.json(null);
    }

    return NextResponse.json({
      prayer_points: parsed.prayer_points,
      guided_prayer: parsed.guided_prayer,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      console.error("[generate-prayer] Gemini API timeout (5s)");
    } else {
      console.error("[generate-prayer] Unexpected error:", err);
    }
    return NextResponse.json(null);
  }
}
