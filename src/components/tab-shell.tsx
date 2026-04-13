"use client";

import { useState, useEffect } from "react";
import { SunHorizon, HandsPraying, UserCircle, Bell } from "@phosphor-icons/react";
import { Onboarding } from "@/components/onboarding";
import { TodayTab } from "@/components/today-tab";
import { PrayerRoomTab } from "@/components/prayer-room-tab";
import { MeTab } from "@/components/me-tab";
import { NotificationInbox } from "@/components/notification-inbox";
import { logEvent } from "@/lib/events";
import type { PrayerRequest } from "@/lib/types/database";

type Tab = "today" | "room" | "me";

const TABS: { id: Tab; label: string; Icon: typeof SunHorizon }[] = [
  { id: "today", label: "Today", Icon: SunHorizon },
  { id: "room", label: "Prayers", Icon: HandsPraying },
  { id: "me", label: "Me", Icon: UserCircle },
];

export function TabShell({
  initialPrayers,
  initialPrayedIds,
  initialFollowedIds,
  initialUnreadCount,
  featuredPrayer,
  myActivePrayers,
  dailyPrayer,
  followedWithUpdates,
  recentAnswered,
}: {
  initialPrayers: PrayerRequest[];
  initialPrayedIds: string[];
  initialFollowedIds: string[];
  initialUnreadCount: number;
  featuredPrayer: PrayerRequest | null;
  myActivePrayers: PrayerRequest[];
  dailyPrayer: PrayerRequest | null;
  followedWithUpdates: PrayerRequest[];
  recentAnswered: PrayerRequest | null;
}) {
  const [onboarded, setOnboarded] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("today");
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);

  useEffect(() => {
    const done = localStorage.getItem("onboarded") === "true";
    setOnboarded(done);

    // Handle ?premium=true secret param
    const params = new URLSearchParams(window.location.search);
    if (params.get("premium") === "true") {
      localStorage.setItem("premiumActive", "true");
    }
  }, []);

  // Don't render until we've checked localStorage
  if (onboarded === null) return null;

  if (!onboarded) {
    return (
      <Onboarding
        onComplete={(tab) => {
          setOnboarded(true);
          setActiveTab((tab as Tab) || "today");
        }}
      />
    );
  }

  function switchTab(tab: Tab) {
    setActiveTab(tab);
    logEvent(null, "tab_switched", { tab });
  }

  return (
    <div className="min-h-screen max-w-lg mx-auto">
      {/* Header with bell icon */}
      <div className="flex items-center justify-end px-5 pt-4">
        <button
          onClick={() => setShowNotifications(true)}
          className="relative p-2 rounded-full text-stone-400 hover:text-amber-600 hover:bg-stone-100 transition-colors"
        >
          <Bell size={22} weight={unreadCount > 0 ? "fill" : "light"} className={unreadCount > 0 ? "text-amber-600" : ""} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white" />
          )}
        </button>
      </div>

      {/* Notification inbox */}
      {showNotifications && (
        <NotificationInbox
          onClose={() => setShowNotifications(false)}
          onUnreadChange={setUnreadCount}
        />
      )}

      {/* Tab content */}
      {activeTab === "today" && (
        <TodayTab
          featuredPrayer={featuredPrayer}
          initialPrayed={featuredPrayer ? initialPrayedIds.includes(featuredPrayer.id) : false}
          myActivePrayers={myActivePrayers}
          dailyPrayer={dailyPrayer}
          dailyPrayerPrayed={dailyPrayer ? initialPrayedIds.includes(dailyPrayer.id) : false}
          followedWithUpdates={followedWithUpdates}
          recentAnswered={recentAnswered}
          onSwitchTab={switchTab}
        />
      )}
      {activeTab === "room" && (
        <PrayerRoomTab
          initialPrayers={initialPrayers}
          initialPrayedIds={initialPrayedIds}
          initialFollowedIds={initialFollowedIds}
          featuredPrayer={featuredPrayer}
        />
      )}
      {activeTab === "me" && <MeTab />}

      {/* Bottom tab bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-stone-200/40 z-50">
        <div className="max-w-lg mx-auto flex">
          {TABS.map(({ id, label, Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => switchTab(id)}
                className="flex-1 flex flex-col items-center py-2 pt-3"
              >
                <Icon
                  size={22}
                  weight={active ? "fill" : "light"}
                  className={active ? "text-amber-600" : "text-stone-400"}
                />
                <span className={`text-[10px] font-medium mt-1 ${active ? "text-amber-600" : "text-stone-400"}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
