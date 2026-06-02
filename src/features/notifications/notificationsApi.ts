import { getJsonAuth, postJsonAuth } from "@/src/shared/api/http";

export type Notification = {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  profileId: string;
};

export async function fetchNotifications(): Promise<Notification[]> {
  return getJsonAuth<Notification[]>("/api/notifications");
}

export async function markNotificationsAsRead(notificationIds: string[]): Promise<void> {
  if (notificationIds.length === 0) return;
  await postJsonAuth<void>("/api/notifications/markAsRead", notificationIds);
}
