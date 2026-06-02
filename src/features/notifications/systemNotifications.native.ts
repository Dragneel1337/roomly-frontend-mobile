import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import type { Notification } from "@/src/features/notifications/notificationsApi";

export type NotificationSubscription = { remove: () => void };

let configured = false;

export function configureNotifications(): void {
  if (configured) return;
  configured = true;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function ensureNotificationChannel(): Promise<void> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("roomly", {
      name: "Roomly",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

export async function requestNotificationPermissions(): Promise<boolean> {
  configureNotifications();
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") {
    await ensureNotificationChannel();
    return true;
  }
  const { status } = await Notifications.requestPermissionsAsync();
  if (status === "granted") {
    await ensureNotificationChannel();
    return true;
  }
  return false;
}

export async function presentSystemNotification(notification: Notification): Promise<void> {
  configureNotifications();
  await ensureNotificationChannel();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: notification.title,
      body: notification.message,
      data: { notificationId: notification.id },
    },
    trigger: null,
  });
}

export function addNotificationResponseListener(
  onResponse: (notificationId: string | undefined) => void,
): NotificationSubscription {
  return Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data;
    const id =
      typeof data?.notificationId === "string" ? data.notificationId : undefined;
    onResponse(id);
  });
}
