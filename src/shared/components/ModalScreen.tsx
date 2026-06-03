import { Stack } from "expo-router";
import type { ReactNode } from "react";
import { StyleSheet } from "react-native";
import { ROOMLY_HEADER_TITLE } from "@/src/shared/brand/brandAssets";
import { Screen } from "@/src/shared/components/Screen";
import { colors } from "@/src/shared/theme/colors";
import { spacing } from "@/src/shared/theme/spacing";

type ModalScreenProps = {
  /** Pass {@link ROOMLY_HEADER_TITLE} for the bamboo logo in the stack header. */
  title: string;
  children: ReactNode;
};

export { ROOMLY_HEADER_TITLE };

/**
 * Stack layout: title + back in ModalStackHeader (guest / onboarding / modals _layout),
 * content below the header without overlapping the top safe area.
 */
export function ModalScreen({ title, children }: ModalScreenProps) {
  return (
    <>
      <Stack.Screen options={{ title }} />
      <Screen withStackHeader>{children}</Screen>
    </>
  );
}

export const modalScreenStyles = StyleSheet.create({
  container: { flex: 1, padding: spacing.screenPadding, gap: spacing.sectionGap },
  subtitle: { color: colors.textSecondary },
});
