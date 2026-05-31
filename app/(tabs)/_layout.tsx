import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AuthGuard } from "@/src/features/auth/AuthGuard";
import { HouseholdSessionGate } from "@/src/features/household/HouseholdSessionGate";
import { TabAppHeader } from "@/src/features/household/TabAppHeader";

export default function TabsLayout() {
  return (
    <AuthGuard>
      <HouseholdSessionGate>
        <Tabs
          screenOptions={{
            header: () => <TabAppHeader />,
          }}
        >
          <Tabs.Screen
            name="shopping"
            options={{
              title: "Shopping",
              tabBarIcon: ({ color, size }) => <Ionicons name="cart" size={size} color={color} />,
            }}
          />
          <Tabs.Screen
            name="fridge"
            options={{
              title: "Fridge",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="snow-outline" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="calendar"
            options={{
              title: "Calendar",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="calendar" size={size} color={color} />
              ),
            }}
          />
        </Tabs>
      </HouseholdSessionGate>
    </AuthGuard>
  );
}
