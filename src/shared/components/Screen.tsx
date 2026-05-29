import type { ReactNode } from "react";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";

type ScreenProps = {
  children: ReactNode;
  /** When true, Stack/Tabs header already handles the top inset. */
  withStackHeader?: boolean;
  edges?: Edge[];
};

export function Screen({ children, withStackHeader = false, edges }: ScreenProps) {
  const resolvedEdges = edges ?? (withStackHeader ? ["bottom"] : ["top", "bottom"]);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={resolvedEdges}>
      {children}
    </SafeAreaView>
  );
}
