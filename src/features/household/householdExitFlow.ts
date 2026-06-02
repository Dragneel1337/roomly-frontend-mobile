import type { Router } from "expo-router";
import { removeHouseholdFromMap } from "@/src/features/household/activeSessionStore";
import {
  fetchHouseholds,
  type HouseholdSummary,
} from "@/src/features/household/householdApi";
import type { HouseholdSwitchError } from "@/src/features/household/HouseholdProvider";
import { apolloClient } from "@/src/shared/api/apolloClient";
import { resetToOnboardingChoose, resetToTabs } from "@/src/shared/navigation/resetRoutes";

type CompleteHouseholdExitOptions = {
  router: Router;
  removedHouseholdId: string;
  switchHousehold: (householdId: string) => Promise<HouseholdSwitchError | null>;
  refreshHouseholds: () => Promise<void>;
  onNoHouseholdsLeft: () => Promise<void>;
};

export async function completeHouseholdExit({
  router,
  removedHouseholdId,
  switchHousehold,
  refreshHouseholds,
  onNoHouseholdsLeft,
}: CompleteHouseholdExitOptions): Promise<void> {
  await removeHouseholdFromMap(removedHouseholdId);
  await apolloClient.clearStore();

  const remaining: HouseholdSummary[] = (await fetchHouseholds()).filter(
    (h) => h.id !== removedHouseholdId,
  );

  if (remaining.length === 0) {
    await onNoHouseholdsLeft();
    if (router.canDismiss()) {
      router.dismissAll();
    }
    resetToOnboardingChoose(router);
    return;
  }

  await refreshHouseholds();

  const switchError = await switchHousehold(remaining[0].id);
  if (switchError === "profile_not_found") {
    await onNoHouseholdsLeft();
    if (router.canDismiss()) {
      router.dismissAll();
    }
    resetToOnboardingChoose(router);
    return;
  }

  if (router.canDismiss()) {
    router.dismissAll();
  }
  resetToTabs(router);
}
