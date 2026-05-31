import { gql, type TypedDocumentNode } from "@apollo/client";

export type ActiveProfile = {
  id: string;
  nickname: string;
  avatar: {
    name: string;
    /** Display label — never show raw hex to the user. */
    colorName: string;
    /** For styling only (border, text color, swatches). */
    colorHex: string;
  };
  shoppingList: { id: number };
  inventory: { id: number };
};

export type ActiveProfileFromApi = {
  id: string;
  nickname: string;
  avatar: {
    name: string;
    colorName: string;
  };
  shoppingList: { id: number };
  inventory: { id: number };
};

export type ActiveProfileResult = {
  profile: ActiveProfileFromApi;
};

export const ACTIVE_PROFILE: TypedDocumentNode<
  ActiveProfileResult,
  { profileId: string }
> = gql`
  query ActiveProfile($profileId: String!) {
    profile(profileId: $profileId) {
      id
      nickname
      avatar {
        name
        colorName
      }
      shoppingList {
        id
      }
      inventory {
        id
      }
    }
  }
`;
