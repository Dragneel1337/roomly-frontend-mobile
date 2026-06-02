import type { Router } from "expo-router";
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

export function resetToTabs(router: Router) {
  if (router.canDismiss()) {
    router.dismissAll();
  }
  router.replace(routes.tabs.home);
}
