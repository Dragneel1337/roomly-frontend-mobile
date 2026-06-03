import {
  BottomTabBarHeightCallbackContext,
  type BottomTabBarProps,
} from "@react-navigation/bottom-tabs";
import { PlatformPressable } from "@react-navigation/elements";
import { CommonActions } from "@react-navigation/native";
import { useContext, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TabBarIcon } from "@/src/shared/navigation/tabBarIcons";
import {
  getTabBarOccupiedHeight,
  TAB_BAR_SAFE_AREA_GAP,
  TAB_BOTTOM_ACCENT_HEIGHT,
  TAB_ROW_HEIGHT,
  TAB_TOTAL_HEIGHT,
} from "@/src/shared/navigation/tabBarLayout";
import { colors } from "@/src/shared/theme/colors";

const TAB_ICON_SIZE = 30;

const HIDDEN_TAB_ROUTES = new Set(["home"]);

export function RoomlyTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const onHeightChange = useContext(BottomTabBarHeightCallbackContext);
  const visibleRoutes = state.routes.filter((r) => !HIDDEN_TAB_ROUTES.has(r.name));
  const bottomInset = Math.max(insets.bottom, TAB_BAR_SAFE_AREA_GAP);

  const occupiedHeight = getTabBarOccupiedHeight(insets.bottom);

  useEffect(() => {
    onHeightChange?.(occupiedHeight);
  }, [onHeightChange, occupiedHeight]);

  return (
    <View style={[styles.outer, { marginBottom: bottomInset }]}>
      <View style={styles.shell}>
        <View style={styles.tabRow}>
          {visibleRoutes.map((route) => {
            const routeIndex = state.routes.findIndex((r) => r.key === route.key);
            const focused = state.index === routeIndex;
            const { options } = descriptors[route.key];

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.dispatch({
                  ...CommonActions.navigate(route.name, route.params),
                  target: state.key,
                });
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: "tabLongPress",
                target: route.key,
              });
            };

            const iconColor = focused ? colors.onHeader : colors.navBarIcon;

            return (
              <PlatformPressable
                key={route.key}
                accessibilityRole="button"
                accessibilityState={focused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel ?? route.name}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.tab}
              >
                <View style={[styles.tabSlot, focused && styles.tabSlotActive]}>
                  <View style={styles.iconWrap}>
                    <TabBarIcon routeName={route.name} size={TAB_ICON_SIZE} color={iconColor} />
                  </View>
                </View>
              </PlatformPressable>
            );
          })}
        </View>
        <View style={styles.bottomAccent} pointerEvents="none" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    backgroundColor: colors.background,
  },
  shell: {
    borderTopRightRadius: 18,
    overflow: "hidden",
    backgroundColor: colors.navBar,
  },
  tabRow: {
    flexDirection: "row",
    alignItems: "stretch",
    height: TAB_TOTAL_HEIGHT,
    paddingHorizontal: 2,
  },
  tab: {
    flex: 1,
    zIndex: 1,
  },
  tabSlot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 2,
  },
  tabSlotActive: {
    backgroundColor: colors.header,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    marginBottom: -TAB_BOTTOM_ACCENT_HEIGHT,
    paddingBottom: TAB_BOTTOM_ACCENT_HEIGHT,
  },
  iconWrap: {
    height: TAB_ROW_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomAccent: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: TAB_BOTTOM_ACCENT_HEIGHT,
    backgroundColor: colors.header,
    zIndex: 0,
  },
});
