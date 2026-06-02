import { useHouseholdResources } from "@/src/features/household/useHouseholdResources";

export type HouseholdMemberOption = {
  profileId: string;
  nickname: string;
};

/** Household members that can be invited as event attendees (excludes the current profile). */
export function useHouseholdMemberOptions(): {
  inviteOptions: HouseholdMemberOption[];
  organizer: HouseholdMemberOption | null;
  loading: boolean;
  error: Error | undefined;
} {
  const { resources, loading, error } = useHouseholdResources();

  const organizer = resources?.own
    ? { profileId: resources.own.profileId, nickname: resources.own.nickname }
    : null;
  const inviteOptions =
    resources?.others.map((p) => ({
      profileId: p.profileId,
      nickname: p.nickname,
    })) ?? [];

  return { inviteOptions, organizer, loading, error };
}
