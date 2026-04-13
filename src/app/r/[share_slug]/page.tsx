import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionId } from "@/lib/session";
import { PrayerDetail } from "@/components/prayer-detail";
import { getCategoryStyle } from "@/lib/category-config";
import type { PrayerRequest, Update } from "@/lib/types/database";

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

  const title = prayer.title || "Someone needs prayer";
  const categoryLabel = prayer.category
    .map((c) => CATEGORY_LABELS[c] ?? c)
    .join(", ");
  const textPreview =
    prayer.text.length > 60
      ? prayer.text.slice(0, 60) + "..."
      : prayer.text;

  return {
    title,
    description: `${categoryLabel} — ${textPreview}`,
    openGraph: {
      title,
      description: `${categoryLabel} — ${textPreview}`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
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

  const supabase2 = await createClient();

  let hasPrayed = false;
  let hasFollowed = false;
  let updates: Update[] = [];

  // Fetch updates for this prayer
  const { data: updatesData } = await supabase2
    .from("updates")
    .select("*")
    .eq("request_id", prayer.id)
    .order("created_at", { ascending: true });
  updates = (updatesData ?? []) as Update[];

  if (sessionId) {
    const supabase3 = await createClient();
    const [prayedResult, followedResult] = await Promise.all([
      supabase3
        .from("prayer_taps")
        .select("id")
        .eq("request_id", prayer.id)
        .eq("session_id", sessionId)
        .limit(1),
      supabase3
        .from("prayer_follows")
        .select("id")
        .eq("prayer_request_id", prayer.id)
        .eq("user_session_id", sessionId)
        .limit(1),
    ]);
    hasPrayed = (prayedResult.data?.length ?? 0) > 0;
    hasFollowed = (followedResult.data?.length ?? 0) > 0;
  }

  const primaryCategory = prayer.category[0] ?? "other";
  const categoryImage = getCategoryStyle(primaryCategory).image;

  return (
    <main className="flex flex-col min-h-screen max-w-lg mx-auto">
      {/* Category illustration header */}
      <div className="relative w-full h-[120px] rounded-b-xl overflow-hidden">
        <Image
          src={categoryImage}
          alt={getCategoryStyle(primaryCategory).label}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      <div className="px-4 py-6">
        <PrayerDetail
          prayer={prayer}
          isOwner={isOwner}
          initialPrayed={hasPrayed}
          initialFollowed={hasFollowed}
          updates={updates}
        />
      </div>
    </main>
  );
}
