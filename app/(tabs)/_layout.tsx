import { Tabs } from "expo-router";
import { AuthGuard } from "@/src/features/auth/AuthGuard";
import { HouseholdSessionGate } from "@/src/features/household/HouseholdSessionGate";
import { TabAppHeader } from "@/src/features/household/TabAppHeader";
import { RoomlyTabBar } from "@/src/shared/navigation/RoomlyTabBar";
import { colors } from "@/src/shared/theme/colors";

export default function TabsLayout() {
  return (
    <AuthGuard>
      <HouseholdSessionGate>
        <Tabs
          tabBar={(props) => <RoomlyTabBar {...props} />}
          screenOptions={{
            header: () => <TabAppHeader />,
            tabBarShowLabel: false,
            tabBarStyle: {
              backgroundColor: "transparent",
              borderTopWidth: 0,
              elevation: 0,
              position: "absolute",
            },
          }}
        >
          <Tabs.Screen name="home" options={{ href: null }} />
          <Tabs.Screen name="shopping" options={{ title: "Shopping" }} />
          <Tabs.Screen name="fridge" options={{ title: "Fridge" }} />
          <Tabs.Screen name="calendar" options={{ title: "Calendar" }} />
          <Tabs.Screen name="transactions" options={{ title: "Transactions" }} />
          <Tabs.Screen
            name="settings"
            options={{
              title: "Settings",
              header: () => <TabAppHeader showHouseholdSubheader={false} />,
            }}
          />
        </Tabs>
      </HouseholdSessionGate>
    </AuthGuard>
  );
}
