import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HouseholdSubheader } from "@/src/features/household/HouseholdSubheader";
import { colors } from "@/src/shared/theme/colors";
import { typography } from "@/src/shared/theme/typography";
import { routes } from "@/src/shared/routes";

export function TabAppHeader() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top }]}>
      <View style={styles.row}>
        <Pressable
          onPress={() => router.push(routes.tabs.home)}
          accessibilityRole="button"
          accessibilityLabel="Go to home"
        >
          <Text style={styles.title}>Roomly</Text>
        </Pressable>
      </View>
      <HouseholdSubheader />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.header,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
    paddingHorizontal: 16,
  },
  title: {
    ...typography.headerBrand,
    color: colors.onHeader,
  },
});
