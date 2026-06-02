import { getHeaderTitle, Header, HeaderBackButton } from "@react-navigation/elements";
import type { NativeStackHeaderProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HeaderBackChevronIcon } from "./HeaderBackChevronIcon";

/** Stack header for modals — keeps back button and title below the status bar / notch. */
export function ModalStackHeader({ options, route, back }: NativeStackHeaderProps) {
  const insets = useSafeAreaInsets();
  const title = getHeaderTitle(options, route.name);

  const showBack = options.headerBackVisible !== false && back != null;

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
      title={title}
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
