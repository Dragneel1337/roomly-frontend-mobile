import type { ViewStyle } from "react-native";
import { NavChevronIcon } from "./NavChevronIcon";

type HeaderBackChevronIconProps = {
  height?: number;
  style?: ViewStyle;
};

/** Header back control — same chevron as avatar carousel (Figma). */
export function HeaderBackChevronIcon(props: HeaderBackChevronIconProps) {
  return <NavChevronIcon direction="left" {...props} />;
}
