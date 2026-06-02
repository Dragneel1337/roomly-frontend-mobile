import type { Router } from "expo-router";
import type { AuthMode } from "@/src/features/auth/deviceStore";
import { routes } from "@/src/shared/routes";

export function resetToWelcome(router: Router) {
  if (router.canDismiss()) {
    router.dismissAll();
  }
  router.replace(routes.guest.welcome);
}

export function resetToOnboardingChoose(router: Router) {
  if (router.canDismiss()) {
    router.dismissAll();
  }
  router.replace(routes.onboarding.choose);
}

/** Email account without a household → choose screen; device-only → welcome. */
export function resetAfterIncompleteOnboarding(router: Router, authMode: AuthMode | null) {
  if (authMode === "email") {
    resetToOnboardingChoose(router);
  } else {
    resetToWelcome(router);
  }
}

export function resetToTabs(router: Router) {
  if (router.canDismiss()) {
    router.dismissAll();
  }
  router.replace(routes.tabs.home);
}
