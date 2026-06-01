import { Stack } from "expo-router";
import type { ReactNode } from "react";
import { StyleSheet } from "react-native";
import { Screen } from "@/src/shared/components/Screen";

type ModalScreenProps = {
  title: string;
  children: ReactNode;
};

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
  container: { flex: 1, padding: 20, gap: 12 },
  subtitle: { color: "#6b7280" },
});
