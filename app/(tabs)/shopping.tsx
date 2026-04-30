import { StyleSheet, Text, View } from "react-native";

export default function ShoppingTab() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shopping</Text>
      <Text style={styles.subtitle}>Placeholder screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 8 },
  title: { fontSize: 22, fontWeight: "700" },
  subtitle: { color: "#6b7280" },
});

