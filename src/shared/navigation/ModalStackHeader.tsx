import { getHeaderTitle, Header } from "@react-navigation/elements";
import type { NativeStackHeaderProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Stack header for modals — keeps back button and title below the status bar / notch. */
export function ModalStackHeader({ options, route, back }: NativeStackHeaderProps) {
  const insets = useSafeAreaInsets();
  const title = getHeaderTitle(options, route.name);

  return (
    <Header
      title={title}
      back={back}
      headerStatusBarHeight={insets.top}
      headerStyle={options.headerStyle}
      headerTintColor={options.headerTintColor}
      headerTitleStyle={options.headerTitleStyle}
    />
  );
}
