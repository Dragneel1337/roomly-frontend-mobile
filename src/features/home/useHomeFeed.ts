import { useCallback, useEffect, useState } from "react";
import { fetchUpcomingEvents, type HouseholdEvent } from "@/src/features/calendar/eventsApi";
import { useHousehold } from "@/src/features/household/HouseholdProvider";
import { useNotifications } from "@/src/features/notifications/useNotifications";
import { getUserFacingErrorMessage } from "@/src/shared/api/getUserFacingErrorMessage";

export function useHomeFeed() {
  const { activeHouseholdId, isReady } = useHousehold();
  const {
    notifications,
    loading: notificationsLoading,
    error: notificationsError,
    load: loadNotifications,
    markRead,
    markAllRead,
  } = useNotifications();
  const [events, setEvents] = useState<HouseholdEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    if (!activeHouseholdId) {
      setEvents([]);
      return;
    }
    setEventsLoading(true);
    setEventsError(null);
    try {
      setEvents(await fetchUpcomingEvents(activeHouseholdId));
    } catch (e: unknown) {
      setEventsError(getUserFacingErrorMessage(e, "Could not load upcoming events"));
    } finally {
      setEventsLoading(false);
    }
  }, [activeHouseholdId]);

  const load = useCallback(async () => {
    await Promise.all([loadNotifications(), loadEvents()]);
  }, [loadNotifications, loadEvents]);

  useEffect(() => {
    if (!isReady) return;
    void load();
  }, [isReady, load]);

  const loading = notificationsLoading || eventsLoading;
  const error = notificationsError ?? eventsError;

  return {
    notifications,
    events,
    loading,
    error,
    refetch: load,
    markRead,
    markAllRead,
  };
}
