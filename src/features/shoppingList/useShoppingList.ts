import { useApolloClient, useLazyQuery, useMutation, useQuery } from "@apollo/client/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getUserFacingErrorMessage } from "@/src/shared/api/getUserFacingErrorMessage";
import {
  ADD_PRODUCT_TO_SHOPPING_LIST,
  PRODUCT_BY_BARCODE,
  REMOVE_PRODUCT_FROM_SHOPPING_LIST,
  SHOPPING_LIST,
  type Product,
  type ShoppingListItem,
  type ShoppingListResult,
} from "./shoppingListApi";

const PRODUCT_NOT_FOUND_MESSAGE = "No product found for this barcode.";

function getItemCount(items: ShoppingListItem[], productId: number): number {
  return items.find((item) => item.product.id === productId)?.count ?? 0;
}

export function useShoppingList(shoppingListId: number | undefined) {
  const client = useApolloClient();
  const [updatingProductId, setUpdatingProductId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [optimisticCounts, setOptimisticCounts] = useState<Record<number, number>>({});

  const { data, loading, error, refetch, networkStatus } = useQuery(SHOPPING_LIST, {
    variables: { id: shoppingListId! },
    skip: shoppingListId == null,
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
  });

  const [lookupProduct] = useLazyQuery(PRODUCT_BY_BARCODE, {
    fetchPolicy: "network-only",
  });

  const [addProduct] = useMutation(ADD_PRODUCT_TO_SHOPPING_LIST);
  const [removeProduct] = useMutation(REMOVE_PRODUCT_FROM_SHOPPING_LIST);

  const items: ShoppingListItem[] = (data?.shoppingList.items ?? []).filter(
    (item): item is ShoppingListItem => item != null,
  );

  const displayItems = useMemo(() => {
    return items
      .map((item) => {
        const productId = item.product.id;
        const optimisticCount = optimisticCounts[productId];
        if (optimisticCount === 0) return null;
        const count = optimisticCount ?? item.count;
        return { ...item, count };
      })
      .filter((item): item is ShoppingListItem => item != null);
  }, [items, optimisticCounts]);

  useEffect(() => {
    setOptimisticCounts((prev) => {
      if (Object.keys(prev).length === 0) return prev;

      let changed = false;
      const next = { ...prev };

      for (const [productIdStr, optCount] of Object.entries(prev)) {
        const productId = Number(productIdStr);
        const item = items.find((entry) => entry.product.id === productId);

        if (optCount === 0) {
          if (!item) {
            delete next[productId];
            changed = true;
          }
          continue;
        }

        if (item != null && item.count === optCount) {
          delete next[productId];
          changed = true;
        }
      }

      return changed ? next : prev;
    });
  }, [items]);

  const refreshing = networkStatus === 4;

  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const clearOptimistic = useCallback((productId: number) => {
    setOptimisticCounts((prev) => {
      if (!(productId in prev)) return prev;
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  }, []);

  const setOptimisticCount = useCallback((productId: number, count: number) => {
    setOptimisticCounts((prev) => ({ ...prev, [productId]: count }));
  }, []);

  const updateCachedCount = useCallback(
    (productId: number, newCount: number | null) => {
      if (shoppingListId == null) return;

      const cache = client.cache;
      const existing = cache.readQuery<ShoppingListResult>({
        query: SHOPPING_LIST,
        variables: { id: shoppingListId },
      });
      if (!existing?.shoppingList) return;

      const matchedItem = existing.shoppingList.items.find(
        (item) => item != null && item.product.id === productId,
      );
      if (!matchedItem) return;

      const itemCacheId = cache.identify({
        __typename: "ShoppingListItem",
        id: matchedItem.id,
      });
      if (!itemCacheId) return;

      const listCacheId = cache.identify({
        __typename: "ShoppingList",
        id: shoppingListId,
      });
      if (!listCacheId) return;

      if (newCount == null || newCount <= 0) {
        cache.modify({
          id: listCacheId,
          fields: {
            items(existingRefs, { readField }) {
              if (!Array.isArray(existingRefs)) return existingRefs;
              return existingRefs.filter(
                (ref) => readField("id", ref) !== matchedItem.id,
              );
            },
          },
        });
        cache.evict({ id: itemCacheId });
        cache.gc();
        return;
      }

      cache.modify({
        id: itemCacheId,
        fields: {
          count: () => newCount,
        },
      });
    },
    [client, shoppingListId],
  );

  const fetchProductByBarcode = useCallback(
    async (barcode: string): Promise<Product | null> => {
      const trimmed = barcode.trim();
      if (!trimmed) return null;

      const { data: productData, error: productError } = await lookupProduct({
        variables: { barcode: trimmed },
      });

      if (productError) {
        throw productError;
      }

      return productData?.product ?? null;
    },
    [lookupProduct],
  );

  const removeItem = useCallback(
    async (productId: number, count: number) => {
      if (shoppingListId == null) return;

      setOptimisticCount(productId, 0);
      setUpdatingProductId(productId);
      try {
        await removeProduct({
          variables: {
            productId,
            shoppingListId,
            count,
          },
        });
        updateCachedCount(productId, null);
      } catch {
        clearOptimistic(productId);
        await refetch();
        throw new Error("Could not remove item.");
      } finally {
        setUpdatingProductId(null);
      }
    },
    [
      shoppingListId,
      removeProduct,
      setOptimisticCount,
      updateCachedCount,
      clearOptimistic,
      refetch,
    ],
  );

  const incrementItem = useCallback(
    async (productId: number) => {
      if (shoppingListId == null) return;

      const currentCount =
        optimisticCounts[productId] ?? getItemCount(items, productId);
      setOptimisticCount(productId, currentCount + 1);
      setUpdatingProductId(productId);

      try {
        const { data: mutationData } = await addProduct({
          variables: {
            productId,
            shoppingListId,
            count: 1,
          },
        });

        const newCount = mutationData?.addProductToShoppingList.count;
        if (newCount != null) {
          updateCachedCount(productId, newCount);
        }
      } catch {
        clearOptimistic(productId);
        await refetch();
        throw new Error("Could not update quantity.");
      } finally {
        setUpdatingProductId(null);
      }
    },
    [
      shoppingListId,
      items,
      optimisticCounts,
      addProduct,
      setOptimisticCount,
      updateCachedCount,
      clearOptimistic,
      refetch,
    ],
  );

  const decrementItem = useCallback(
    async (productId: number) => {
      if (shoppingListId == null) return;

      const currentCount =
        optimisticCounts[productId] ?? getItemCount(items, productId);
      const nextCount = currentCount - 1;
      setOptimisticCount(productId, nextCount);
      setUpdatingProductId(productId);

      try {
        await removeProduct({
          variables: {
            productId,
            shoppingListId,
            count: 1,
          },
        });
        updateCachedCount(productId, nextCount <= 0 ? null : nextCount);
      } catch {
        clearOptimistic(productId);
        await refetch();
        throw new Error("Could not update quantity.");
      } finally {
        setUpdatingProductId(null);
      }
    },
    [
      shoppingListId,
      items,
      optimisticCounts,
      removeProduct,
      setOptimisticCount,
      updateCachedCount,
      clearOptimistic,
      refetch,
    ],
  );

  const addByBarcode = useCallback(
    async (
      barcode: string,
      count = 1,
    ): Promise<{ ok: true } | { ok: false; message: string }> => {
      if (shoppingListId == null) {
        return { ok: false, message: "Shopping list is not available." };
      }

      const trimmed = barcode.trim();
      if (!trimmed) {
        return { ok: false, message: "Enter a barcode." };
      }

      if (count < 1) {
        return { ok: false, message: "Quantity must be at least 1." };
      }

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
        if (!product) {
          return { ok: false, message: PRODUCT_NOT_FOUND_MESSAGE };
        }

        await addProduct({
          variables: {
            productId: product.id,
            shoppingListId,
            count,
          },
        });
        await refetch();
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
    [shoppingListId, lookupProduct, addProduct, refetch],
  );

  return {
    items,
    displayItems,
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
  };
}
