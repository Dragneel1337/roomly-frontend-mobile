import { isRunningInExpoGo } from "expo";
import * as SecureStore from "expo-secure-store";
import {
  fetchNotifications,
  type Notification,
} from "@/src/features/notifications/notificationsApi";

const LAST_SEEN_KEY = "roomly.lastSeenNotificationIds";

async function loadLastSeenIds(): Promise<Set<string>> {
  const raw = await SecureStore.getItemAsync(LAST_SEEN_KEY);
  if (!raw) return new Set();
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id): id is string => typeof id === "string"));
  } catch {
    return new Set();
  }
}

async function saveLastSeenIds(ids: Set<string>): Promise<void> {
  await SecureStore.setItemAsync(LAST_SEEN_KEY, JSON.stringify([...ids]));
}

export async function syncNotificationsFromServer(): Promise<Notification[]> {
  const list = await fetchNotifications();
  const lastSeen = await loadLastSeenIds();
  const currentIds = new Set(list.map((n) => n.id));

  if (!isRunningInExpoGo()) {
    const { presentSystemNotification } = await import(
      "@/src/features/notifications/systemNotifications"
    );
    for (const notification of list) {
      if (!lastSeen.has(notification.id)) {
        await presentSystemNotification(notification);
      }
    }
  }

  await saveLastSeenIds(currentIds);
  return list;
}

export async function clearNotificationSyncState(): Promise<void> {
  await SecureStore.deleteItemAsync(LAST_SEEN_KEY);
}
