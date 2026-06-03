import { useEffect, useState } from "react";
import { fetchHouseholdProfileIds } from "@/src/features/household/householdApi";
import { useHousehold } from "@/src/features/household/HouseholdProvider";
import { useHouseholdResources } from "@/src/features/household/useHouseholdResources";

export function useIsHouseholdOwner() {
  const { activeHouseholdId, activeProfileId, isReady } = useHousehold();
  const {
    ownerProfileId: resourcesOwnerId,
    loading,
    ownerResolved: resourcesOwnerResolved,
    error: resourcesError,
    refetch,
  } = useHouseholdResources();

  const [fallbackOwnerId, setFallbackOwnerId] = useState<string | null>(null);
  const [fallbackResolved, setFallbackResolved] = useState(false);
  const [fallbackLoading, setFallbackLoading] = useState(false);

  useEffect(() => {
    if (!resourcesError || !activeHouseholdId || resourcesOwnerResolved) {
      setFallbackOwnerId(null);
      setFallbackResolved(false);
      setFallbackLoading(false);
      return;
    }

    let cancelled = false;
    setFallbackLoading(true);
    setFallbackResolved(false);
    setFallbackOwnerId(null);

    void fetchHouseholdProfileIds(activeHouseholdId).then((detail) => {
      if (cancelled) return;
      setFallbackOwnerId(detail?.owner?.id ?? null);
      setFallbackResolved(true);
      setFallbackLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [resourcesError, activeHouseholdId, resourcesOwnerResolved]);

  const ownerResolved = resourcesOwnerResolved || fallbackResolved;
  const ownerProfileId = resourcesOwnerResolved
    ? resourcesOwnerId
    : fallbackResolved
      ? fallbackOwnerId
      : null;

  const isOwner =
    ownerResolved &&
    activeProfileId != null &&
    ownerProfileId != null &&
    ownerProfileId === activeProfileId;

  const ownerCheckFailed =
    isReady &&
    !!activeHouseholdId &&
    !!activeProfileId &&
    !loading &&
    !fallbackLoading &&
    !ownerResolved;

  return {
    isOwner,
    loading: !isReady || loading || fallbackLoading,
    ownerResolved,
    ownerCheckFailed,
    error: resourcesError,
    retryOwnerCheck: refetch,
  };
}
