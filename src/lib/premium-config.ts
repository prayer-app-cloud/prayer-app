export const PREMIUM_CONFIG = {
  monthlyPriceCents: 399,
  yearlyPriceCents: 2999,
  currency: "USD",
  trialEnabled: true,
  trialLengthDays: 7,
  freeJournalEntries: 3,
  freeTimelineEntries: 3,
  engagementThresholds: {
    minPrayers: 5,
    minPosted: 2,
    minSessions: 3,
  },
  dismissCooldownMs: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export function formatPrice(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}
