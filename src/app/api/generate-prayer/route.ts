import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a prayer assistant for an anonymous prayer app. Your job is to take a raw prayer request and produce two things:

1. PRAYER POINTS: 2-4 short bullet points summarizing the specific needs in this request. Each bullet should be a clear, prayable item. Use plain everyday language — no theology jargon, no King James English, no flowery church language. Be specific to what the person actually asked for.

2. GUIDED PRAYER: A short prayer (2-4 sentences) that someone could read silently or aloud to pray for this person. Address God directly. Reference the specific needs from the request. Keep it warm, gentle, and non-denominational. No "thee" or "thou." End with Amen.

Rules:
- Never add needs the person did not mention
- Never give advice, opinions, or theological commentary
- Never reference the person's name even if they include one
- If the request mentions self-harm, crisis, or suicide, still generate the prayer points and guided prayer — content moderation is handled separately
- Keep prayer points under 15 words each
- Keep the guided prayer under 60 words total
- Do not use exclamation marks
- Do not use the word "just" (as in "Lord, just help them")

Respond ONLY with valid JSON, no markdown, no preamble:
{"prayer_points": ["point 1", "point 2", "point 3"], "guided_prayer": "Lord, ..."}`;

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export async function POST(request: NextRequest) {
  try {
    const { text, category } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(null, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("[generate-prayer] GEMINI_API_KEY not set");
      return NextResponse.json(null);
    }

    const userPrompt = `Prayer request (category: ${category}):\n\n${text}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

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
          thinkingConfig: { thinkingBudget: 0 },
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
