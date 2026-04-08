const ADJECTIVES = [
  "Quiet", "Still", "Gentle", "Kind", "Steady",
  "Faithful", "Hopeful", "Tender", "Calm", "Warm",
];

const NOUNS = [
  "River", "Light", "Harbor", "Meadow", "Stone",
  "Rain", "Dawn", "Shore", "Breeze", "Garden",
];

export function generateDisplayName(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adj}${noun}`;
}
