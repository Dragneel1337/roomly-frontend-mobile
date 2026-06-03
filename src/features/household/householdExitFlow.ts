import type { Router } from "expo-router";
import {
  clearActiveSession,
  removeHouseholdFromMap,
} from "@/src/features/household/activeSessionStore";
import {
  fetchHouseholds,
  type HouseholdSummary,
} from "@/src/features/household/householdApi";
import type {
  HouseholdSwitchError,
  SwitchHouseholdOptions,
} from "@/src/features/household/HouseholdProvider";
import { resetSessionInit } from "@/src/features/household/HouseholdProvider";
import { apolloClient } from "@/src/shared/api/apolloClient";
import type { AuthMode } from "@/src/features/auth/deviceStore";
import {
  resetAfterIncompleteOnboarding,
  resetToTabs,
} from "@/src/shared/navigation/resetRoutes";

type CompleteHouseholdExitOptions = {
  router: Router;
  authMode: AuthMode | null;
  removedHouseholdId: string;
  clearActiveHouseholdContext: () => void;
  switchHousehold: (
    householdId: string,
    options?: SwitchHouseholdOptions,
  ) => Promise<HouseholdSwitchError | null>;
  refreshHouseholds: () => Promise<void>;
  onNoHouseholdsLeft: () => Promise<void>;
};

function evictRemovedHousehold(removedHouseholdId: string): void {
  const cache = apolloClient.cache;
  const id = cache.identify({ __typename: "Household", id: removedHouseholdId });
  if (id) {
    cache.evict({ id });
    cache.gc();
  }
}

async function loadRemainingHouseholds(
  removedHouseholdId: string,
): Promise<HouseholdSummary[]> {
  try {
    evictRemovedHousehold(removedHouseholdId);
    await apolloClient.clearStore();
    const list = await fetchHouseholds();
    return list.filter((h) => h.id !== removedHouseholdId);
  } catch {
    return [];
  }
}

async function finishWithNoHouseholds(
  router: Router,
  authMode: AuthMode | null,
  onNoHouseholdsLeft: () => Promise<void>,
): Promise<void> {
  await clearActiveSession();
  await onNoHouseholdsLeft();
  resetSessionInit();
  if (router.canDismiss()) {
    router.dismissAll();
  }
  resetAfterIncompleteOnboarding(router, authMode);
}

export async function completeHouseholdExit({
  router,
  authMode,
  removedHouseholdId,
  clearActiveHouseholdContext,
  switchHousehold,
  refreshHouseholds,
  onNoHouseholdsLeft,
}: CompleteHouseholdExitOptions): Promise<void> {
  await removeHouseholdFromMap(removedHouseholdId);
  clearActiveHouseholdContext();

  const remaining = await loadRemainingHouseholds(removedHouseholdId);

  if (remaining.length === 0) {
    await finishWithNoHouseholds(router, authMode, onNoHouseholdsLeft);
    return;
  }

  await refreshHouseholds();

  const switchError = await switchHousehold(remaining[0].id, { skipCacheReset: true });
  if (switchError === "profile_not_found") {
    await finishWithNoHouseholds(router, authMode, onNoHouseholdsLeft);
    return;
  }

  resetSessionInit();
  if (router.canDismiss()) {
    router.dismissAll();
  }
  resetToTabs(router);
}
