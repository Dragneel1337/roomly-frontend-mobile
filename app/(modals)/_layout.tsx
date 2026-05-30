import { Stack } from "expo-router";
import { AuthGuard } from "@/src/features/auth/AuthGuard";

export default function ModalsLayout() {
  return (
    <AuthGuard>
      <Stack screenOptions={{ headerShown: true, presentation: "modal" }} />
    </AuthGuard>
  );
}
