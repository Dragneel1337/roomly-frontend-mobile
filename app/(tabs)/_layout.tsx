import { Tabs, useRouter } from "expo-router";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerTitle: "Roomly",
        headerRight: () => (
          <Pressable
            onPress={() => router.push("/(modals)/menu")}
            style={{ paddingHorizontal: 14, paddingVertical: 8 }}
            accessibilityLabel="Open menu"
          >
            <Ionicons name="menu" size={22} />
          </Pressable>
        ),
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
          tabBarIcon: ({ color, size }) => <Ionicons name="snow-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

