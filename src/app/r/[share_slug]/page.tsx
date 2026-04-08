import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionId } from "@/lib/session";
import { PrayerDetail } from "@/components/prayer-detail";
import type { PrayerRequest } from "@/lib/types/database";

const CATEGORY_LABELS: Record<string, string> = {
  health: "Health",
  family: "Family",
  grief: "Grief",
  finances: "Finances",
  inner_struggle: "Inner Struggle",
  work: "Work",
  school: "School",
  other: "Other",
};

interface PageProps {
  params: Promise<{ share_slug: string }>;
}

async function getPrayer(shareSlug: string): Promise<PrayerRequest | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("prayer_requests")
    .select("*")
    .eq("share_slug", shareSlug)
    .single();
  return data as PrayerRequest | null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { share_slug } = await params;
  const prayer = await getPrayer(share_slug);

  if (!prayer) {
    return { title: "Prayer not found" };
  }

  const categoryLabel = prayer.category
    .map((c) => CATEGORY_LABELS[c] ?? c)
    .join(", ");
  const textPreview =
    prayer.text.length > 60
      ? prayer.text.slice(0, 60) + "..."
      : prayer.text;

  return {
    title: "Someone needs prayer",
    description: `${categoryLabel} — ${textPreview}`,
    openGraph: {
      title: "Someone needs prayer",
      description: `${categoryLabel} — ${textPreview}`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: "Someone needs prayer",
      description: `${categoryLabel} — ${textPreview}`,
    },
  };
}

export default async function PrayerDetailPage({ params }: PageProps) {
  const { share_slug } = await params;
  const prayer = await getPrayer(share_slug);

  if (!prayer) {
    notFound();
  }

  if (prayer.status === "removed") {
    notFound();
  }

  const sessionId = await getSessionId();
  const isOwner = sessionId === prayer.session_id;

  // Check if current user already prayed
  let hasPrayed = false;
  if (sessionId) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("prayer_taps")
      .select("id")
      .eq("request_id", prayer.id)
      .eq("session_id", sessionId)
      .limit(1);
    hasPrayed = (data?.length ?? 0) > 0;
  }

  return (
    <main className="flex flex-col min-h-screen max-w-lg mx-auto px-4 py-6">
      <PrayerDetail
        prayer={prayer}
        isOwner={isOwner}
        initialPrayed={hasPrayed}
      />
    </main>
  );
}
