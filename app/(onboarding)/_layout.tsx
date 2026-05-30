import { Stack } from "expo-router";
import { AuthGuard } from "@/src/features/auth/AuthGuard";

export default function OnboardingLayout() {
  return (
    <AuthGuard>
      <Stack
        screenOptions={{
          headerShown: true,
          title: "Roomly",
        }}
      />
    </AuthGuard>
  );
}
