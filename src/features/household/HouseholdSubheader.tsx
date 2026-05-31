import { StyleSheet, Text, View } from "react-native";
import { useHousehold } from "./HouseholdProvider";

export function HouseholdSubheader() {
  const { household, isReady } = useHousehold();

  if (!isReady || !household) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text} numberOfLines={1}>
        {household.name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: "#fff",
  },
  text: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
});
