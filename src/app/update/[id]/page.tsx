import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionId } from "@/lib/session";
import { UpdatePrayerForm } from "@/components/update-prayer-form";

interface UpdateProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string }>;
}

export default async function UpdatePrayer({ params, searchParams }: UpdateProps) {
  const { id } = await params;
  const { type } = await searchParams;
  const sessionId = await getSessionId();

  if (!sessionId) {
    redirect("/");
  }

  const supabase = await createClient();
  const { data: prayer } = await supabase
    .from("prayer_requests")
    .select("id, session_id, share_slug, title, status")
    .eq("id", id)
    .single();

  // Not found or not the owner
  if (!prayer || prayer.session_id !== sessionId) {
    notFound();
  }

  // Already answered — redirect to detail page
  if (prayer.status === "answered") {
    redirect(`/r/${prayer.share_slug}`);
  }

  const initialType = type === "answered" ? "answered" : undefined;

  return (
    <main className="flex flex-col min-h-screen max-w-lg mx-auto px-4 py-6">
      <UpdatePrayerForm
        requestId={prayer.id}
        shareSlug={prayer.share_slug}
        title={prayer.title}
        initialType={initialType}
      />
    </main>
  );
}
