import { Stack } from "expo-router";
import { AuthGuard } from "@/src/features/auth/AuthGuard";
import { ModalStackHeader } from "@/src/shared/navigation/ModalStackHeader";

export default function OnboardingLayout() {
  return (
    <AuthGuard>
      <Stack
        screenOptions={{
          headerShown: true,
          header: ModalStackHeader,
          headerBackTitle: "Back",
        }}
      />
    </AuthGuard>
  );
}
