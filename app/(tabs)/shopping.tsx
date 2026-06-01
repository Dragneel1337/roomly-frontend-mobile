import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useHousehold } from "@/src/features/household/HouseholdProvider";
import { useHouseholdResources } from "@/src/features/household/useHouseholdResources";
import { ShoppingListSection } from "@/src/features/shoppingList/ShoppingListSection";
import { ListAccordion } from "@/src/shared/components/ListAccordion";
import { getUserFacingErrorMessage } from "@/src/shared/api/getUserFacingErrorMessage";
import { Screen } from "@/src/shared/components/Screen";

export default function ShoppingTab() {
  const { activeHouseholdId, activeProfileId } = useHousehold();
  const { resources, loading, error, refetch } = useHouseholdResources();
  const [showOtherLists, setShowOtherLists] = useState(false);
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
          <Text style={styles.errorText}>Shopping list is not available.</Text>
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
    <Screen withStackHeader>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />
        }
      >
        <Text style={styles.pageTitle}>Shopping</Text>

        <ListAccordion title="My list" defaultExpanded>
          <ShoppingListSection
            title="My list"
            listLabel="My list"
            shoppingListId={resources.own.shoppingListId}
            inventoryId={resources.own.inventoryId}
            canEdit
            showTitle={false}
          />
        </ListAccordion>

        <ListAccordion title="Shared list" defaultExpanded>
          <ShoppingListSection
            title="Shared list"
            listLabel="Shared list"
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
                listLabel={member.nickname}
                shoppingListId={member.shoppingListId}
                inventoryId={member.inventoryId}
                canEdit={false}
                showTitle={false}
              />
            </ListAccordion>
          ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 20, paddingBottom: 32, gap: 20, paddingTop: 8 },
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
  othersLabel: { fontSize: 15, fontWeight: "600", color: "#374151" },
  errorText: { color: "#dc2626", textAlign: "center" },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#2563eb",
  },
  retryButtonText: { color: "#fff", fontWeight: "600" },
});
