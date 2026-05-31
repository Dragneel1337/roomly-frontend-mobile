import { useRouter, type Href } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useHousehold } from "@/src/features/household/HouseholdProvider";
import { formatProductMeta } from "@/src/features/shoppingList/productDisplay";
import { QuantityStepper } from "@/src/features/shoppingList/QuantityStepper";
import { useShoppingList } from "@/src/features/shoppingList/useShoppingList";
import { getUserFacingErrorMessage } from "@/src/shared/api/getUserFacingErrorMessage";
import { formStyles } from "@/src/shared/components/form/formStyles";
import { Screen } from "@/src/shared/components/Screen";
import { routes } from "@/src/shared/routes";

function CenterAddButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable style={styles.centerAddButton} onPress={onPress}>
      <Text style={styles.centerAddButtonText}>+</Text>
    </Pressable>
  );
}

export default function ShoppingTab() {
  const router = useRouter();
  const { profile } = useHousehold();
  const shoppingListId = profile?.shoppingList.id;
  const {
    displayItems,
    loading,
    refreshing,
    error,
    refetch,
    removeItem,
    incrementItem,
    decrementItem,
    updatingProductId,
  } = useShoppingList(shoppingListId);
  const [removeError, setRemoveError] = useState<string | null>(null);

  function openAddModal() {
    router.push(routes.modals.addShoppingItem as Href);
  }

  async function onRemove(productId: number, count: number) {
    setRemoveError(null);
    try {
      await removeItem(productId, count);
    } catch (err) {
      setRemoveError(getUserFacingErrorMessage(err, "Could not remove item."));
    }
  }

  async function onIncrement(productId: number) {
    setRemoveError(null);
    try {
      await incrementItem(productId);
    } catch (err) {
      setRemoveError(getUserFacingErrorMessage(err, "Could not update quantity."));
    }
  }

  async function onDecrement(productId: number, currentCount: number, productName: string) {
    if (currentCount <= 1) {
      Alert.alert(
        "Remove product?",
        `Remove "${productName}" from your shopping list?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: () => void onRemove(productId, currentCount),
          },
        ],
      );
      return;
    }

    setRemoveError(null);
    try {
      await decrementItem(productId);
    } catch (err) {
      setRemoveError(getUserFacingErrorMessage(err, "Could not update quantity."));
    }
  }

  function onQuantityChange(
    productId: number,
    productName: string,
    currentCount: number,
    nextCount: number,
  ) {
    if (nextCount > currentCount) void onIncrement(productId);
    else if (nextCount < currentCount) void onDecrement(productId, currentCount, productName);
  }

  if (shoppingListId == null) {
    return (
      <Screen withStackHeader>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Shopping list is not available.</Text>
        </View>
      </Screen>
    );
  }

  if (loading && displayItems.length === 0) {
    return (
      <Screen withStackHeader>
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Shopping</Text>
          </View>
          <View style={styles.centered}>
            <ActivityIndicator size="large" />
          </View>
          <CenterAddButton onPress={openAddModal} />
        </View>
      </Screen>
    );
  }

  if (error && displayItems.length === 0) {
    return (
      <Screen withStackHeader>
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Shopping</Text>
          </View>
          <View style={styles.centered}>
            <Text style={styles.errorText}>
              {getUserFacingErrorMessage(error, "Could not load shopping list.")}
            </Text>
            <Pressable style={styles.retryButton} onPress={() => void refetch()}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </View>
          <CenterAddButton onPress={openAddModal} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen withStackHeader>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Shopping</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => void refetch()} />
          }
        >
          {displayItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Your shopping list is empty</Text>
              <Text style={styles.emptySubtitle}>
                Search by name or scan a barcode to add products.
              </Text>
            </View>
          ) : (
            <View style={styles.list}>
              {displayItems.map((item) => {
                const isUpdating = updatingProductId === item.product.id;
                const meta = formatProductMeta(item.product.brand, item.product.quantity);
                return (
                  <View key={item.id} style={styles.item}>
                    <View style={styles.itemBody}>
                      <Text style={styles.itemTitle}>{item.product.name}</Text>
                      {!!meta && <Text style={styles.itemMeta}>{meta}</Text>}
                      {!!item.notes && <Text style={styles.itemNotes}>{item.notes}</Text>}
                      <View style={styles.itemActions}>
                        <QuantityStepper
                          value={item.count}
                          allowRemoveAtMin
                          onChange={(next) =>
                            onQuantityChange(
                              item.product.id,
                              item.product.name,
                              item.count,
                              next,
                            )
                          }
                          disabled={isUpdating}
                        />
                        <Pressable
                          style={[styles.removeButton, isUpdating && styles.removeButtonDisabled]}
                          disabled={isUpdating}
                          onPress={() => void onRemove(item.product.id, item.count)}
                        >
                          <Text style={styles.removeButtonText}>
                            {isUpdating ? "Syncing…" : "Remove"}
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>

        {!!removeError && <Text style={formStyles.submitError}>{removeError}</Text>}
        <CenterAddButton onPress={openAddModal} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingBottom: 20 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20, gap: 12 },
  headerRow: {
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: { fontSize: 22, fontWeight: "700" },
  scrollContent: { flexGrow: 1, paddingBottom: 80 },
  list: { gap: 10 },
  item: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
  },
  itemBody: { gap: 6 },
  itemTitle: { fontSize: 16, fontWeight: "600" },
  itemMeta: { color: "#6b7280", fontSize: 14 },
  itemNotes: { color: "#374151", fontSize: 13, fontStyle: "italic" },
  itemActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 4,
    flexWrap: "wrap",
  },
  removeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#fef2f2",
    marginLeft: "auto",
  },
  removeButtonDisabled: { opacity: 0.6 },
  removeButtonText: { color: "#dc2626", fontWeight: "600", fontSize: 13 },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 48, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: "600" },
  emptySubtitle: { color: "#6b7280", textAlign: "center" },
  centerAddButton: {
    position: "absolute",
    alignSelf: "center",
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  centerAddButtonText: { color: "#fff", fontSize: 28, fontWeight: "600", lineHeight: 30 },
  errorText: { color: "#dc2626", textAlign: "center" },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#2563eb",
  },
  retryButtonText: { color: "#fff", fontWeight: "600" },
});
