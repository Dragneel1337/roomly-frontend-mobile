import { useQuery } from "@apollo/client/react";
import { useMemo } from "react";
import { useHousehold } from "./HouseholdProvider";
import {
  HOUSEHOLD_RESOURCES,
  mapHouseholdResources,
  type HouseholdResources,
} from "./householdResourcesApi";

export function useHouseholdResources(): {
  resources: HouseholdResources | null;
  loading: boolean;
  error: Error | undefined;
  ownerProfileId: string | null;
  ownerResolved: boolean;
  refetch: () => Promise<void>;
} {
  const { activeHouseholdId, activeProfileId } = useHousehold();

  const { data, loading, error, refetch } = useQuery(HOUSEHOLD_RESOURCES, {
    variables: { householdId: activeHouseholdId! },
    skip: activeHouseholdId == null || activeProfileId == null,
    fetchPolicy: "network-only",
  });

  const resources = useMemo(() => {
    if (!data?.household || !activeProfileId) return null;
    return mapHouseholdResources(data.household, activeProfileId);
  }, [data, activeProfileId]);

  const ownerProfileId = data?.household?.owner?.id ?? null;
  const ownerResolved = !loading && !error && !!data?.household;

  return {
    resources,
    loading,
    error: error as Error | undefined,
    ownerProfileId,
    ownerResolved,
    refetch: async () => {
      await refetch();
    },
  };
}
