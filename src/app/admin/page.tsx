"use client";

import { useState, useCallback } from "react";
import {
  verifyAdmin,
  generateSeeds,
  clearSeeds,
  fetchAdminPrayers,
  updatePrayerCount,
  fetchAdminStats,
} from "./actions";
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

interface Stats {
  seedCount: number;
  organicCount: number;
  answeredCount: number;
  totalPrayers: number;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState(false);

  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCount, setEditCount] = useState("");
  const [filter, setFilter] = useState<"all" | "seed" | "organic">("all");

  const flash = useCallback((msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 4000);
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const result = await verifyAdmin(password);
    if (result.success) {
      setAuthed(true);
      setAuthError(false);
      refreshData();
    } else {
      setAuthError(true);
    }
  }

  async function refreshData() {
    setLoading(true);
    const [prayerResult, statsResult] = await Promise.all([
      fetchAdminPrayers(password),
      fetchAdminStats(password),
    ]);
    setPrayers(prayerResult.prayers);
    if (!statsResult.error) setStats(statsResult);
    setLoading(false);
  }

  async function handleGenerateSeeds() {
    if (!confirm("Generate seed prayer requests? This will add ~30 prayers to the database.")) return;
    setLoading(true);
    const result = await generateSeeds(password);
    if (result.success) {
      flash(`Generated ${result.count} seeds with ${result.answeredCount} answered updates.`);
      await refreshData();
    } else {
      flash(`Error: ${result.error}`);
    }
    setLoading(false);
  }

  async function handleClearSeeds() {
    if (!confirm("Delete ALL seed data? This cannot be undone.")) return;
    setLoading(true);
    const result = await clearSeeds(password);
    if (result.success) {
      flash("All seed data cleared.");
      await refreshData();
    } else {
      flash(`Error: ${result.error}`);
    }
    setLoading(false);
  }

  async function handleSaveCount(requestId: string) {
    const count = parseInt(editCount, 10);
    if (isNaN(count) || count < 0) {
      flash("Invalid count.");
      return;
    }
    const result = await updatePrayerCount(password, requestId, count);
    if (result.success) {
      setPrayers((prev) =>
        prev.map((p) => (p.id === requestId ? { ...p, prayer_count: count } : p))
      );
      setEditingId(null);
      flash("Prayer count updated.");
    } else {
      flash(`Error: ${result.error}`);
    }
  }

  const filtered = prayers.filter((p) => {
    if (filter === "seed") return p.is_seed;
    if (filter === "organic") return !p.is_seed;
    return true;
  });

  // ── Login screen ──
  if (!authed) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <form onSubmit={handleLogin} className="w-full max-w-xs space-y-4">
          <h1 className="text-2xl font-semibold text-gray-800 text-center">Admin Panel</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-base text-gray-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-200"
          />
          {authError && <p className="text-sm text-red-500 text-center">Wrong password.</p>}
          <button
            type="submit"
            className="w-full py-3 rounded-full text-base font-medium bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60 shadow-sm transition-colors"
          >
            Sign in
          </button>
        </form>
      </main>
    );
  }

  // ── Admin dashboard ──
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-gray-800">Admin Panel</h1>
        <button onClick={() => setAuthed(false)} className="text-sm text-stone-400 hover:text-stone-600">
          Sign out
        </button>
      </div>

      {/* Flash message */}
      {message && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-amber-50 text-amber-800 text-sm border border-amber-200/60">
          {message}
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard label="Seed requests" value={stats.seedCount} />
          <StatCard label="Organic requests" value={stats.organicCount} />
          <StatCard label="Answered" value={stats.answeredCount} />
          <StatCard label="Total prayers" value={stats.totalPrayers} />
        </div>
      )}

      {/* Seed controls */}
      <div className="flex flex-wrap gap-3 mb-8">
        <button
          onClick={handleGenerateSeeds}
          disabled={loading}
          className="px-5 py-2.5 rounded-full text-sm font-medium bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors disabled:opacity-50"
        >
          {loading ? "Working..." : "Generate seeds"}
        </button>
        <button
          onClick={handleClearSeeds}
          disabled={loading}
          className="px-5 py-2.5 rounded-full text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
        >
          Clear all seeds
        </button>
        <button
          onClick={refreshData}
          disabled={loading}
          className="px-5 py-2.5 rounded-full text-sm font-medium bg-stone-50 text-stone-500 hover:bg-stone-100 transition-colors disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {(["all", "seed", "organic"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === f
                ? "bg-stone-200 text-stone-700"
                : "bg-stone-50 text-stone-400 hover:bg-stone-100"
            }`}
          >
            {f === "all" ? `All (${prayers.length})` : f === "seed" ? `Seed (${prayers.filter((p) => p.is_seed).length})` : `Organic (${prayers.filter((p) => !p.is_seed).length})`}
          </button>
        ))}
      </div>

      {/* Prayer list */}
      <div className="space-y-2">
        {filtered.map((prayer) => (
          <div
            key={prayer.id}
            className={`rounded-xl border p-4 ${
              prayer.is_seed ? "border-stone-200 bg-stone-50/50" : "border-amber-200/50 bg-white"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {prayer.is_seed && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-stone-200 text-stone-500 uppercase tracking-wide">
                      Seed
                    </span>
                  )}
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full uppercase tracking-wide ${
                    prayer.status === "answered"
                      ? "bg-amber-100 text-amber-700"
                      : prayer.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-stone-100 text-stone-500"
                  }`}>
                    {prayer.status}
                  </span>
                  <span className="text-[11px] text-stone-400">
                    {prayer.category.map((c) => CATEGORY_LABELS[c] ?? c).join(", ")}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-800 truncate">
                  {prayer.title || prayer.text.slice(0, 60)}
                </p>
                <p className="text-xs text-stone-400 mt-0.5 truncate">{prayer.text}</p>
              </div>

              {/* Prayer count editor */}
              <div className="flex items-center gap-2 shrink-0">
                {editingId === prayer.id ? (
                  <>
                    <input
                      type="number"
                      value={editCount}
                      onChange={(e) => setEditCount(e.target.value)}
                      className="w-16 rounded border border-stone-200 px-2 py-1 text-sm text-center"
                      min={0}
                      max={9999}
                    />
                    <button
                      onClick={() => handleSaveCount(prayer.id)}
                      className="text-xs text-amber-600 hover:text-amber-700 font-medium"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-xs text-stone-400 hover:text-stone-600"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setEditingId(prayer.id);
                      setEditCount(String(prayer.prayer_count));
                    }}
                    className="text-sm text-stone-600 hover:text-amber-600 tabular-nums transition-colors"
                    title="Click to edit prayer count"
                  >
                    {prayer.prayer_count} prayed
                  </button>
                )}
              </div>
            </div>

            {prayer.update_text && (
              <div className="mt-2 px-3 py-2 rounded-lg bg-amber-50/50 text-xs text-stone-600">
                Update: {prayer.update_text}
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && !loading && (
          <p className="text-center text-sm text-stone-400 py-8">No prayers found.</p>
        )}
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white border border-stone-200 p-4 text-center">
      <p className="text-2xl font-semibold text-gray-800 tabular-nums">{value}</p>
      <p className="text-xs text-stone-400 mt-1">{label}</p>
    </div>
  );
}
