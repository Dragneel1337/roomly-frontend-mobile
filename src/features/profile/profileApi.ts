import { gql, type TypedDocumentNode } from "@apollo/client";
import { apolloClient } from "@/src/shared/api/apolloClient";

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

type CurrentUserProfileResult = {
  currentUserProfile: { id: string } | null;
};

export const CURRENT_USER_PROFILE: TypedDocumentNode<CurrentUserProfileResult> = gql`
  query CurrentUserProfile {
    currentUserProfile {
      id
    }
  }
`;

export async function fetchCurrentUserProfileId(): Promise<string | null> {
  try {
    const { data } = await apolloClient.query({
      query: CURRENT_USER_PROFILE,
      fetchPolicy: "network-only",
    });
    return data?.currentUserProfile?.id ?? null;
  } catch {
    return null;
  }
}

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

type UpdateProfileVariables = {
  profileId: string;
  nickname?: string;
  avatarName?: string;
  avatarColorName?: string;
};

type UpdateProfileResult = {
  updateProfile: {
    id: string;
    nickname: string;
    avatar: { name: string; colorName: string };
  };
};

export const UPDATE_PROFILE: TypedDocumentNode<
  UpdateProfileResult,
  UpdateProfileVariables
> = gql`
  mutation UpdateProfile(
    $profileId: String!
    $nickname: String
    $avatarName: String
    $avatarColorName: String
  ) {
    updateProfile(
      profileId: $profileId
      nickname: $nickname
      avatarName: $avatarName
      avatarColorName: $avatarColorName
    ) {
      id
      nickname
      avatar {
        name
        colorName
      }
    }
  }
`;

export async function updateProfile(input: UpdateProfileVariables): Promise<void> {
  const { data } = await apolloClient.mutate({
    mutation: UPDATE_PROFILE,
    variables: input,
  });
  if (!data?.updateProfile) throw new Error("Could not update profile");
}
