import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useHousehold } from "@/src/features/household/HouseholdProvider";
import { resetToTabs } from "@/src/shared/navigation/resetRoutes";
import { ModalScreen, modalScreenStyles } from "@/src/shared/components/ModalScreen";
import { formStyles } from "@/src/shared/components/form/formStyles";

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
      resetToTabs(router);
    } finally {
      setSwitchingId(null);
    }
  }

  return (
    <ModalScreen title="Switch household">
      <View style={modalScreenStyles.container}>
        <Text style={modalScreenStyles.subtitle}>Choose which household to open.</Text>

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
    </ModalScreen>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10, marginTop: 4 },
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
