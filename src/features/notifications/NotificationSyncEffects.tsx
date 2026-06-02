import { isRunningInExpoGo } from "expo";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { AppState, Platform, type AppStateStatus } from "react-native";
import { useAuth } from "@/src/features/auth/authContext";
import { syncNotificationsFromServer } from "@/src/features/notifications/notificationSync";
import { routes } from "@/src/shared/routes";

const SYNC_INTERVAL_MS = 90_000;

/**
 * Syncs REST notifications to the OS tray. In Expo Go we only refresh in-app state
 * (expo-notifications main entry registers push listeners and crashes on Android SDK 53+).
 */
export function NotificationSyncEffects() {
  const router = useRouter();
  const { isAuthenticated, isOnboardingComplete } = useAuth();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (Platform.OS === "web") return;
    if (!isAuthenticated || !isOnboardingComplete) return;

    let cancelled = false;

    async function runSync() {
      if (cancelled) return;
      try {
        await syncNotificationsFromServer();
      } catch {
        // ignore when offline or unauthorized
      }
    }

    if (isRunningInExpoGo()) {
      void runSync();
      const sub = AppState.addEventListener("change", (state: AppStateStatus) => {
        if (state === "active") void runSync();
      });
      return () => {
        cancelled = true;
        sub.remove();
      };
    }

    let responseSub: { remove: () => void } | null = null;

    void (async () => {
      const { requestNotificationPermissions, addNotificationResponseListener } =
        await import("@/src/features/notifications/systemNotifications");

      if (cancelled) return;

      const granted = await requestNotificationPermissions();
      if (granted && !cancelled) void runSync();

      responseSub = addNotificationResponseListener(() => {
        router.push(routes.tabs.home);
      });
    })();

    const sub = AppState.addEventListener("change", (state: AppStateStatus) => {
      if (state === "active") void runSync();
    });

    intervalRef.current = setInterval(() => void runSync(), SYNC_INTERVAL_MS);

    return () => {
      cancelled = true;
      sub.remove();
      responseSub?.remove();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAuthenticated, isOnboardingComplete, router]);

  return null;
}
