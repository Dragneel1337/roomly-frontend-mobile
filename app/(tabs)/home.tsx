import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { formatParticipantsSummary } from "@/src/features/calendar/EventParticipantsDisplay";
import { formatEventDateTime } from "@/src/features/calendar/eventDateUtils";
import { useHomeFeed } from "@/src/features/home/useHomeFeed";
import { syncNotificationsFromServer } from "@/src/features/notifications/notificationSync";
import { Screen } from "@/src/shared/components/Screen";
import { routes } from "@/src/shared/routes";

function formatNotificationTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HomeTab() {
  const router = useRouter();
  const {
    notifications,
    events,
    loading,
    error,
    refetch,
    markRead,
    markAllRead,
  } = useHomeFeed();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void syncNotificationsFromServer().then(() => refetch());
    }, [refetch]),
  );

  async function onRefresh() {
    setRefreshing(true);
    try {
      await syncNotificationsFromServer();
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <Screen withStackHeader>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading && !refreshing ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" />
          </View>
        ) : null}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent changes</Text>
            {notifications.length > 0 ? (
              <Pressable onPress={() => void markAllRead()}>
                <Text style={styles.link}>Mark all as read</Text>
              </Pressable>
            ) : null}
          </View>
          {notifications.length === 0 && !loading ? (
            <Text style={styles.emptyText}>No recent changes</Text>
          ) : (
            notifications.map((n) => (
              <Pressable
                key={n.id}
                style={styles.card}
                onPress={() => void markRead(n.id)}
              >
                <Text style={styles.cardTitle}>{n.title}</Text>
                <Text style={styles.cardBody}>{n.message}</Text>
                <Text style={styles.cardMeta}>{formatNotificationTime(n.timestamp)}</Text>
              </Pressable>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming events</Text>
          {events.length === 0 && !loading ? (
            <Text style={styles.emptyText}>No upcoming events</Text>
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
                {e.description ? <Text style={styles.cardBody}>{e.description}</Text> : null}
                <Text style={styles.cardMeta}>{formatEventDateTime(e.startTime)}</Text>
                <Text style={styles.cardMetaSecondary} numberOfLines={2}>
                  {formatParticipantsSummary(e)}
                </Text>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 24,
    paddingBottom: 32,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  link: {
    color: "#2563eb",
    fontWeight: "600",
    fontSize: 14,
  },
  emptyText: {
    color: "#6b7280",
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
  cardBody: {
    color: "#374151",
  },
  cardMeta: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  cardMetaSecondary: {
    fontSize: 12,
    color: "#9ca3af",
  },
  centered: {
    paddingVertical: 24,
    alignItems: "center",
  },
  errorText: {
    color: "#b91c1c",
  },
});
