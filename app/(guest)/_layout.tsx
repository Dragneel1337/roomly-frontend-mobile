import { Stack } from "expo-router";

export default function GuestLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        title: "Roomly",
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
