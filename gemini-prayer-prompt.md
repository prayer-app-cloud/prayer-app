# PrayerPoint — Gemini Prompt Spec

## Edge Function: `/api/generate-prayer`

### Input
```json
{
  "text": "raw prayer request from poster (up to 500 chars)",
  "category": "health | family | grief | finances | inner_struggle | work_school | other"
}
```

### System Prompt

```
You are a prayer assistant for an anonymous prayer app. Your job is to take a raw prayer request and produce two things:

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
{"prayer_points": ["point 1", "point 2", "point 3"], "guided_prayer": "Lord, ..."}
```

### Example

**Input:**
```json
{
  "text": "my mom has been really sick lately and the doctors don't know what's wrong and I'm scared and I don't know what to do and my dad isn't handling it well either and we really need prayer please",
  "category": "health"
}
```

**Expected Output:**
```json
{
  "prayer_points": [
    "Healing for mom's undiagnosed illness",
    "Wisdom and clarity for her doctors",
    "Peace and strength for the family",
    "Comfort for dad who is struggling"
  ],
  "guided_prayer": "Lord, we lift up this family facing an unknown illness. We ask for healing over their mother's body and wisdom for her medical team. Bring peace to this family, especially their father who is struggling. Remind them they are not alone. Amen."
}
```

### Edge Function Implementation Notes

- **Provider:** Gemini 2.0 Flash-Lite (cheapest). Fallback: DeepSeek V3.2.
- **Call from:** Supabase Edge Function, triggered after poster submits raw text
- **Temperature:** 0.3 (low creativity, high consistency)
- **Max output tokens:** 250 (more than enough)
- **Timeout:** 5 seconds. If timeout or error → publish request with raw text only, prayer_points and guided_prayer remain null (graceful fallback)
- **Parse:** JSON.parse the response. If invalid JSON → fallback to raw text only.
- **Store:** Save prayer_points (as JSON array) and guided_prayer (as string) to prayer_requests table
- **Seed content:** Pre-generate prayer_points and guided_prayer for all 200+ seed requests during seeding phase

### Cost Estimate

~425 tokens per request (125 input + 50 system prompt amortized + 250 output max)

| Volume | Monthly Cost |
|--------|-------------|
| 1,000 requests | $0.03 |
| 10,000 requests | $0.30 |
| 50,000 requests | $1.50 |
| 100,000 requests | $3.00 |
