import { apolloClient } from "@/src/shared/api/apolloClient";
import { JOIN_HOUSEHOLD, fetchHouseholdIds } from "./householdApi";

export type JoinHouseholdWithProfileInput = {
  joinCode: string;
  nickname: string;
  avatarName: string;
  avatarColorName: string;
};

export type JoinHouseholdResult = {
  householdId: string;
  profileId: string;
};

export async function joinHouseholdWithProfile(
  input: JoinHouseholdWithProfileInput,
): Promise<JoinHouseholdResult> {
  const beforeIds = await fetchHouseholdIds();

  const { data } = await apolloClient.mutate({
    mutation: JOIN_HOUSEHOLD,
    variables: {
      joinCode: input.joinCode,
      nickname: input.nickname.trim(),
      avatarName: input.avatarName,
      avatarColorName: input.avatarColorName,
    },
  });

  const profileId = data?.joinHousehold?.id;
  if (!profileId) throw new Error("Join failed");

  const afterIds = await fetchHouseholdIds();
  const householdId = afterIds.find((id) => !beforeIds.includes(id)) ?? afterIds[0];
  if (!householdId) throw new Error("Household not found");

  return { householdId, profileId };
}

export function getJoinCodeMembershipError(
  joinCode: string,
  households: { joinCode: string }[],
  activeHousehold: { joinCode: string } | null,
): string | null {
  const normalized = joinCode.trim().toUpperCase();
  if (activeHousehold?.joinCode.toUpperCase() === normalized) {
    return "You are already in this household.";
  }
  if (households.some((h) => h.joinCode.toUpperCase() === normalized)) {
    return "You are already a member of this household.";
  }
  return null;
}
