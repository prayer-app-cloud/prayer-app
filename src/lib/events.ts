"use server";

import { createClient } from "@/lib/supabase/server";

export async function logEvent(
  sessionId: string | null,
  eventType: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.from("events").insert({
      session_id: sessionId,
      event_type: eventType,
      metadata,
    });
  } catch (err) {
    console.error("[logEvent] Failed:", eventType, err);
  }
}
