import Link from "next/link";
import { PostForm } from "@/components/post-form";

export default function PostPrayer() {
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
          What do you need prayer for?
        </h1>
        <p className="text-sm text-warm-gray mt-1">
          No names needed. No one will comment or reply. Just prayer.
        </p>
      </header>

      <PostForm />
    </main>
  );
}
