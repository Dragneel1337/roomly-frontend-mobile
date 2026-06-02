import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { fetchEventsForMonth, type HouseholdEvent } from "@/src/features/calendar/eventsApi";
import { useHousehold } from "@/src/features/household/HouseholdProvider";
import { getUserFacingErrorMessage } from "@/src/shared/api/getUserFacingErrorMessage";

export function useCalendarEvents() {
  const { activeHouseholdId, isReady } = useHousehold();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [events, setEvents] = useState<HouseholdEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!activeHouseholdId) {
      setEvents([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setEvents(await fetchEventsForMonth(activeHouseholdId, year, month));
    } catch (e: unknown) {
      setError(getUserFacingErrorMessage(e, "Could not load events"));
    } finally {
      setLoading(false);
    }
  }, [activeHouseholdId, year, month]);

  useFocusEffect(
    useCallback(() => {
      if (!isReady) return;
      void load();
    }, [isReady, load]),
  );

  function goPrevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function goNextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  return {
    year,
    month,
    events,
    loading,
    error,
    goPrevMonth,
    goNextMonth,
    refetch: load,
  };
}
