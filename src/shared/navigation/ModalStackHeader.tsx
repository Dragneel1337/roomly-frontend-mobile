import { getHeaderTitle, Header, HeaderBackButton } from "@react-navigation/elements";
import type { NativeStackHeaderProps } from "@react-navigation/native-stack";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { isRoomlyBrandHeaderTitle } from "@/src/shared/brand/brandAssets";
import { RoomlyHeaderBrand } from "@/src/shared/components/RoomlyHeaderBrand";
import { HeaderBackChevronIcon } from "./HeaderBackChevronIcon";

/** Stack header for modals — keeps back button and title below the status bar / notch. */
export function ModalStackHeader({ options, route, back }: NativeStackHeaderProps) {
  const insets = useSafeAreaInsets();
  const title = getHeaderTitle(options, route.name);
  const showBrandLogo = isRoomlyBrandHeaderTitle(title);

  const showBack = options.headerBackVisible !== false && back != null;
  const titleStyle = StyleSheet.flatten(options.headerTitleStyle);

  const headerLeft =
    options.headerLeft ??
    (showBack
      ? (props) => (
          <HeaderBackButton
            {...props}
            displayMode="minimal"
            backImage={() => <HeaderBackChevronIcon />}
          />
        )
      : undefined);

  return (
    <Header
      title={showBrandLogo ? "" : title}
      headerTitle={
        showBrandLogo
          ? () => (
              <RoomlyHeaderBrand
                fontSize={typeof titleStyle?.fontSize === "number" ? titleStyle.fontSize : undefined}
                color={typeof titleStyle?.color === "string" ? titleStyle.color : undefined}
              />
            )
          : options.headerTitle
      }
      back={showBack ? back : undefined}
      headerLeft={headerLeft}
      headerBackButtonDisplayMode="minimal"
      headerStatusBarHeight={insets.top}
      headerStyle={options.headerStyle}
      headerTintColor={options.headerTintColor}
      headerTitleStyle={options.headerTitleStyle}
      headerTitleAlign={options.headerTitleAlign}
    />
  );
}
