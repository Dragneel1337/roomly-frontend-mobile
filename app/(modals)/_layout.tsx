import { Stack } from "expo-router";
import { AuthGuard } from "@/src/features/auth/AuthGuard";
import { ModalStackHeader } from "@/src/shared/navigation/ModalStackHeader";
import { stackHeaderOptions } from "@/src/shared/theme";

export default function ModalsLayout() {
  return (
    <AuthGuard>
      <Stack
        screenOptions={{
          headerShown: true,
          presentation: "modal",
          header: ModalStackHeader,
          headerBackTitle: "Back",
          ...stackHeaderOptions,
        }}
      />
    </AuthGuard>
  );
}
