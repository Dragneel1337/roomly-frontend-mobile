import { Stack } from "expo-router";
import { ModalStackHeader } from "@/src/shared/navigation/ModalStackHeader";
import { colors, stackHeaderOptions } from "@/src/shared/theme";

export default function GuestLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        header: ModalStackHeader,
        headerBackTitle: "Back",
        ...stackHeaderOptions,
      }}
    >
      <Stack.Screen
        name="welcome"
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
        name="sign-in"
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
  );
}
