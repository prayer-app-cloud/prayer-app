const PHONE_REGEX = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const URL_REGEX = /https?:\/\/[^\s]+|www\.[^\s]+|\b[a-zA-Z0-9.-]+\.(com|org|net|io|co|me|info)\b/i;

const BLOCKED_PATTERNS = [
  // Fundraising / solicitation
  /\b(venmo|cashapp|paypal|gofundme|donate|donation|send money|wire transfer|bitcoin|crypto wallet)\b/i,
  // Medical emergency directives
  /\b(call 911|go to the er|stop taking|take this medication)\b/i,
];

const HATE_TERMS = [
  /\b(nigger|nigga|kike|spic|wetback|chink|gook|fag{2,}ot|dyke|tranny|retard)\b/i,
];

const SEXUAL_CONTENT = [
  /\b(porn|pornography|sex ?tape|nudes|onlyfans|escort|hooker|prostitut)\b/i,
];

export type FilterResult =
  | { ok: true }
  | { ok: false; reason: string };

export function filterContent(text: string): FilterResult {
  if (PHONE_REGEX.test(text)) {
    return { ok: false, reason: "Phone numbers are not allowed for your safety." };
  }
  if (EMAIL_REGEX.test(text)) {
    return { ok: false, reason: "Email addresses are not allowed for your safety." };
  }
  if (URL_REGEX.test(text)) {
    return { ok: false, reason: "Links are not allowed." };
  }
  for (const pattern of HATE_TERMS) {
    if (pattern.test(text)) {
      return { ok: false, reason: "This content is not allowed." };
    }
  }
  for (const pattern of SEXUAL_CONTENT) {
    if (pattern.test(text)) {
      return { ok: false, reason: "This content is not allowed." };
    }
  }
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(text)) {
      return { ok: false, reason: "This type of content is not allowed." };
    }
  }
  return { ok: true };
}

const SELF_HARM_PATTERNS = [
  /\b(kill myself|end my life|want to die|suicidal|suicide|self[- ]?harm|cut myself|cutting myself|don'?t want to live|no reason to live)\b/i,
];

export function containsSelfHarm(text: string): boolean {
  return SELF_HARM_PATTERNS.some((p) => p.test(text));
}
