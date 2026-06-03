import { useRouter } from "expo-router";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HouseholdSubheader } from "@/src/features/household/HouseholdSubheader";
import { ProfileHeaderAvatar } from "@/src/features/profile/ProfileHeaderAvatar";
import { HeaderBackChevronIcon } from "@/src/shared/navigation/HeaderBackChevronIcon";
import { colors } from "@/src/shared/theme/colors";
import { routes } from "@/src/shared/routes";

const HEADER_SIDE_WIDTH = 48;

type TabAppHeaderProps = {
  showBack?: boolean;
  onBackPress?: () => void;
  showHouseholdSubheader?: boolean;
};

export function TabAppHeader({
  showBack = false,
  onBackPress,
  showHouseholdSubheader = true,
}: TabAppHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  function handleBack() {
    if (onBackPress) {
      onBackPress();
      return;
    }
    router.back();
  }

  return (
    <View style={styles.wrapper}>
      <View style={[styles.bar, headerBarShadow, { paddingTop: insets.top }]}>
        <View style={styles.row}>
          <View style={styles.sideSlot}>
            {showBack ? (
              <Pressable
                onPress={handleBack}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Go back"
                style={styles.backButton}
              >
                <HeaderBackChevronIcon />
              </Pressable>
            ) : null}
          </View>
          <Pressable
            style={styles.titlePressable}
            onPress={() => router.navigate(routes.tabs.home)}
            accessibilityRole="button"
            accessibilityLabel="Go to home"
          >
            <Text style={styles.title}>#Roomly</Text>
          </Pressable>
          <View style={[styles.sideSlot, styles.sideSlotRight]}>
            <ProfileHeaderAvatar onPress={() => router.push(routes.modals.profile)} />
          </View>
        </View>
      </View>
      {showHouseholdSubheader ? <HouseholdSubheader /> : null}
    </View>
  );
}

const headerBarShadow = Platform.select({
  ios: {
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  android: { elevation: 6 },
  default: {},
});

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
  },
  bar: {
    backgroundColor: colors.header,
    zIndex: 1,
  },
  backButton: {
    padding: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 48,
    paddingHorizontal: 12,
  },
  sideSlot: {
    width: HEADER_SIDE_WIDTH,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  sideSlotRight: {
    alignItems: "flex-end",
  },
  titlePressable: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.onHeader,
    textAlign: "center",
  },
});
