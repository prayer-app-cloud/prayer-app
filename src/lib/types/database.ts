export type CategoryEnum =
  | "health"
  | "family"
  | "grief"
  | "finances"
  | "inner_struggle"
  | "work"
  | "school"
  | "other";

export type RequestStatusEnum =
  | "active"
  | "updated"
  | "answered"
  | "removed"
  | "expired";

export type UrgencyEnum = "normal" | "high";

export type TapSourceEnum = "community" | "screen_lock" | "seed";

export type UpdateTypeEnum = "update" | "answered";

export type AuthMethodEnum = "anonymous" | "email";

export type ReportReasonEnum =
  | "spam"
  | "inappropriate"
  | "harmful"
  | "self_harm"
  | "other";

export type NotificationTypeEnum =
  | "prayer_received"
  | "request_answered"
  | "expiry_warning"
  | "milestone";

export interface PrayerRequest {
  id: string;
  text: string;
  category: CategoryEnum[];
  session_id: string;
  email: string | null;
  prayer_points: string | null;
  guided_prayer: string | null;
  prayer_count: number;
  share_count: number;
  report_count: number;
  status: RequestStatusEnum;
  anonymous: boolean;
  urgency: UrgencyEnum;
  update_text: string | null;
  expires_at: string;
  share_slug: string;
  is_seed: boolean;
  created_at: string;
  updated_at: string;
}

export interface PrayerTap {
  id: string;
  request_id: string;
  session_id: string;
  source: TapSourceEnum;
  created_at: string;
}

export interface Update {
  id: string;
  request_id: string;
  type: UpdateTypeEnum;
  text: string;
  is_seed: boolean;
  created_at: string;
}

export interface User {
  id: string;
  session_id: string;
  auth_method: AuthMethodEnum;
  email: string | null;
  notification_enabled: boolean;
  push_token: string | null;
  trust_score: number;
  strike_count: number;
  is_admin: boolean;
  created_at: string;
}

export interface Report {
  id: string;
  request_id: string;
  reason: ReportReasonEnum;
  reporter_session_id: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_session_id: string;
  type: NotificationTypeEnum;
  request_id: string;
  read: boolean;
  created_at: string;
}
