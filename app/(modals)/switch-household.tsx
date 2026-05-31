import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useHousehold } from "@/src/features/household/HouseholdProvider";
import { formStyles } from "@/src/shared/components/form/formStyles";
import { Screen } from "@/src/shared/components/Screen";

export default function SwitchHouseholdModal() {
  const router = useRouter();
  const { households, activeHouseholdId, switchHousehold } = useHousehold();
  const [error, setError] = useState<string | null>(null);
  const [switchingId, setSwitchingId] = useState<string | null>(null);

  async function onSelect(householdId: string) {
    if (householdId === activeHouseholdId || switchingId) return;
    setSwitchingId(householdId);
    setError(null);
    try {
      const switchError = await switchHousehold(householdId);
      if (switchError === "profile_not_found") {
        setError("Could not switch to this household. Try joining it again.");
        return;
      }
      router.back();
    } finally {
      setSwitchingId(null);
    }
  }

  return (
    <Screen withStackHeader>
      <View style={styles.container}>
        <Text style={styles.title}>Switch household</Text>
        <Text style={styles.subtitle}>Choose which household to open.</Text>

        <View style={styles.list}>
          {households.map((item) => {
            const isActive = item.id === activeHouseholdId;
            const isSwitching = switchingId === item.id;
            return (
              <Pressable
                key={item.id}
                style={[styles.item, isActive && styles.itemActive]}
                disabled={isSwitching || !!switchingId}
                onPress={() => void onSelect(item.id)}
              >
                <Text style={styles.itemTitle}>{item.name}</Text>
                <Text style={styles.itemMeta}>
                  {item.membersCount}/{item.membersLimit} members
                  {isActive ? " · Current" : ""}
                  {isSwitching ? " · Switching…" : ""}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {!!error && <Text style={formStyles.submitError}>{error}</Text>}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 10 },
  title: { fontSize: 22, fontWeight: "700" },
  subtitle: { color: "#6b7280", marginBottom: 4 },
  list: { gap: 10, marginTop: 8 },
  item: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
  },
  itemActive: {
    borderColor: "#2563eb",
    backgroundColor: "#eff6ff",
  },
  itemTitle: { fontSize: 16, fontWeight: "600" },
  itemMeta: { color: "#6b7280", marginTop: 4, fontSize: 13 },
});
