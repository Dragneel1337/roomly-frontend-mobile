import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useState } from "react";
import { formatParticipantsSummary } from "@/src/features/calendar/EventParticipantsDisplay";
import { formatEventDateTime, formatMonthLabel } from "@/src/features/calendar/eventDateUtils";
import { useCalendarEvents } from "@/src/features/calendar/useCalendarEvents";
import { Screen } from "@/src/shared/components/Screen";
import { routes } from "@/src/shared/routes";

export default function CalendarTab() {
  const router = useRouter();
  const { year, month, events, loading, error, goPrevMonth, goNextMonth, refetch } =
    useCalendarEvents();
  const [refreshing, setRefreshing] = useState(false);

  async function onRefresh() {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <Screen withStackHeader>
      <View style={styles.header}>
        <Pressable onPress={goPrevMonth} style={styles.navButton} accessibilityLabel="Previous month">
          <Text style={styles.navText}>‹</Text>
        </Pressable>
        <Text style={styles.monthLabel}>{formatMonthLabel(year, month)}</Text>
        <Pressable onPress={goNextMonth} style={styles.navButton} accessibilityLabel="Next month">
          <Text style={styles.navText}>›</Text>
        </Pressable>
      </View>

      <Pressable
        style={styles.addButton}
        onPress={() => router.push(routes.modals.addEvent)}
      >
        <Text style={styles.addButtonText}>Add event</Text>
      </Pressable>

      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading && !refreshing ? (
          <ActivityIndicator size="large" style={styles.loader} />
        ) : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {events.length === 0 && !loading ? (
          <Text style={styles.emptyText}>No events this month</Text>
        ) : (
          events.map((e) => (
            <Pressable
              key={e.id}
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: routes.modals.eventDetail,
                  params: { eventId: String(e.id) },
                })
              }
            >
              <Text style={styles.cardTitle}>{e.name}</Text>
              <Text style={styles.cardMeta}>
                {formatEventDateTime(e.startTime)} – {formatEventDateTime(e.endTime)}
              </Text>
              <Text style={styles.cardCreator} numberOfLines={2}>
                {formatParticipantsSummary(e)}
              </Text>
            </Pressable>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  navButton: {
    padding: 8,
    minWidth: 44,
    alignItems: "center",
  },
  navText: {
    fontSize: 28,
    fontWeight: "300",
    color: "#2563eb",
  },
  monthLabel: {
    fontSize: 18,
    fontWeight: "700",
  },
  addButton: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  list: {
    padding: 16,
    gap: 10,
    paddingBottom: 32,
  },
  loader: {
    marginVertical: 24,
  },
  emptyText: {
    color: "#6b7280",
    textAlign: "center",
    marginTop: 24,
  },
  card: {
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    gap: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  cardMeta: {
    fontSize: 13,
    color: "#6b7280",
  },
  cardCreator: {
    fontSize: 12,
    color: "#9ca3af",
  },
  errorText: {
    color: "#b91c1c",
  },
});
