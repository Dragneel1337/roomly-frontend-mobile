export { colors } from "./colors";
export { typography } from "./typography";
export { spacing } from "./spacing";

import { colors } from "./colors";

/** Stack / modal headers aligned with Figma Header component */
export const stackHeaderOptions = {
  headerStyle: { backgroundColor: colors.header },
  headerTintColor: colors.onHeader,
  headerTitleStyle: { fontWeight: "600" as const, color: colors.onHeader },
  headerShadowVisible: false,
};
