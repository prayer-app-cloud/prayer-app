import Link from "next/link";
import { PostForm } from "@/components/post-form";
import { getDisplayName } from "@/lib/session";

export default async function PostPrayer() {
  const displayName = await getDisplayName();

  return (
    <main className="flex flex-col min-h-screen max-w-lg mx-auto px-4 py-6">
      <header className="mb-6">
        <Link
          href="/"
          className="text-sm text-warm-gray hover:text-amber-600 transition-colors"
        >
          ← Back
        </Link>
        <h1 className="text-2xl font-semibold text-gray-800 mt-3">
          Share a prayer request
        </h1>
        <p className="text-sm text-warm-gray mt-1">
          Write what&apos;s on your heart. You can stay anonymous.
        </p>
      </header>

      <PostForm displayName={displayName} />
    </main>
  );
}
