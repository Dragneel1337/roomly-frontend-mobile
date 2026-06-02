import { useFocusEffect, useRouter, type Href } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { formatProductMeta } from "@/src/features/shoppingList/productDisplay";
import { QuantityStepper } from "@/src/features/shoppingList/QuantityStepper";
import { useInventory } from "@/src/features/inventory/useInventory";
import { getUserFacingErrorMessage } from "@/src/shared/api/getUserFacingErrorMessage";
import { formStyles } from "@/src/shared/components/form/formStyles";
import { routes } from "@/src/shared/routes";

type InventorySectionProps = {
  title: string;
  inventoryId: number;
  listLabel: string;
  showTitle?: boolean;
};

export function InventorySection({
  title,
  inventoryId,
  listLabel,
  showTitle = true,
}: InventorySectionProps) {
  const router = useRouter();
  const {
    displayItems,
    loading,
    error,
    refetch,
    removeItem,
    incrementItem,
    decrementItem,
    updatingProductId,
  } = useInventory(inventoryId);

  const [actionError, setActionError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  function openAddModal() {
    setActionError(null);
    router.push({
      pathname: routes.modals.addFridgeItem,
      params: {
        inventoryId: String(inventoryId),
        title: listLabel,
      },
    } as Href);
  }

  async function onRemove(productId: number, count: number) {
    setActionError(null);
    try {
      await removeItem(productId, count);
    } catch (err) {
      setActionError(getUserFacingErrorMessage(err, "Could not remove item."));
    }
  }

  async function onIncrement(productId: number) {
    setActionError(null);
    try {
      await incrementItem(productId);
    } catch (err) {
      setActionError(getUserFacingErrorMessage(err, "Could not update quantity."));
    }
  }

  async function onDecrement(productId: number, currentCount: number, productName: string) {
    if (currentCount <= 1) {
      Alert.alert(
        "Remove product?",
        `Remove "${productName}" from the fridge?`,
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

    setActionError(null);
    try {
      await decrementItem(productId);
    } catch (err) {
      setActionError(getUserFacingErrorMessage(err, "Could not update quantity."));
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

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        {showTitle ? <Text style={styles.sectionTitle}>{title}</Text> : <View style={{ flex: 1 }} />}
        <Pressable style={styles.addButton} onPress={openAddModal}>
          <Text style={styles.addButtonText}>+</Text>
        </Pressable>
      </View>

      {loading && displayItems.length === 0 ? (
        <ActivityIndicator style={styles.loader} />
      ) : error && displayItems.length === 0 ? (
        <Text style={styles.errorText}>
          {getUserFacingErrorMessage(error, "Could not load fridge.")}
        </Text>
      ) : displayItems.length === 0 ? (
        <Text style={styles.emptyText}>Empty — tap + to add or scan a barcode.</Text>
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
                      onPress={() =>
                        Alert.alert(
                          "Remove product?",
                          `Remove "${item.product.name}" from the fridge?`,
                          [
                            { text: "Cancel", style: "cancel" },
                            {
                              text: "Remove",
                              style: "destructive",
                              onPress: () => void onRemove(item.product.id, item.count),
                            },
                          ],
                        )
                      }
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

      {!!actionError && <Text style={formStyles.submitError}>{actionError}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 8 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#374151" },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: { color: "#fff", fontSize: 22, fontWeight: "600", lineHeight: 24 },
  loader: { marginVertical: 12 },
  errorText: { color: "#dc2626" },
  emptyText: { color: "#6b7280", fontStyle: "italic" },
  list: { gap: 10 },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
  },
  itemBody: { gap: 6 },
  itemTitle: { fontSize: 16, fontWeight: "600" },
  itemMeta: { color: "#6b7280", fontSize: 14 },
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
});
