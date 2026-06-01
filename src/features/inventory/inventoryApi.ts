import { gql, type TypedDocumentNode } from "@apollo/client";
import type { Product } from "@/src/features/shoppingList/shoppingListApi";

export type InventoryItem = {
  id: number;
  count: number;
  notes: string | null;
  addedAt: string;
  product: Product;
};

export type InventoryData = {
  id: number;
  items: (InventoryItem | null)[];
};

export type InventoryResult = {
  inventory: InventoryData;
};

export const INVENTORY: TypedDocumentNode<InventoryResult, { id: number }> = gql`
  query Inventory($id: Int!) {
    inventory(id: $id) {
      id
      items {
        id
        count
        notes
        addedAt
        product {
          id
          name
          brand
          barcode
          quantity
        }
      }
    }
  }
`;

export type AddProductToInventoryResult = {
  addProductToInventory: {
    id: number;
    count: number;
    product: Pick<Product, "id" | "name" | "brand">;
  };
};

export type AddProductToInventoryVariables = {
  productId: number;
  inventoryId: number;
  count: number;
  notes?: string | null;
};

export const ADD_PRODUCT_TO_INVENTORY: TypedDocumentNode<
  AddProductToInventoryResult,
  AddProductToInventoryVariables
> = gql`
  mutation AddProductToInventory(
    $productId: Int!
    $inventoryId: Int!
    $count: Int!
    $notes: String
  ) {
    addProductToInventory(
      productId: $productId
      inventoryId: $inventoryId
      count: $count
      notes: $notes
    ) {
      id
      count
      product {
        id
        name
        brand
      }
    }
  }
`;

export type RemoveProductFromInventoryVariables = {
  productId: number;
  inventoryId: number;
  count: number;
  notes?: string | null;
};

export const REMOVE_PRODUCT_FROM_INVENTORY: TypedDocumentNode<
  { removeProductFromInventory: { id: number } },
  RemoveProductFromInventoryVariables
> = gql`
  mutation RemoveProductFromInventory(
    $productId: Int!
    $inventoryId: Int!
    $count: Int!
    $notes: String
  ) {
    removeProductFromInventory(
      productId: $productId
      inventoryId: $inventoryId
      count: $count
      notes: $notes
    ) {
      id
    }
  }
`;
