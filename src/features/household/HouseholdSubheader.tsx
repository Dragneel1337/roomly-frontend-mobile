import { StyleSheet, Text, View } from "react-native";
import { useHousehold } from "./HouseholdProvider";
import { colors } from "@/src/shared/theme/colors";

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
    backgroundColor: colors.header,
  },
  text: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.inputBackground,
  },
});
