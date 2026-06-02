import type { ReactNode } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { colors } from "@/src/shared/theme/colors";

type ScreenProps = {
  children: ReactNode;
  withStackHeader?: boolean;
  edges?: Edge[];
};

export function Screen({ children, withStackHeader = false, edges }: ScreenProps) {
  const resolvedEdges = edges ?? (withStackHeader ? ["bottom"] : ["top", "bottom"]);

  return (
    <SafeAreaView style={styles.root} edges={resolvedEdges}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
