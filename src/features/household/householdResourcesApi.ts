import { gql, type TypedDocumentNode } from "@apollo/client";
import { apolloClient } from "@/src/shared/api/apolloClient";

export type ProfileListResource = {
  profileId: string;
  nickname: string;
  shoppingListId: number;
  inventoryId: number;
  avatar: {
    name: string;
    colorName: string;
  };
};

export type HouseholdResources = {
  sharedShoppingListId: number;
  sharedInventoryId: number;
  own: ProfileListResource;
  others: ProfileListResource[];
  /** Owner + members in household order (includes the active profile). */
  allMembers: ProfileListResource[];
};

type HouseholdResourcesResult = {
  household: {
    id: string;
    sharedShoppingList: { id: number };
    sharedInventory: { id: number };
    owner: {
      id: string;
      nickname: string;
      avatar: { name: string; colorName: string };
      shoppingList: { id: number };
      inventory: { id: number };
    } | null;
    members: {
      id: string;
      nickname: string;
      avatar: { name: string; colorName: string };
      shoppingList: { id: number };
      inventory: { id: number };
    }[];
  };
};

export const HOUSEHOLD_RESOURCES: TypedDocumentNode<
  HouseholdResourcesResult,
  { householdId: string }
> = gql`
  query HouseholdResources($householdId: String!) {
    household(householdId: $householdId) {
      id
      sharedShoppingList {
        id
      }
      sharedInventory {
        id
      }
      owner {
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
      members {
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
  }
`;

function toProfileResource(profile: {
  id: string;
  nickname: string;
  avatar: { name: string; colorName: string };
  shoppingList: { id: number };
  inventory: { id: number };
}): ProfileListResource {
  return {
    profileId: profile.id,
    nickname: profile.nickname,
    shoppingListId: profile.shoppingList.id,
    inventoryId: profile.inventory.id,
    avatar: {
      name: profile.avatar.name,
      colorName: profile.avatar.colorName,
    },
  };
}

export function mapHouseholdResources(
  data: HouseholdResourcesResult["household"],
  activeProfileId: string,
): HouseholdResources | null {
  if (!data?.sharedShoppingList?.id || !data?.sharedInventory?.id) return null;

  const profiles: ProfileListResource[] = [];
  const seen = new Set<string>();

  if (data.owner) {
    profiles.push(toProfileResource(data.owner));
    seen.add(data.owner.id);
  }

  for (const member of data.members ?? []) {
    if (seen.has(member.id)) continue;
    profiles.push(toProfileResource(member));
    seen.add(member.id);
  }

  const own = profiles.find((p) => p.profileId === activeProfileId);
  if (!own) return null;

  return {
    sharedShoppingListId: data.sharedShoppingList.id,
    sharedInventoryId: data.sharedInventory.id,
    own,
    others: profiles.filter((p) => p.profileId !== activeProfileId),
    allMembers: profiles,
  };
}

export async function fetchHouseholdResources(
  householdId: string,
  activeProfileId: string,
): Promise<HouseholdResources | null> {
  try {
    const { data } = await apolloClient.query({
      query: HOUSEHOLD_RESOURCES,
      variables: { householdId },
      fetchPolicy: "network-only",
    });
    if (!data?.household) return null;
    return mapHouseholdResources(data.household, activeProfileId);
  } catch {
    return null;
  }
}
