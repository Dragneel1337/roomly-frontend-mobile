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
import { HomeItemRow, HomeSectionCard } from "@/src/features/home/HomeSectionCard";
import { useHomeFeed } from "@/src/features/home/useHomeFeed";
import { syncNotificationsFromServer } from "@/src/features/notifications/notificationSync";
import { Screen } from "@/src/shared/components/Screen";
import { colors } from "@/src/shared/theme/colors";
import { spacing } from "@/src/shared/theme/spacing";
import { routes } from "@/src/shared/routes";

const PREVIEW_COUNT = 2;

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
  } = useHomeFeed();
  const [refreshing, setRefreshing] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);

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

  const visibleNotifications = showAllNotifications
    ? notifications
    : notifications.slice(0, PREVIEW_COUNT);
  const visibleEvents = events.slice(0, PREVIEW_COUNT);

  return (
    <Screen withStackHeader>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {loading && !refreshing ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.textPrimary} />
          </View>
        ) : null}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <HomeSectionCard
          title="Latest notifications"
          footerLabel={
            notifications.length > PREVIEW_COUNT && !showAllNotifications
              ? "Show more"
              : undefined
          }
          onFooterPress={
            notifications.length > PREVIEW_COUNT && !showAllNotifications
              ? () => setShowAllNotifications(true)
              : undefined
          }
        >
          {notifications.length === 0 && !loading ? (
            <HomeItemRow>
              <Text style={styles.emptyText}>No recent changes</Text>
            </HomeItemRow>
          ) : (
            visibleNotifications.map((n) => (
              <Pressable key={n.id} onPress={() => void markRead(n.id)}>
                <HomeItemRow>
                  <Text style={styles.itemTitle}>{n.title}</Text>
                  <Text style={styles.itemBody} numberOfLines={2}>
                    {n.message}
                  </Text>
                  <Text style={styles.itemMeta}>{formatNotificationTime(n.timestamp)}</Text>
                </HomeItemRow>
              </Pressable>
            ))
          )}
        </HomeSectionCard>

        <HomeSectionCard
          title="Upcoming activities"
          footerLabel={events.length > PREVIEW_COUNT ? "Show more" : undefined}
          onFooterPress={
            events.length > PREVIEW_COUNT
              ? () => router.push(routes.tabs.calendar)
              : undefined
          }
        >
          {events.length === 0 && !loading ? (
            <HomeItemRow>
              <Text style={styles.emptyText}>No upcoming events</Text>
            </HomeItemRow>
          ) : (
            visibleEvents.map((e) => (
              <Pressable
                key={e.id}
                onPress={() =>
                  router.push({
                    pathname: routes.modals.eventDetail,
                    params: { eventId: String(e.id) },
                  })
                }
              >
                <HomeItemRow>
                  <Text style={styles.itemTitle}>{e.name}</Text>
                  {e.description ? (
                    <Text style={styles.itemBody} numberOfLines={2}>
                      {e.description}
                    </Text>
                  ) : null}
                  <Text style={styles.itemMeta}>{formatEventDateTime(e.startTime)}</Text>
                  <Text style={styles.itemMetaSecondary} numberOfLines={1}>
                    {formatParticipantsSummary(e)}
                  </Text>
                </HomeItemRow>
              </Pressable>
            ))
          )}
        </HomeSectionCard>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: 8,
    gap: 20,
    paddingBottom: 32,
  },
  centered: {
    paddingVertical: 24,
    alignItems: "center",
  },
  errorText: {
    color: colors.error,
    textAlign: "center",
  },
  emptyText: {
    color: colors.inputText,
    textAlign: "center",
    fontSize: 14,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  itemBody: {
    fontSize: 14,
    color: colors.textPrimary,
    marginTop: 2,
  },
  itemMeta: {
    fontSize: 12,
    color: colors.inputText,
    marginTop: 4,
  },
  itemMetaSecondary: {
    fontSize: 12,
    color: colors.inputText,
  },
});
