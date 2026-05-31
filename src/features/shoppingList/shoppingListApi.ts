import { gql, type TypedDocumentNode } from "@apollo/client";

export type Product = {
  id: number;
  name: string;
  brand: string;
  barcode: string | null;
  quantity: string;
};

export type ShoppingListItem = {
  id: number;
  count: number;
  notes: string | null;
  addedAt: string;
  product: Product;
};

export type ShoppingListData = {
  id: number;
  items: (ShoppingListItem | null)[];
};

export type ShoppingListResult = {
  shoppingList: ShoppingListData;
};

export const SHOPPING_LIST: TypedDocumentNode<
  ShoppingListResult,
  { id: number }
> = gql`
  query ShoppingList($id: Int!) {
    shoppingList(id: $id) {
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

export type ProductByBarcodeResult = {
  product: Product | null;
};

export const PRODUCT_BY_BARCODE: TypedDocumentNode<
  ProductByBarcodeResult,
  { barcode: string }
> = gql`
  query ProductByBarcode($barcode: String!) {
    product(barcode: $barcode) {
      id
      name
      brand
      barcode
      quantity
    }
  }
`;

export type AddProductToShoppingListResult = {
  addProductToShoppingList: {
    id: number;
    count: number;
    product: Pick<Product, "id" | "name" | "brand">;
  };
};

export type AddProductToShoppingListVariables = {
  productId: number;
  shoppingListId: number;
  count: number;
  notes?: string | null;
};

export const ADD_PRODUCT_TO_SHOPPING_LIST: TypedDocumentNode<
  AddProductToShoppingListResult,
  AddProductToShoppingListVariables
> = gql`
  mutation AddProductToShoppingList(
    $productId: Int!
    $shoppingListId: Int!
    $count: Int!
    $notes: String
  ) {
    addProductToShoppingList(
      productId: $productId
      shoppingListId: $shoppingListId
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

export type RemoveProductFromShoppingListResult = {
  removeProductFromShoppingList: { id: number };
};

export type RemoveProductFromShoppingListVariables = {
  productId: number;
  shoppingListId: number;
  count: number;
  notes?: string | null;
};

export const REMOVE_PRODUCT_FROM_SHOPPING_LIST: TypedDocumentNode<
  RemoveProductFromShoppingListResult,
  RemoveProductFromShoppingListVariables
> = gql`
  mutation RemoveProductFromShoppingList(
    $productId: Int!
    $shoppingListId: Int!
    $count: Int!
    $notes: String
  ) {
    removeProductFromShoppingList(
      productId: $productId
      shoppingListId: $shoppingListId
      count: $count
      notes: $notes
    ) {
      id
    }
  }
`;
