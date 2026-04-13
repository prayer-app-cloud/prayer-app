"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle, PencilSimpleLine, Clock } from "@phosphor-icons/react";
import { generateDisplayName } from "@/lib/display-names";
import {
  fetchMyPrayers,
  fetchFollowedPrayers,
  fetchAnsweredPrayersIPrayedFor,
  fetchFollowedCount,
  fetchJournalEntries,
  createJournalEntry,
  getReminder,
  setReminder,
} from "@/app/actions";
import { logEvent } from "@/lib/events";
import { getCategoryStyle, ANSWERED_GRADIENT } from "@/lib/category-config";
import { PREMIUM_CONFIG } from "@/lib/premium-config";
import { PremiumSheet, shouldShowPremium, meetsEngagementForPremium } from "@/components/premium-sheet";
import type { PrayerRequest, JournalEntry } from "@/lib/types/database";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function timeLeft(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours > 24) return `${Math.floor(hours / 24)}d left`;
  if (hours >= 1) return `${hours}h left`;
  return `${Math.floor(diff / (1000 * 60))}m left`;
}

function PrayerRow({ prayer, showStatus = false }: { prayer: PrayerRequest; showStatus?: boolean }) {
  const router = useRouter();
  const isAnswered = prayer.status === "answered";
  const isExpired = prayer.status === "expired";
  const catStyle = getCategoryStyle(prayer.category[0] ?? "other");

  return (
    <div
      onClick={() => router.push(`/r/${prayer.share_slug}`)}
      className={`rounded-xl p-4 cursor-pointer hover:bg-stone-50/30 transition-colors ${
        isAnswered
          ? "bg-amber-50/30 border-l-2 border-amber-300"
          : isExpired
            ? "bg-stone-50/50 opacity-60"
            : "bg-white border border-stone-100"
      }`}
    >
      <div className="flex items-center gap-1.5 text-xs text-stone-400 mb-1">
        <span className={`w-2 h-2 rounded-full ${catStyle.dotColor}`} />
        <span className={catStyle.chipText}>{catStyle.label}</span>
        {showStatus && isAnswered && (
          <span className="inline-flex text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 ml-1">
            Answered
          </span>
        )}
        {showStatus && isExpired && (
          <span className="text-stone-400 ml-1">Expired</span>
        )}
        {showStatus && prayer.status === "updated" && (
          <span className="text-stone-400 ml-1">Updated</span>
        )}
      </div>
      <p className="text-sm font-medium text-gray-900 leading-snug">
        {prayer.title || prayer.text.slice(0, 60)}
      </p>
      {isAnswered && prayer.update_text && (
        <p className="text-xs text-stone-500 italic mt-1 truncate">
          &#10003; {prayer.update_text}
        </p>
      )}
      <p className="text-xs text-stone-400 mt-1.5">
        {prayer.prayer_count} {prayer.prayer_count === 1 ? "prayer" : "prayers"}
        {!isExpired && !isAnswered && ` \u00b7 ${timeLeft(prayer.expires_at)}`}
        {(isAnswered || prayer.status === "updated") && ` \u00b7 ${timeAgo(prayer.updated_at)}`}
      </p>
    </div>
  );
}

export function MeTab() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [totalPrayed, setTotalPrayed] = useState(0);
  const [totalPosted, setTotalPosted] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [devMode, setDevMode] = useState(false);

  // Server data
  const [myPrayers, setMyPrayers] = useState<PrayerRequest[]>([]);
  const [followedPrayers, setFollowedPrayers] = useState<PrayerRequest[]>([]);
  const [answeredIPrayed, setAnsweredIPrayed] = useState<PrayerRequest[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Journal compose
  const [showJournalCompose, setShowJournalCompose] = useState(false);
  const [journalText, setJournalText] = useState("");
  const [journalSaving, setJournalSaving] = useState(false);

  // Reminders
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState("08:00");
  const [reminderSaved, setReminderSaved] = useState(false);

  // Premium
  const [showPremiumSheet, setShowPremiumSheet] = useState(false);

  useEffect(() => {
    setDisplayName(localStorage.getItem("displayName") ?? "Anonymous");
    setTotalPrayed(parseInt(localStorage.getItem("totalPrayed") ?? "0", 10));
    setTotalPosted(parseInt(localStorage.getItem("totalPosted") ?? "0", 10));
    setNotificationsEnabled(typeof Notification !== "undefined" && Notification.permission === "granted");
    setIsPremium(localStorage.getItem("premiumActive") === "true");
    setDevMode(localStorage.getItem("devMode") === "true");

    // Load server data
    Promise.all([
      fetchMyPrayers(),
      fetchFollowedPrayers(),
      fetchAnsweredPrayersIPrayedFor(),
      fetchFollowedCount(),
      fetchJournalEntries(),
      getReminder(),
    ]).then(([my, followed, answered, fCount, journal, reminder]) => {
      setMyPrayers(my);
      setFollowedPrayers(followed);
      setAnsweredIPrayed(answered);
      setFollowingCount(fCount);
      setJournalEntries(journal);
      if (reminder) {
        setReminderEnabled(reminder.enabled);
        setReminderTime(reminder.reminder_time);
      }
      setLoaded(true);
    });
  }, []);

  function startEdit() {
    setEditValue(displayName);
    setEditing(true);
  }

  function saveEdit() {
    const trimmed = editValue.trim();
    if (trimmed.length > 0) {
      setDisplayName(trimmed);
      localStorage.setItem("displayName", trimmed);
    }
    setEditing(false);
  }

  function shuffleName() {
    setEditValue(generateDisplayName());
  }

  async function toggleNotifications() {
    if (notificationsEnabled) {
      setNotificationsEnabled(false);
      return;
    }
    if (typeof Notification !== "undefined") {
      const result = await Notification.requestPermission();
      setNotificationsEnabled(result === "granted");
    }
  }

  async function handleReminderToggle() {
    const newEnabled = !reminderEnabled;
    setReminderEnabled(newEnabled);
    await setReminder(reminderTime, newEnabled);
    logEvent(null, "reminder_preference_changed", { time: reminderTime, enabled: newEnabled });
    if (newEnabled) {
      setReminderSaved(true);
      setTimeout(() => setReminderSaved(false), 3000);
    }
  }

  async function handleReminderTimeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newTime = e.target.value;
    setReminderTime(newTime);
    if (reminderEnabled) {
      await setReminder(newTime, true);
      logEvent(null, "reminder_preference_changed", { time: newTime, enabled: true });
      setReminderSaved(true);
      setTimeout(() => setReminderSaved(false), 3000);
    }
  }

  async function handleJournalSave() {
    if (journalText.trim().length === 0 || journalSaving) return;
    setJournalSaving(true);
    const result = await createJournalEntry(journalText);
    if (result.success) {
      setJournalText("");
      setShowJournalCompose(false);
      // Refresh journal
      const entries = await fetchJournalEntries();
      setJournalEntries(entries);
    }
    setJournalSaving(false);
  }

  function handleGatedTap(section: "journal" | "timeline") {
    if (isPremium) return; // no gate
    if (shouldShowPremium()) {
      setShowPremiumSheet(true);
    }
    // If engagement not met, soft message is shown inline (no sheet)
  }

  function handleResetOnboarding() {
    if (confirm("This will restart the onboarding flow. Continue?")) {
      localStorage.removeItem("onboarded");
      window.location.reload();
    }
  }

  function handleDeleteData() {
    if (confirm("This will clear all your local data. Are you sure?")) {
      localStorage.clear();
      window.location.reload();
    }
  }

  const freeJournal = PREMIUM_CONFIG.freeJournalEntries;
  const freeTimeline = PREMIUM_CONFIG.freeTimelineEntries;
  const visibleJournal = isPremium ? journalEntries : journalEntries.slice(0, freeJournal);
  const visibleTimeline = isPremium ? answeredIPrayed : answeredIPrayed.slice(0, freeTimeline);
  const journalGated = !isPremium && journalEntries.length > freeJournal;
  const timelineGated = !isPremium && answeredIPrayed.length > freeTimeline;
  const showGoDeeper = loaded && !isPremium && (journalEntries.length >= freeJournal || answeredIPrayed.length >= freeTimeline);
  const engagementMet = meetsEngagementForPremium();

  return (
    <div className="px-5 pb-24">
      {/* A. Display name + edit */}
      <div className="flex items-center gap-2">
        {editing ? (
          <div className="flex items-center gap-2 flex-1">
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              maxLength={30}
              autoFocus
              className="font-serif text-xl font-semibold text-gray-900 bg-transparent border-b border-amber-300 focus:outline-none flex-1"
            />
            <button onClick={shuffleName} className="text-xs text-stone-400 hover:text-stone-600">
              shuffle
            </button>
            <button onClick={saveEdit} className="text-xs text-amber-600 font-medium">
              Save
            </button>
          </div>
        ) : (
          <>
            <h1 className="font-serif text-xl font-semibold text-gray-900">{displayName}</h1>
            <button onClick={startEdit} className="text-xs text-amber-600">Edit</button>
          </>
        )}
      </div>

      {/* B. Stats row */}
      <div className="grid grid-cols-3 gap-3 mt-6">
        <div className="bg-white rounded-2xl p-4 border border-stone-100 text-center">
          <p className="font-serif text-2xl font-semibold text-gray-900 tabular-nums">{totalPrayed}</p>
          <p className="text-[11px] text-stone-400 mt-1">Prayers lifted</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-stone-100 text-center">
          <p className="font-serif text-2xl font-semibold text-gray-900 tabular-nums">{totalPosted}</p>
          <p className="text-[11px] text-stone-400 mt-1">Requests posted</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-stone-100 text-center">
          <p className="font-serif text-2xl font-semibold text-gray-900 tabular-nums">{followingCount}</p>
          <p className="text-[11px] text-stone-400 mt-1">Following</p>
        </div>
      </div>

      {/* C. My prayers */}
      <div className="mt-8">
        <p className="text-xs text-stone-400 uppercase tracking-wide font-medium mb-3">My prayers</p>
        {!loaded ? (
          <p className="text-sm text-stone-400 py-4">Loading...</p>
        ) : myPrayers.length === 0 ? (
          <Link
            href="/post"
            className="block bg-white rounded-xl border border-stone-100 p-5 text-center hover:bg-stone-50/30 transition-colors"
          >
            <p className="text-sm font-medium text-gray-800">Your first prayer is waiting</p>
            <p className="text-xs text-stone-400 mt-1">Share what&apos;s on your heart</p>
          </Link>
        ) : (
          <div className="space-y-2">
            {myPrayers.map((prayer) => (
              <PrayerRow key={prayer.id} prayer={prayer} showStatus />
            ))}
          </div>
        )}
      </div>

      {/* D. Following */}
      <div className="mt-8">
        <p className="text-xs text-stone-400 uppercase tracking-wide font-medium mb-3">Following</p>
        {!loaded ? (
          <p className="text-sm text-stone-400 py-4">Loading...</p>
        ) : followedPrayers.length === 0 ? (
          <div className="bg-stone-50/50 rounded-xl p-5 text-center">
            <p className="text-sm text-stone-400">When you follow a prayer, it shows up here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {followedPrayers.map((prayer) => (
              <PrayerRow key={prayer.id} prayer={prayer} showStatus />
            ))}
          </div>
        )}
      </div>

      {/* E. Answered prayers timeline */}
      {loaded && answeredIPrayed.length > 0 && (
        <div className="mt-8">
          <p className="text-xs text-stone-400 uppercase tracking-wide font-medium mb-3">
            Answered prayers you were part of
          </p>
          <div className="space-y-0">
            {visibleTimeline.map((prayer) => {
              const catStyle = getCategoryStyle(prayer.category[0] ?? "other");
              return (
                <div
                  key={prayer.id}
                  onClick={() => router.push(`/r/${prayer.share_slug}`)}
                  className="flex gap-3 cursor-pointer hover:bg-amber-50/20 transition-colors py-3 first:pt-0"
                >
                  {/* Timeline line */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400 mt-1" />
                    <div className="w-0.5 flex-1 bg-amber-200/50" />
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0 pb-3">
                    <div className="flex items-center gap-1.5 text-xs mb-1">
                      <span className={`w-2 h-2 rounded-full ${catStyle.dotColor}`} />
                      <span className={catStyle.chipText}>{catStyle.label}</span>
                      <span className="text-stone-400">{timeAgo(prayer.updated_at)}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 leading-snug">
                      {prayer.title || prayer.text.slice(0, 60)}
                    </p>
                    {prayer.update_text && (
                      <p className="text-xs text-stone-600 italic mt-1 line-clamp-2">
                        &ldquo;{prayer.update_text}&rdquo;
                      </p>
                    )}
                    <p className="text-xs text-stone-400 mt-1">
                      {prayer.prayer_count} people prayed
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Gate message */}
          {timelineGated && (
            <div className="mt-2">
              {engagementMet ? (
                <button
                  onClick={() => handleGatedTap("timeline")}
                  className="text-xs text-amber-600 hover:text-amber-700"
                >
                  See {answeredIPrayed.length - freeTimeline} more answered prayers...
                </button>
              ) : (
                <p className="text-xs text-stone-400 italic">
                  More answered history unlocks after a few more sessions
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* F. Prayer Journal */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-stone-400 uppercase tracking-wide font-medium">Prayer journal</p>
          <button
            onClick={() => setShowJournalCompose(!showJournalCompose)}
            className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
          >
            <PencilSimpleLine size={12} />
            Write
          </button>
        </div>

        {/* Compose */}
        {showJournalCompose && (
          <div className="bg-white rounded-xl border border-stone-100 p-4 mb-3 animate-fade-in">
            <textarea
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="What's on your heart today?"
              autoFocus
              className="w-full rounded-lg border border-stone-200 bg-stone-50/50 px-3 py-2 text-sm text-gray-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-200 resize-none"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-stone-400 tabular-nums">{journalText.length}/500</span>
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowJournalCompose(false); setJournalText(""); }}
                  className="px-3 py-1.5 rounded-full text-xs text-stone-400 hover:text-stone-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleJournalSave}
                  disabled={journalText.trim().length === 0 || journalSaving}
                  className="px-4 py-1.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/60 disabled:opacity-50"
                >
                  {journalSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Entries */}
        {!loaded ? (
          <p className="text-sm text-stone-400 py-4">Loading...</p>
        ) : journalEntries.length === 0 ? (
          <div className="bg-stone-50/50 rounded-xl p-5 text-center">
            <p className="text-sm text-stone-400">
              After you pray, you can save a note here
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {visibleJournal.map((entry) => (
              <div key={entry.id} className="bg-white rounded-xl border border-stone-100 p-4">
                <p className="text-sm text-gray-800 leading-relaxed">{entry.text}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-stone-400">{timeAgo(entry.created_at)}</span>
                  {entry.prayer_request && (
                    <button
                      onClick={() => router.push(`/r/${(entry.prayer_request as { share_slug: string }).share_slug}`)}
                      className="text-xs text-amber-600 hover:text-amber-700 truncate"
                    >
                      {(entry.prayer_request as { title?: string; text?: string }).title
                        || (entry.prayer_request as { text?: string }).text?.slice(0, 30)}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Journal gate message */}
        {journalGated && (
          <div className="mt-2">
            {engagementMet ? (
              <button
                onClick={() => handleGatedTap("journal")}
                className="text-xs text-amber-600 hover:text-amber-700"
              >
                See {journalEntries.length - freeJournal} more entries...
              </button>
            ) : (
              <p className="text-xs text-stone-400 italic">
                More journal and answered history unlock after a few more sessions
              </p>
            )}
          </div>
        )}
      </div>

      {/* G. "Go deeper" card */}
      {showGoDeeper && engagementMet && (
        <div className="mt-8">
          <button
            onClick={() => setShowPremiumSheet(true)}
            className="w-full bg-amber-50/40 rounded-2xl p-5 border border-amber-100/40 text-center hover:bg-amber-50/60 transition-colors"
          >
            <p className="text-sm font-medium text-amber-800">Go deeper</p>
            <p className="text-xs text-stone-500 mt-1">Unlock your full prayer journal and answered timeline</p>
          </button>
        </div>
      )}

      {/* H. Settings */}
      <div className="mt-8">
        <p className="text-xs text-stone-400 uppercase tracking-wide font-medium mb-3">Settings</p>

        {/* Daily prayer reminder */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
            <Clock size={16} weight="thin" className="text-stone-400" />
            <span className="text-sm text-gray-700">Daily prayer reminder</span>
          </div>
          <button
            role="switch"
            aria-checked={reminderEnabled}
            onClick={handleReminderToggle}
            className={`relative w-10 h-6 rounded-full transition-colors ${
              reminderEnabled ? "bg-amber-500" : "bg-stone-200"
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
              reminderEnabled ? "translate-x-4" : "translate-x-0"
            }`} />
          </button>
        </div>
        {reminderEnabled && (
          <div className="flex items-center gap-3 pb-3">
            <input
              type="time"
              value={reminderTime}
              onChange={handleReminderTimeChange}
              className="text-sm text-gray-700 border border-stone-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
            {reminderSaved && (
              <span className="text-xs text-amber-600 animate-fade-in">
                Reminder set for {reminderTime}
              </span>
            )}
          </div>
        )}

        {/* Notification toggle */}
        <div className="flex items-center justify-between py-3">
          <span className="text-sm text-gray-700">Prayer notifications</span>
          <button
            role="switch"
            aria-checked={notificationsEnabled}
            onClick={toggleNotifications}
            className={`relative w-10 h-6 rounded-full transition-colors ${
              notificationsEnabled ? "bg-amber-500" : "bg-stone-200"
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
              notificationsEnabled ? "translate-x-4" : "translate-x-0"
            }`} />
          </button>
        </div>

        <button className="text-sm text-stone-500 py-2 block">About this app</button>
        {devMode && (
          <button onClick={handleResetOnboarding} className="text-xs text-stone-400 py-2 block">
            Reset onboarding
          </button>
        )}
        <button onClick={handleDeleteData} className="text-xs text-red-400 py-2 block">
          Delete my data
        </button>
      </div>

      {/* Premium bottom sheet */}
      {showPremiumSheet && (
        <PremiumSheet
          totalPrayed={totalPrayed}
          followingCount={followingCount}
          answeredCount={answeredIPrayed.length}
          onClose={() => setShowPremiumSheet(false)}
        />
      )}
    </div>
  );
}
