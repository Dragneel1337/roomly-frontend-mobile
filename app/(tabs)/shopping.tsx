import { useRouter, type Href } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHousehold } from "@/src/features/household/HouseholdProvider";
import { useHouseholdResources } from "@/src/features/household/useHouseholdResources";
import { SHOPPING_FAB_SIZE, ShoppingFab } from "@/src/features/shoppingList/ShoppingFab";
import { ShoppingListSection } from "@/src/features/shoppingList/ShoppingListSection";
import { ListAccordion } from "@/src/shared/components/ListAccordion";
import { getUserFacingErrorMessage } from "@/src/shared/api/getUserFacingErrorMessage";
import { Screen } from "@/src/shared/components/Screen";
import { TAB_TOTAL_HEIGHT } from "@/src/shared/navigation/tabBarLayout";
import { routes } from "@/src/shared/routes";
import { colors } from "@/src/shared/theme/colors";

const FAB_GAP_ABOVE_TAB = 24;

export default function ShoppingTab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { activeHouseholdId, activeProfileId } = useHousehold();
  const { resources, loading, error, refetch } = useHouseholdResources();
  const [showOtherLists, setShowOtherLists] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  function openAddProductSearch() {
    if (!resources) return;
    router.push({
      pathname: routes.modals.addShoppingItem,
      params: {
        ownShoppingListId: String(resources.own.shoppingListId),
        sharedShoppingListId: String(resources.sharedShoppingListId),
      },
    } as Href);
  }

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

  if (activeHouseholdId == null || activeProfileId == null) {
    return (
      <Screen withStackHeader edges={["left", "right"]}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Shopping list is not available.</Text>
        </View>
      </Screen>
    );
  }

  if (loading && !resources) {
    return (
      <Screen withStackHeader edges={["left", "right"]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      </Screen>
    );
  }

  if (!resources) {
    return (
      <Screen withStackHeader edges={["left", "right"]}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>
            {error
              ? getUserFacingErrorMessage(error, "Could not load household lists.")
              : "Could not load household lists."}
          </Text>
          <Pressable style={styles.retryButton} onPress={() => void refetch()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </Screen>
    );
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
        >
          <ListAccordion title="My list" defaultExpanded>
            <ShoppingListSection
              title="My list"
              shoppingListId={resources.own.shoppingListId}
              inventoryId={resources.own.inventoryId}
              canEdit
              showTitle={false}
            />
          </ListAccordion>

          <ListAccordion title="Shared list" defaultExpanded>
            <ShoppingListSection
              title="Shared list"
              shoppingListId={resources.sharedShoppingListId}
              inventoryId={resources.sharedInventoryId}
              canEdit
              showTitle={false}
            />
          </ListAccordion>

          {resources.others.length > 0 && (
            <View style={styles.othersToggle}>
              <Text style={styles.othersLabel}>Other members&apos; lists</Text>
              <Switch value={showOtherLists} onValueChange={setShowOtherLists} />
            </View>
          )}

          {showOtherLists &&
            resources.others.map((member) => (
              <ListAccordion
                key={member.profileId}
                title={member.nickname}
                defaultExpanded={false}
              >
                <ShoppingListSection
                  title={member.nickname}
                  shoppingListId={member.shoppingListId}
                  inventoryId={member.inventoryId}
                  canEdit={false}
                  showTitle={false}
                />
              </ListAccordion>
            ))}
        </ScrollView>
        <View style={[styles.fabAnchor, { marginBottom: fabMarginBottom }]}>
          <ShoppingFab onPress={openAddProductSearch} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  fabAnchor: {
    position: "absolute",
    right: 20,
    bottom: 0,
    zIndex: 10,
  },
  scrollContent: { paddingHorizontal: 20, gap: 20, paddingTop: 8 },
  pageTitle: { fontSize: 22, fontWeight: "700" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20, gap: 12 },
  othersToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  othersLabel: { fontSize: 15, fontWeight: "600", color: colors.textPrimary },
  errorText: { color: "#dc2626", textAlign: "center" },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#2563eb",
  },
  retryButtonText: { color: "#fff", fontWeight: "600" },
});
