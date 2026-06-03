import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { moveItemsToInventory } from "@/src/features/inventory/moveToInventory";
import { formatProductMeta } from "@/src/features/product/productDisplay";
import { QuantityStepper } from "@/src/features/shoppingList/QuantityStepper";
import { useShoppingList } from "@/src/features/shoppingList/useShoppingList";
import { getUserFacingErrorMessage } from "@/src/shared/api/getUserFacingErrorMessage";
import { formStyles } from "@/src/shared/components/form/formStyles";
import { colors } from "@/src/shared/theme/colors";

type ShoppingListSectionProps = {
  title: string;
  shoppingListId: number;
  inventoryId: number;
  canEdit: boolean;
  listLabel?: string;
  showTitle?: boolean;
};

export function ShoppingListSection({
  title,
  shoppingListId,
  inventoryId,
  canEdit,
  showTitle = true,
}: ShoppingListSectionProps) {
  const {
    displayItems,
    loading,
    error,
    refetch,
    removeItem,
    incrementItem,
    decrementItem,
    updatingProductId,
  } = useShoppingList(shoppingListId);

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [actionError, setActionError] = useState<string | null>(null);
  const [moving, setMoving] = useState(false);

  const allProductIds = useMemo(
    () => displayItems.map((item) => item.product.id),
    [displayItems],
  );

  const allSelected =
    canEdit &&
    allProductIds.length > 0 &&
    allProductIds.every((id) => selectedIds.has(id));

  const toggleSelect = useCallback((productId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allProductIds));
    }
  }, [allProductIds, allSelected]);

  async function onRemove(productId: number, count: number) {
    setActionError(null);
    try {
      await removeItem(productId, count);
      setSelectedIds((prev) => {
        if (!prev.has(productId)) return prev;
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
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
        `Remove "${productName}" from the list?`,
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

  async function onMoveSelected() {
    const items = displayItems
      .filter((item) => selectedIds.has(item.product.id))
      .map((item) => ({ productId: item.product.id, count: item.count }));

    if (items.length === 0) return;

    setMoving(true);
    setActionError(null);
    const result = await moveItemsToInventory(items, shoppingListId, inventoryId);
    setMoving(false);

    if (!result.ok) {
      setActionError(result.message);
      await refetch();
      return;
    }

    setSelectedIds(new Set());
    await refetch();
  }

  async function onMoveOne(productId: number, count: number) {
    setMoving(true);
    setActionError(null);
    const result = await moveItemsToInventory(
      [{ productId, count }],
      shoppingListId,
      inventoryId,
    );
    setMoving(false);

    if (!result.ok) {
      setActionError(result.message);
      await refetch();
      return;
    }

    setSelectedIds((prev) => {
      if (!prev.has(productId)) return prev;
      const next = new Set(prev);
      next.delete(productId);
      return next;
    });
    await refetch();
  }

  return (
    <View style={styles.section}>
      {showTitle && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
      )}

      {canEdit && displayItems.length > 0 && (
        <View style={styles.toolbar}>
          <Pressable onPress={toggleSelectAll}>
            <Text style={styles.toolbarLink}>{allSelected ? "Clear all" : "Select all"}</Text>
          </Pressable>
          {selectedIds.size > 0 && (
            <Pressable
              style={[styles.moveButton, moving && styles.moveButtonDisabled]}
              disabled={moving}
              onPress={() => void onMoveSelected()}
            >
              <Text style={styles.moveButtonText}>
                {moving ? "Moving…" : `Move to fridge (${selectedIds.size})`}
              </Text>
            </Pressable>
          )}
        </View>
      )}

      {loading && displayItems.length === 0 ? (
        <ActivityIndicator style={styles.loader} />
      ) : error && displayItems.length === 0 ? (
        <Text style={styles.errorText}>
          {getUserFacingErrorMessage(error, "Could not load list.")}
        </Text>
      ) : displayItems.length === 0 ? (
        <Text style={styles.emptyText}>
          {canEdit ? "Empty — use the + button to add products." : "Empty."}
        </Text>
      ) : (
        <View style={styles.list}>
          {displayItems.map((item) => {
            const isUpdating = updatingProductId === item.product.id;
            const meta = formatProductMeta(item.product.brand, item.product.quantity);
            const selected = selectedIds.has(item.product.id);

            return (
              <View key={item.id} style={styles.item}>
                {canEdit && (
                  <Pressable
                    style={styles.checkbox}
                    onPress={() => toggleSelect(item.product.id)}
                  >
                    <Text style={styles.checkboxMark}>{selected ? "☑" : "☐"}</Text>
                  </Pressable>
                )}
                <View style={styles.itemBody}>
                  <Text style={styles.itemTitle}>{item.product.name}</Text>
                  {!!meta && <Text style={styles.itemMeta}>{meta}</Text>}
                  {!!item.notes && <Text style={styles.itemNotes}>{item.notes}</Text>}
                  {canEdit ? (
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
                        disabled={isUpdating || moving}
                      />
                      <Pressable
                        style={styles.moveOneButton}
                        disabled={isUpdating || moving}
                        onPress={() => void onMoveOne(item.product.id, item.count)}
                      >
                        <Text style={styles.moveOneText}>To fridge</Text>
                      </Pressable>
                      <Pressable
                        style={[styles.removeButton, isUpdating && styles.removeButtonDisabled]}
                        disabled={isUpdating || moving}
                        onPress={() => void onRemove(item.product.id, item.count)}
                      >
                        <Text style={styles.removeButtonText}>
                          {isUpdating ? "Syncing…" : "Remove"}
                        </Text>
                      </Pressable>
                    </View>
                  ) : (
                    <Text style={styles.readonlyCount}>Qty: {item.count}</Text>
                  )}
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
  sectionTitle: { fontSize: 16, fontWeight: "600", color: colors.textPrimary },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
  },
  toolbarLink: { color: "#2563eb", fontWeight: "600", fontSize: 14 },
  moveButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#ecfdf5",
  },
  moveButtonDisabled: { opacity: 0.6 },
  moveButtonText: { color: "#047857", fontWeight: "600", fontSize: 13 },
  loader: { marginVertical: 12 },
  errorText: { color: "#dc2626" },
  emptyText: { color: colors.textSecondary, fontStyle: "italic" },
  list: { gap: 10 },
  item: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
  },
  checkbox: { paddingTop: 2 },
  checkboxMark: { fontSize: 18 },
  itemBody: { flex: 1, gap: 4 },
  itemTitle: { fontSize: 16, fontWeight: "600" },
  itemMeta: { color: colors.textSecondary, fontSize: 14 },
  itemNotes: { color: colors.textSecondary, fontSize: 13, fontStyle: "italic" },
  itemActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
    flexWrap: "wrap",
  },
  moveOneButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#ecfdf5",
  },
  moveOneText: { color: "#047857", fontWeight: "600", fontSize: 13 },
  removeButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#fef2f2",
    marginLeft: "auto",
  },
  removeButtonDisabled: { opacity: 0.6 },
  removeButtonText: { color: "#dc2626", fontWeight: "600", fontSize: 13 },
  readonlyCount: { color: colors.textSecondary, marginTop: 4 },
});
