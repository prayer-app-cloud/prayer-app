"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  HandsPraying,
  CheckCircle,
  Bell,
  ArrowsClockwise,
  Clock,
  Star,
} from "@phosphor-icons/react";
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/app/actions";
import type { PrayerRequest, NotificationTypeEnum } from "@/lib/types/database";

interface NotificationItem {
  id: string;
  user_session_id: string;
  type: NotificationTypeEnum;
  request_id: string;
  read: boolean;
  created_at: string;
  prayer_request?: PrayerRequest | null;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getNotificationIcon(type: NotificationTypeEnum) {
  switch (type) {
    case "prayer_received":
      return <HandsPraying size={18} weight="duotone" className="text-amber-500" />;
    case "request_answered":
      return <CheckCircle size={18} weight="duotone" className="text-amber-600" />;
    case "request_updated":
      return <ArrowsClockwise size={18} weight="duotone" className="text-stone-500" />;
    case "expiry_warning":
      return <Clock size={18} weight="duotone" className="text-orange-500" />;
    case "milestone":
      return <Star size={18} weight="duotone" className="text-amber-500" />;
    default:
      return <Bell size={18} weight="duotone" className="text-stone-400" />;
  }
}

function getNotificationMessage(notif: NotificationItem): string {
  const title = notif.prayer_request?.title
    || notif.prayer_request?.text?.slice(0, 40)
    || "a prayer request";
  const truncatedTitle = title.length > 40 ? title.slice(0, 40) + "..." : title;

  switch (notif.type) {
    case "prayer_received":
      return `People are praying for your request: ${truncatedTitle}`;
    case "request_answered":
      return `A prayer you followed was answered: ${truncatedTitle}`;
    case "request_updated":
      return `Update on a prayer you're following: ${truncatedTitle}`;
    case "expiry_warning":
      return `Your prayer request expires in 12 hours`;
    case "milestone":
      return `People have prayed for your request: ${truncatedTitle}`;
    default:
      return "You have a new notification";
  }
}

export function NotificationInbox({
  onClose,
  onUnreadChange,
}: {
  onClose: () => void;
  onUnreadChange: (count: number) => void;
}) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  async function loadNotifications() {
    setLoading(true);
    const data = await fetchNotifications(50);
    setNotifications(data as NotificationItem[]);
    setLoading(false);
  }

  async function handleTap(notif: NotificationItem) {
    if (!notif.read) {
      await markNotificationRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
      );
      onUnreadChange(
        notifications.filter((n) => !n.read && n.id !== notif.id).length
      );
    }

    onClose();

    if (notif.prayer_request?.share_slug) {
      router.push(`/r/${notif.prayer_request.share_slug}`);
    }
  }

  async function handleMarkAllRead() {
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    onUnreadChange(0);
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-900/40 animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative w-full max-w-lg h-[80vh] rounded-t-3xl bg-[#FAF7F2] animate-slide-up-slow overflow-hidden flex flex-col">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-stone-300/40" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-stone-200/40">
          <h2 className="font-serif text-lg font-semibold text-gray-900">
            Notifications
          </h2>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-amber-600 hover:text-amber-700 font-medium"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm text-stone-400">Loading...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <Bell size={32} weight="thin" className="text-stone-300 mb-3" />
              <p className="text-sm text-stone-400 text-center">
                Nothing yet. We&apos;ll let you know when someone prays.
              </p>
            </div>
          ) : (
            <div>
              {notifications.map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => handleTap(notif)}
                  className={`
                    w-full text-left flex items-start gap-3 px-6 py-4
                    border-b border-stone-100/60
                    hover:bg-stone-50/50 transition-colors
                    ${!notif.read ? "bg-amber-50/20" : ""}
                  `}
                >
                  <div className="mt-0.5 shrink-0">
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${!notif.read ? "text-gray-900 font-medium" : "text-stone-600"}`}>
                      {getNotificationMessage(notif)}
                    </p>
                    <p className="text-xs text-stone-400 mt-1">
                      {timeAgo(notif.created_at)}
                    </p>
                  </div>
                  {!notif.read && (
                    <div className="mt-2 shrink-0">
                      <span className="w-2 h-2 rounded-full bg-amber-500 block" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
