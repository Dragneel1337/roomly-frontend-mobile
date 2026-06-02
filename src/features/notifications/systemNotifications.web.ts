import type { Notification } from "@/src/features/notifications/notificationsApi";

export type NotificationSubscription = { remove: () => void };

export function configureNotifications(): void {}

export async function ensureNotificationChannel(): Promise<void> {}

export async function requestNotificationPermissions(): Promise<boolean> {
  return false;
}

export async function presentSystemNotification(_notification: Notification): Promise<void> {}

export function addNotificationResponseListener(
  _onResponse: (notificationId: string | undefined) => void,
): NotificationSubscription {
  return { remove: () => {} };
}
