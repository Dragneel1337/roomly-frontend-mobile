import { useEffect, useState } from "react";
import { useHousehold } from "@/src/features/household/HouseholdProvider";
import { fetchHouseholdProfileIds } from "@/src/features/household/householdApi";

export function useIsHouseholdOwner() {
  const { activeHouseholdId, activeProfileId, isReady } = useHousehold();
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isReady || !activeHouseholdId || !activeProfileId) {
      setIsOwner(false);
      setLoading(!isReady);
      return;
    }

    let cancelled = false;
    setLoading(true);

    void fetchHouseholdProfileIds(activeHouseholdId).then((detail) => {
      if (cancelled) return;
      setIsOwner(detail?.owner?.id === activeProfileId);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [activeHouseholdId, activeProfileId, isReady]);

  return { isOwner, loading };
}
