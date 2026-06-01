import { apolloClient } from "@/src/shared/api/apolloClient";
import { getUserFacingErrorMessage } from "@/src/shared/api/getUserFacingErrorMessage";
import { REMOVE_PRODUCT_FROM_SHOPPING_LIST } from "@/src/features/shoppingList/shoppingListApi";
import { ADD_PRODUCT_TO_INVENTORY } from "./inventoryApi";

export type MoveItem = {
  productId: number;
  count: number;
};

export async function moveItemsToInventory(
  items: MoveItem[],
  shoppingListId: number,
  inventoryId: number,
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (items.length === 0) {
    return { ok: false, message: "No items selected." };
  }

  try {
    for (const item of items) {
      await apolloClient.mutate({
        mutation: ADD_PRODUCT_TO_INVENTORY,
        variables: {
          productId: item.productId,
          inventoryId,
          count: item.count,
        },
      });
      await apolloClient.mutate({
        mutation: REMOVE_PRODUCT_FROM_SHOPPING_LIST,
        variables: {
          productId: item.productId,
          shoppingListId,
          count: item.count,
        },
      });
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      message: getUserFacingErrorMessage(err, "Could not move items to fridge."),
    };
  }
}
