import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session. If no session exists, create an anonymous one.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.log("[middleware] No user found, signing in anonymously...");
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) {
      console.error("[middleware] Anonymous sign-in failed:", error.message);
    } else {
      console.log("[middleware] Anonymous sign-in succeeded, user:", data.user?.id);
    }
  } else {
    console.log("[middleware] Existing user:", user.id);
  }

  return supabaseResponse;
}
