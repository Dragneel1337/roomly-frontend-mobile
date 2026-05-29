import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Screen } from "@/src/shared/components/Screen";

export default function MenuModal() {
  return (
    <Screen withStackHeader>
      <View style={styles.container}>
        <Text style={styles.title}>Menu</Text>

        <View style={styles.list}>
          <Link href="/(modals)/switch-household" style={styles.item}>
            Switch household / profile
          </Link>
          <Link href="/(modals)/profile" style={styles.item}>
            Profile
          </Link>
          <Link href="/(modals)/settings" style={styles.item}>
            Settings
          </Link>
        </View>

        <Text style={styles.subtitle}>Placeholder (no logic yet)</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 12 },
  title: { fontSize: 22, fontWeight: "700" },
  subtitle: { color: "#6b7280" },
  list: { gap: 10, marginTop: 6 },
  item: { paddingVertical: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: "#eee", borderRadius: 12 },
});
