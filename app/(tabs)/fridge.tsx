import { useRouter, type Href } from "expo-router";
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
import { useHousehold } from "@/src/features/household/HouseholdProvider";
import { useHouseholdResources } from "@/src/features/household/useHouseholdResources";
import { FridgeFabMenu } from "@/src/features/inventory/FridgeFabMenu";
import { FridgeProductList } from "@/src/features/inventory/FridgeProductList";
import { useFridgeInventories } from "@/src/features/inventory/useFridgeInventories";
import { SHOPPING_FAB_SIZE } from "@/src/features/shoppingList/ShoppingFab";
import { getUserFacingErrorMessage } from "@/src/shared/api/getUserFacingErrorMessage";
import { Screen } from "@/src/shared/components/Screen";
import { TAB_TOTAL_HEIGHT } from "@/src/shared/navigation/tabBarLayout";
import { routes } from "@/src/shared/routes";

const FAB_GAP_ABOVE_TAB = 24;
const FAB_MENU_EXTRA = 120;

export default function FridgeTab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { activeHouseholdId, activeProfileId } = useHousehold();
  const { resources, loading, error, refetch } = useHouseholdResources();
  const [fabExpanded, setFabExpanded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const ownInventoryId = resources?.own.inventoryId;
  const sharedInventoryId = resources?.sharedInventoryId;
  const fridge = useFridgeInventories(ownInventoryId, sharedInventoryId);

  const fabMarginBottom =
    Platform.OS === "android"
      ? FAB_GAP_ABOVE_TAB
      : TAB_TOTAL_HEIGHT + Math.max(insets.bottom, 6) + FAB_GAP_ABOVE_TAB;

  const scrollBottomPad =
    fabMarginBottom + SHOPPING_FAB_SIZE + (fabExpanded ? FAB_MENU_EXTRA : 16);

  function openSearch() {
    if (!resources) return;
    setFabExpanded(false);
    router.push({
      pathname: routes.modals.addFridgeItem,
      params: {
        ownInventoryId: String(resources.own.inventoryId),
        sharedInventoryId: String(resources.sharedInventoryId),
      },
    } as Href);
  }

  function openScan() {
    if (!resources) return;
    setFabExpanded(false);
    router.push({
      pathname: routes.modals.addFridgeScan,
      params: {
        ownInventoryId: String(resources.own.inventoryId),
        sharedInventoryId: String(resources.sharedInventoryId),
      },
    } as Href);
  }

  async function onRefresh() {
    setRefreshing(true);
    try {
      await Promise.all([refetch(), fridge.refetch()]);
    } finally {
      setRefreshing(false);
    }
  }

  if (activeHouseholdId == null || activeProfileId == null) {
    return (
      <Screen withStackHeader edges={["left", "right"]}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Fridge is not available.</Text>
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
              ? getUserFacingErrorMessage(error, "Could not load fridge.")
              : "Could not load fridge."}
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
          contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollBottomPad }]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />
          }
        >
          <FridgeProductList
            items={fridge.displayItems}
            loading={fridge.loading}
            error={fridge.error}
            ownMember={resources.own}
            allMembers={resources.allMembers}
          />
        </ScrollView>
        <View style={[styles.fabAnchor, { marginBottom: fabMarginBottom }]}>
          <FridgeFabMenu
            expanded={fabExpanded}
            onToggle={() => setFabExpanded((v) => !v)}
            onSearch={openSearch}
            onScan={openScan}
          />
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
  scrollContent: { paddingHorizontal: 20, paddingTop: 8 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20, gap: 12 },
  errorText: { color: "#dc2626", textAlign: "center" },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#2563eb",
  },
  retryButtonText: { color: "#fff", fontWeight: "600" },
});
