import { Stack } from "expo-router";
import { AuthGuard } from "@/src/features/auth/AuthGuard";
import { ModalStackHeader } from "@/src/shared/navigation/ModalStackHeader";
import { colors, stackHeaderOptions } from "@/src/shared/theme";

export default function OnboardingLayout() {
  return (
    <AuthGuard>
      <Stack
        screenOptions={{
          headerShown: true,
          header: ModalStackHeader,
          headerBackTitle: "Back",
          ...stackHeaderOptions,
        }}
      >
        <Stack.Screen
          name="choose-household"
          options={{
            title: "#Roomly",
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontSize: 28,
              fontWeight: "700",
              color: colors.onHeader,
            },
            headerBackVisible: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="create-household"
          options={{
            title: "#Roomly",
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontSize: 28,
              fontWeight: "700",
              color: colors.onHeader,
            },
          }}
        />
        <Stack.Screen
          name="create-profile"
          options={{
            title: "#Roomly",
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontSize: 28,
              fontWeight: "700",
              color: colors.onHeader,
            },
          }}
        />
      </Stack>
    </AuthGuard>
  );
}
