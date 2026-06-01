import { Stack } from "expo-router";
import { ModalStackHeader } from "@/src/shared/navigation/ModalStackHeader";

export default function GuestLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        header: ModalStackHeader,
        headerBackTitle: "Back",
      }}
    >
      <Stack.Screen
        name="welcome"
        options={{
          headerBackVisible: false,
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}
