import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CalendarMonthNavigator } from "@/src/features/calendar/CalendarMonthNavigator";
import { formatParticipantsSummary } from "@/src/features/calendar/EventParticipantsDisplay";
import { formatEventDateTime, formatMonthLabel } from "@/src/features/calendar/eventDateUtils";
import { useCalendarEvents } from "@/src/features/calendar/useCalendarEvents";
import { HomeItemRow, HomeSectionCard } from "@/src/features/home/HomeSectionCard";
import { SHOPPING_FAB_SIZE, ShoppingFab } from "@/src/features/shoppingList/ShoppingFab";
import { getUserFacingErrorMessage } from "@/src/shared/api/getUserFacingErrorMessage";
import { Screen } from "@/src/shared/components/Screen";
import { TAB_TOTAL_HEIGHT } from "@/src/shared/navigation/tabBarLayout";
import { colors } from "@/src/shared/theme/colors";
import { spacing } from "@/src/shared/theme/spacing";
import { routes } from "@/src/shared/routes";

const FAB_GAP_ABOVE_TAB = 24;

export default function CalendarTab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { year, month, events, loading, error, goPrevMonth, goNextMonth, refetch } =
    useCalendarEvents();
  const [refreshing, setRefreshing] = useState(false);

  const fabMarginBottom =
    Platform.OS === "android"
      ? FAB_GAP_ABOVE_TAB
      : TAB_TOTAL_HEIGHT + Math.max(insets.bottom, 6) + FAB_GAP_ABOVE_TAB;

  async function onRefresh() {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <Screen withStackHeader edges={["left", "right"]}>
      <View style={styles.page}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: fabMarginBottom + SHOPPING_FAB_SIZE + 16 },
          ]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />
          }
          showsVerticalScrollIndicator={false}
        >
          <CalendarMonthNavigator
            label={formatMonthLabel(year, month)}
            onPrev={goPrevMonth}
            onNext={goNextMonth}
          />

          {loading && !refreshing ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={colors.textPrimary} />
            </View>
          ) : null}

          {error ? (
            <View style={styles.centered}>
              <Text style={styles.errorText}>
                {getUserFacingErrorMessage(error, "Could not load events.")}
              </Text>
              <Pressable style={styles.retryButton} onPress={() => void refetch()}>
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            </View>
          ) : null}

          {!error ? (
            <HomeSectionCard title="Events this month">
              {events.length === 0 && !loading ? (
                <HomeItemRow>
                  <Text style={styles.emptyText}>No events this month</Text>
                </HomeItemRow>
              ) : (
                events.map((e) => (
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
                      <Text style={styles.eventTitle}>{e.name}</Text>
                      <Text style={styles.eventMeta}>
                        {formatEventDateTime(e.startTime)} – {formatEventDateTime(e.endTime)}
                      </Text>
                      <Text style={styles.eventParticipants} numberOfLines={2}>
                        {formatParticipantsSummary(e)}
                      </Text>
                    </HomeItemRow>
                  </Pressable>
                ))
              )}
            </HomeSectionCard>
          ) : null}
        </ScrollView>

        <View style={[styles.fabAnchor, { marginBottom: fabMarginBottom }]}>
          <ShoppingFab
            onPress={() => router.push(routes.modals.addEvent)}
            accessibilityLabel="Add event"
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: 8,
    gap: 20,
  },
  fabAnchor: {
    position: "absolute",
    right: 20,
    bottom: 0,
    zIndex: 10,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    gap: 12,
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: "center",
    fontSize: 14,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  eventMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  eventParticipants: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  errorText: {
    color: colors.error,
    textAlign: "center",
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 999,
    backgroundColor: colors.button,
  },
  retryText: {
    color: colors.white,
    fontWeight: "600",
  },
});
