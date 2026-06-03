import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react";
import { useCallback, useState } from "react";
import { getUserFacingErrorMessage } from "@/src/shared/api/getUserFacingErrorMessage";
import { PRODUCT_BY_BARCODE } from "@/src/features/shoppingList/shoppingListApi";
import {
  ADD_PRODUCT_TO_INVENTORY,
  INVENTORY,
  REMOVE_PRODUCT_FROM_INVENTORY,
  type InventoryItem,
} from "./inventoryApi";

const PRODUCT_NOT_FOUND_MESSAGE = "No product found for this barcode.";

function getItemCount(items: InventoryItem[], productId: number): number {
  return items.find((item) => item.product.id === productId)?.count ?? 0;
}

export function useInventory(inventoryId: number | undefined) {
  const [updatingProductId, setUpdatingProductId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);

  const { data, loading, error, refetch, networkStatus } = useQuery(INVENTORY, {
    variables: { id: inventoryId! },
    skip: inventoryId == null,
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
  });

  const [lookupProduct] = useLazyQuery(PRODUCT_BY_BARCODE, {
    fetchPolicy: "network-only",
  });

  const [addProduct] = useMutation(ADD_PRODUCT_TO_INVENTORY);
  const [removeProduct] = useMutation(REMOVE_PRODUCT_FROM_INVENTORY);

  const items: InventoryItem[] = (data?.inventory.items ?? []).filter(
    (item): item is InventoryItem => item != null,
  );

  const refreshing = networkStatus === 4;

  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const fetchProductByBarcode = useCallback(
    async (barcode: string) => {
      const trimmed = barcode.trim();
      if (!trimmed) return null;

      const { data: productData, error: productError } = await lookupProduct({
        variables: { barcode: trimmed },
      });

      if (productError) throw productError;
      return productData?.product ?? null;
    },
    [lookupProduct],
  );

  const removeItem = useCallback(
    async (productId: number, count: number) => {
      if (inventoryId == null) return;

      setUpdatingProductId(productId);
      try {
        await removeProduct({
          variables: { productId, inventoryId, count },
        });
        await refetch();
      } catch {
        await refetch();
        throw new Error("Could not remove item.");
      } finally {
        setUpdatingProductId(null);
      }
    },
    [inventoryId, removeProduct, refetch],
  );

  const incrementItem = useCallback(
    async (productId: number) => {
      if (inventoryId == null) return;

      setUpdatingProductId(productId);
      try {
        await addProduct({
          variables: { productId, inventoryId, count: 1 },
        });
        await refetch();
      } catch {
        await refetch();
        throw new Error("Could not update quantity.");
      } finally {
        setUpdatingProductId(null);
      }
    },
    [inventoryId, addProduct, refetch],
  );

  const decrementItem = useCallback(
    async (productId: number) => {
      if (inventoryId == null) return;

      setUpdatingProductId(productId);
      try {
        await removeProduct({
          variables: { productId, inventoryId, count: 1 },
        });
        await refetch();
      } catch {
        await refetch();
        throw new Error("Could not update quantity.");
      } finally {
        setUpdatingProductId(null);
      }
    },
    [inventoryId, removeProduct, refetch],
  );

  const addByBarcode = useCallback(
    async (
      barcode: string,
      count = 1,
      options?: {
        targetInventoryId?: number;
        notes?: string | null;
      },
    ): Promise<{ ok: true } | { ok: false; message: string }> => {
      const listId = options?.targetInventoryId ?? inventoryId;
      if (listId == null) {
        return { ok: false, message: "Fridge is not available." };
      }

      const trimmed = barcode.trim();
      if (!trimmed) return { ok: false, message: "Enter a barcode." };
      if (count < 1) return { ok: false, message: "Quantity must be at least 1." };

      const notes = options?.notes?.trim() ? options.notes.trim() : null;

      setAdding(true);
      try {
        const { data: productData, error: productError } = await lookupProduct({
          variables: { barcode: trimmed },
        });

        if (productError) {
          return {
            ok: false,
            message: getUserFacingErrorMessage(productError, PRODUCT_NOT_FOUND_MESSAGE),
          };
        }

        const product = productData?.product;
        if (!product) return { ok: false, message: PRODUCT_NOT_FOUND_MESSAGE };

        await addProduct({
          variables: {
            productId: product.id,
            inventoryId: listId,
            count,
            notes,
          },
        });

        if (listId === inventoryId) {
          await refetch();
        }
        return { ok: true };
      } catch (err) {
        return {
          ok: false,
          message: getUserFacingErrorMessage(err, "Could not add product."),
        };
      } finally {
        setAdding(false);
      }
    },
    [inventoryId, lookupProduct, addProduct, refetch],
  );

  return {
    items,
    displayItems: items,
    loading: loading && !refreshing,
    refreshing,
    error,
    refetch: refresh,
    removeItem,
    incrementItem,
    decrementItem,
    updatingProductId,
    addByBarcode,
    fetchProductByBarcode,
    adding,
    getItemCount: (productId: number) => getItemCount(items, productId),
  };
}
