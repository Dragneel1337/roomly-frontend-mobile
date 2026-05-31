import { gql, type TypedDocumentNode } from "@apollo/client";
import { apolloClient } from "@/src/shared/api/apolloClient";

export type AvatarColor = {
  name: string;
  hex: string;
};

export type AvailableAvatarsAndColorsResult = {
  availableAvatarsAndColors: {
    avatars: (string | null)[];
    colors: AvatarColor[];
  };
};

export const AVAILABLE_AVATARS_AND_COLORS: TypedDocumentNode<AvailableAvatarsAndColorsResult> = gql`
  query AvailableAvatarsAndColors {
    availableAvatarsAndColors {
      avatars
      colors {
        name
        hex
      }
    }
  }
`;

export type HouseholdSummary = {
  id: string;
  name: string;
  joinCode: string;
  membersLimit: number;
  membersCount: number;
};

export type MyHouseholdsResult = { households: (HouseholdSummary | null)[] };

export const MY_HOUSEHOLDS: TypedDocumentNode<MyHouseholdsResult> = gql`
  query MyHouseholds {
    households {
      id
      name
      joinCode
      membersLimit
      membersCount
    }
  }
`;

type HouseholdProfileIdsResult = {
  household: {
    id: string;
    membersCount: number;
    owner: { id: string } | null;
    members: { id: string }[];
    myProfile?: { id: string } | null;
  };
};

const HOUSEHOLD_PROFILE_IDS: TypedDocumentNode<
  HouseholdProfileIdsResult,
  { householdId: string }
> = gql`
  query HouseholdProfileIds($householdId: String!) {
    household(householdId: $householdId) {
      id
      membersCount
      owner {
        id
      }
      members {
        id
      }
    }
  }
`;

const HOUSEHOLD_MY_PROFILE: TypedDocumentNode<
  HouseholdProfileIdsResult,
  { householdId: string }
> = gql`
  query HouseholdMyProfile($householdId: String!) {
    household(householdId: $householdId) {
      id
      myProfile {
        id
      }
    }
  }
`;

export type HouseholdProfileIds = {
  id: string;
  membersCount: number;
  owner: { id: string } | null;
  members: { id: string }[];
};

export async function fetchHouseholdProfileIds(
  householdId: string,
): Promise<HouseholdProfileIds | null> {
  try {
    const { data } = await apolloClient.query({
      query: HOUSEHOLD_PROFILE_IDS,
      variables: { householdId },
      fetchPolicy: "network-only",
    });
    return data?.household ?? null;
  } catch {
    return null;
  }
}

function profileIdInHousehold(detail: HouseholdProfileIds, profileId: string): boolean {
  if (detail.owner?.id === profileId) return true;
  return detail.members.some((member) => member.id === profileId);
}

async function fetchMyProfileId(householdId: string): Promise<string | null> {
  try {
    const { data } = await apolloClient.query({
      query: HOUSEHOLD_MY_PROFILE,
      variables: { householdId },
      fetchPolicy: "network-only",
    });
    return data?.household?.myProfile?.id ?? null;
  } catch {
    return null;
  }
}

/** Resolve profileId for one household — tries myProfile, stored id, solo owner. */
export async function rebuildProfileMapEntry(
  householdId: string,
  membersCount: number,
  storedProfileId: string | null,
): Promise<string | null> {
  const myProfileId = await fetchMyProfileId(householdId);
  if (myProfileId) return myProfileId;

  const detail = await fetchHouseholdProfileIds(householdId);
  if (!detail) return null;

  if (storedProfileId && profileIdInHousehold(detail, storedProfileId)) {
    return storedProfileId;
  }

  if (membersCount === 0 && detail.owner?.id) {
    return detail.owner.id;
  }

  return null;
}

/** Rebuild householdId → profileId map when SecureStore was wiped. */
export async function rebuildHouseholdProfileMap(
  households: HouseholdSummary[],
  storedProfileId: string | null = null,
): Promise<Record<string, string>> {
  const entries: Record<string, string> = {};

  for (const summary of households) {
    const profileId = await rebuildProfileMapEntry(
      summary.id,
      summary.membersCount,
      storedProfileId,
    );
    if (profileId) entries[summary.id] = profileId;
  }

  if (storedProfileId && !Object.values(entries).includes(storedProfileId)) {
    for (const summary of households) {
      if (entries[summary.id]) continue;
      const detail = await fetchHouseholdProfileIds(summary.id);
      if (detail && profileIdInHousehold(detail, storedProfileId)) {
        entries[summary.id] = storedProfileId;
        break;
      }
    }
  }

  return entries;
}

export async function fetchHouseholds(): Promise<HouseholdSummary[]> {
  const { data } = await apolloClient.query({
    query: MY_HOUSEHOLDS,
    fetchPolicy: "network-only",
  });
  return (data?.households ?? []).filter((h): h is HouseholdSummary => h != null);
}

export async function fetchHouseholdIds(): Promise<string[]> {
  const households = await fetchHouseholds();
  return households.map((h) => h.id);
}

export type HouseholdByJoinCodeResult = {
  householdByJoinCode: {
    id: string;
    name: string;
    membersCount: number;
    membersLimit: number;
  };
};

export const HOUSEHOLD_BY_JOIN_CODE: TypedDocumentNode<
  HouseholdByJoinCodeResult,
  { joinCode: string }
> = gql`
  query HouseholdByJoinCode($joinCode: String!) {
    householdByJoinCode(joinCode: $joinCode) {
      id
      name
      membersCount
      membersLimit
    }
  }
`;

export type CreateHouseholdVars = {
  name: string;
  membersLimit: number;
  nickname: string;
  avatarName: string;
  avatarColorName: string;
};

export type CreateHouseholdResult = {
  createHousehold: {
    id: string;
    name: string;
    joinCode: string;
    owner: { id: string };
  };
};

export const CREATE_HOUSEHOLD: TypedDocumentNode<CreateHouseholdResult, CreateHouseholdVars> = gql`
  mutation CreateHousehold(
    $name: String!
    $membersLimit: Int!
    $nickname: String!
    $avatarName: String!
    $avatarColorName: String!
  ) {
    createHousehold(
      name: $name
      membersLimit: $membersLimit
      nickname: $nickname
      avatarName: $avatarName
      avatarColorName: $avatarColorName
    ) {
      id
      name
      joinCode
      owner {
        id
      }
    }
  }
`;

export type JoinHouseholdVars = {
  nickname: string;
  avatarName: string;
  avatarColorName: string;
  joinCode: string;
};

export type JoinHouseholdResult = {
  joinHousehold: {
    id: string;
    nickname: string;
  };
};

export const JOIN_HOUSEHOLD: TypedDocumentNode<JoinHouseholdResult, JoinHouseholdVars> = gql`
  mutation JoinHousehold(
    $nickname: String!
    $avatarName: String!
    $avatarColorName: String!
    $joinCode: String!
  ) {
    joinHousehold(
      nickname: $nickname
      avatarName: $avatarName
      avatarColorName: $avatarColorName
      joinCode: $joinCode
    ) {
      id
      nickname
    }
  }
`;
