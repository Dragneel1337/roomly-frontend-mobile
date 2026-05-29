import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { JoinCodeForm } from "@/src/features/household/JoinCodeForm";
import { routes } from "@/src/shared/routes";
import { Screen } from "@/src/shared/components/Screen";

export default function ChooseHouseholdScreen() {
  const router = useRouter();

  return (
    <Screen withStackHeader>
      <View style={styles.container}>
        <Text style={styles.title}>Set up your household</Text>
        <Text style={styles.subtitle}>Join an existing household or create a new one.</Text>

        <Text style={styles.sectionTitle}>Join with code</Text>
        <JoinCodeForm
          submitLabel="Join household"
          placeholder="Enter 6-character code"
          onSubmit={(joinCode) =>
            router.push({ pathname: routes.onboarding.join, params: { joinCode } })
          }
        />

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Create new household</Text>
        <Pressable style={styles.button} onPress={() => router.push(routes.onboarding.createHousehold)}>
          <Text style={styles.buttonText}>Create household</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 10 },
  title: { fontSize: 22, fontWeight: "700" },
  subtitle: { color: "#6b7280", marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginTop: 8 },
  button: {
    backgroundColor: "#111827",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "white", fontWeight: "600" },
  divider: { height: 1, backgroundColor: "#eee", marginVertical: 10 },
});
