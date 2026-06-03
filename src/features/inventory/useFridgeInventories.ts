import { useMemo } from "react";
import type { InventoryItem } from "./inventoryApi";
import { useInventory } from "./useInventory";

export type FridgeDisplayItem = {
  item: InventoryItem;
  inventoryId: number;
  isShared: boolean;
};

export function useFridgeInventories(
  ownInventoryId: number | undefined,
  sharedInventoryId: number | undefined,
) {
  const own = useInventory(ownInventoryId);
  const shared = useInventory(sharedInventoryId);

  const displayItems = useMemo((): FridgeDisplayItem[] => {
    const rows: FridgeDisplayItem[] = [];
    if (ownInventoryId != null) {
      for (const item of own.items) {
        rows.push({ item, inventoryId: ownInventoryId, isShared: false });
      }
    }
    if (sharedInventoryId != null) {
      for (const item of shared.items) {
        rows.push({ item, inventoryId: sharedInventoryId, isShared: true });
      }
    }
    return rows;
  }, [own.items, shared.items, ownInventoryId, sharedInventoryId]);

  const loading =
    (ownInventoryId != null && own.loading && own.items.length === 0) ||
    (sharedInventoryId != null && shared.loading && shared.items.length === 0);

  const error = own.error ?? shared.error;

  async function refetchAll() {
    await Promise.all([own.refetch(), shared.refetch()]);
  }

  return {
    displayItems,
    loading,
    error,
    refreshing: own.refreshing || shared.refreshing,
    refetch: refetchAll,
    own,
    shared,
  };
}
