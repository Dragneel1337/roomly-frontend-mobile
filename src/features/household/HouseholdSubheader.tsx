import { Platform, StyleSheet, Text, View } from "react-native";
import { useHousehold } from "./HouseholdProvider";
import { colors } from "@/src/shared/theme/colors";
import { spacing } from "@/src/shared/theme/spacing";

const pillShadow = Platform.select({
  ios: {
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  android: { elevation: 2 },
  default: {},
});

export function HouseholdSubheader() {
  const { household, isReady } = useHousehold();

  if (!isReady || !household) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.pill}>
        <Text style={styles.text} numberOfLines={1}>
          {household.name}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.screenPadding,
    paddingTop: 12,
    paddingBottom: 8,
  },
  pill: {
    backgroundColor: colors.field,
    borderRadius: spacing.cardRadius,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    ...pillShadow,
  },
  text: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
  },
});
