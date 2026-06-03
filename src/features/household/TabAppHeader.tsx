import { useRouter, useSegments } from "expo-router";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HouseholdSubheader } from "@/src/features/household/HouseholdSubheader";
import { ProfileHeaderAvatar } from "@/src/features/profile/ProfileHeaderAvatar";
import {
  getAvatarHeaderRowMinHeight,
  getAvatarHeaderStageWidth,
} from "@/src/features/profile/avatarDisplay";
import { RoomlyHeaderBrand } from "@/src/shared/components/RoomlyHeaderBrand";
import { HeaderBackChevronIcon } from "@/src/shared/navigation/HeaderBackChevronIcon";
import { colors } from "@/src/shared/theme/colors";
import { routes } from "@/src/shared/routes";

const HEADER_SIDE_WIDTH = 48;
const HEADER_AVATAR_SLOT_WIDTH = getAvatarHeaderStageWidth();
const HEADER_ROW_MIN_HEIGHT = getAvatarHeaderRowMinHeight();

type TabAppHeaderProps = {
  showBack?: boolean;
  onBackPress?: () => void;
  showHouseholdSubheader?: boolean;
};

function getMainTabSegment(segments: string[]): string | null {
  const tabsIndex = segments.indexOf("(tabs)");
  if (tabsIndex < 0) return null;
  return segments[tabsIndex + 1] ?? "home";
}

export function TabAppHeader({
  showBack = false,
  onBackPress,
  showHouseholdSubheader = true,
}: TabAppHeaderProps) {
  const router = useRouter();
  const segments = useSegments();
  const insets = useSafeAreaInsets();

  const mainTab = getMainTabSegment(segments as string[]);
  const isHomeTab = mainTab === "home";
  const showBackToHome = mainTab != null && !isHomeTab;
  const showBackChevron = showBack || showBackToHome;

  function handleBack() {
    if (onBackPress) {
      onBackPress();
      return;
    }
    if (showBackToHome) {
      router.navigate(routes.tabs.home);
      return;
    }
    router.back();
  }

  return (
    <View style={styles.wrapper}>
      <View style={[styles.bar, headerBarShadow, { paddingTop: insets.top }]}>
        <View style={styles.row}>
          <View style={styles.sideSlot}>
            {showBackChevron ? (
              <Pressable
                onPress={handleBack}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel={showBackToHome && !onBackPress ? "Go to home" : "Go back"}
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
            <RoomlyHeaderBrand />
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
    overflow: "visible",
  },
  backButton: {
    padding: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: HEADER_ROW_MIN_HEIGHT,
    paddingLeft: 12,
    paddingRight: 8,
    overflow: "visible",
  },
  sideSlot: {
    width: HEADER_SIDE_WIDTH,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  sideSlotRight: {
    width: HEADER_AVATAR_SLOT_WIDTH,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  titlePressable: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
