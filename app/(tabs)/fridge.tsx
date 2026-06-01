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
import { useHousehold } from "@/src/features/household/HouseholdProvider";
import { useHouseholdResources } from "@/src/features/household/useHouseholdResources";
import { InventorySection } from "@/src/features/inventory/InventorySection";
import { ListAccordion } from "@/src/shared/components/ListAccordion";
import { getUserFacingErrorMessage } from "@/src/shared/api/getUserFacingErrorMessage";
import { Screen } from "@/src/shared/components/Screen";

export default function FridgeTab() {
  const { activeHouseholdId, activeProfileId } = useHousehold();
  const { resources, loading, error, refetch } = useHouseholdResources();
  const [refreshing, setRefreshing] = useState(false);

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
      <Screen withStackHeader>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Fridge is not available.</Text>
        </View>
      </Screen>
    );
  }

  if (loading && !resources) {
    return (
      <Screen withStackHeader>
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      </Screen>
    );
  }

  if (!resources) {
    return (
      <Screen withStackHeader>
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
    <Screen withStackHeader>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />
        }
      >
        <Text style={styles.pageTitle}>Fridge</Text>

        <ListAccordion title="My fridge" defaultExpanded>
          <InventorySection
            title="My fridge"
            listLabel="My fridge"
            inventoryId={resources.own.inventoryId}
            showTitle={false}
          />
        </ListAccordion>

        <ListAccordion title="Shared fridge" defaultExpanded>
          <InventorySection
            title="Shared fridge"
            listLabel="Shared fridge"
            inventoryId={resources.sharedInventoryId}
            showTitle={false}
          />
        </ListAccordion>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 20, paddingBottom: 32, gap: 20, paddingTop: 8 },
  pageTitle: { fontSize: 22, fontWeight: "700" },
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
