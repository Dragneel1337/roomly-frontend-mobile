import type { ReactNode } from "react";
import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "@/src/features/auth/AuthProvider";
import { routes } from "@/src/shared/routes";
import { useHousehold } from "./HouseholdProvider";

export function HouseholdSessionGate({ children }: { children: ReactNode }) {
  const {
    isAuthenticated,
    isOnboardingComplete,
    isOnboardingLoading,
    isLoading: authLoading,
    authMode,
  } = useAuth();
  const { isReady, isLoading: householdLoading, activeHouseholdId } = useHousehold();

  if (authLoading || isOnboardingLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (isAuthenticated && isOnboardingComplete && (!isReady || householdLoading)) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (
    isAuthenticated &&
    isOnboardingComplete &&
    isReady &&
    !householdLoading &&
    !activeHouseholdId
  ) {
    return (
      <Redirect
        href={authMode === "email" ? routes.onboarding.choose : routes.guest.welcome}
      />
    );
  }

  return <>{children}</>;
}
