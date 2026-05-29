import { StyleSheet, Text, View } from "react-native";
import { Screen } from "@/src/shared/components/Screen";

export default function FridgeTab() {
  return (
    <Screen withStackHeader>
      <View style={styles.container}>
        <Text style={styles.title}>Fridge</Text>
        <Text style={styles.subtitle}>Placeholder screen</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 8 },
  title: { fontSize: 22, fontWeight: "700" },
  subtitle: { color: "#6b7280" },
});
