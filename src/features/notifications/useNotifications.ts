import { useCallback, useState } from "react";
import {
  fetchNotifications,
  markNotificationsAsRead,
  type Notification,
} from "@/src/features/notifications/notificationsApi";
import { getUserFacingErrorMessage } from "@/src/shared/api/getUserFacingErrorMessage";

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchNotifications();
      setNotifications(
        [...list].sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        ),
      );
      return list;
    } catch (e: unknown) {
      setError(getUserFacingErrorMessage(e, "Could not load notifications"));
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const markRead = useCallback(async (id: string) => {
    try {
      await markNotificationsAsRead([id]);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (e: unknown) {
      setError(getUserFacingErrorMessage(e, "Could not mark notification as read"));
    }
  }, []);

  const markAllRead = useCallback(async () => {
    const ids = notifications.map((n) => n.id);
    if (ids.length === 0) return;
    try {
      await markNotificationsAsRead(ids);
      setNotifications([]);
    } catch (e: unknown) {
      setError(getUserFacingErrorMessage(e, "Could not mark notifications as read"));
    }
  }, [notifications]);

  return {
    notifications,
    loading,
    error,
    load,
    markRead,
    markAllRead,
    setNotifications,
  };
}
