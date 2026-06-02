import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/src/features/auth/AuthProvider";
import { routes } from "@/src/shared/routes";
import { Screen } from "@/src/shared/components/Screen";

export default function Index() {
  const { isLoading, isAuthenticated, isOnboardingComplete, isOnboardingLoading, authMode } =
    useAuth();

  if (isLoading || isOnboardingLoading) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator />
        </View>
      </Screen>
    );
  }

  if (isAuthenticated) {
    if (!isOnboardingComplete) {
      if (authMode === "email") {
        return <Redirect href={routes.onboarding.choose} />;
      }
      return <Redirect href={routes.guest.welcome} />;
    }
    return <Redirect href={routes.tabs.home} />;
  }

  return <Redirect href={routes.guest.welcome} />;
}
