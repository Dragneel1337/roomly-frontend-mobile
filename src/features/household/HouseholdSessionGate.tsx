import type { ReactNode } from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/src/features/auth/AuthProvider";
import { useHousehold } from "./HouseholdProvider";

export function HouseholdSessionGate({ children }: { children: ReactNode }) {
  const { isAuthenticated, isOnboardingComplete, isOnboardingLoading, isLoading: authLoading } =
    useAuth();
  const { isReady, isLoading: householdLoading } = useHousehold();

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

  return <>{children}</>;
}
