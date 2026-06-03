import { Ionicons } from "@expo/vector-icons";
import { Platform, Pressable, StyleSheet } from "react-native";
import { colors } from "@/src/shared/theme/colors";

export const SHOPPING_FAB_SIZE = 56;

type ShoppingFabProps = {
  onPress: () => void;
};

export function ShoppingFab({ onPress }: ShoppingFabProps) {
  return (
    <Pressable
      style={[styles.fab, fabShadow]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Add product"
    >
      <Ionicons name="add" size={32} color={colors.onHeader} />
    </Pressable>
  );
}

const fabShadow = Platform.select({
  ios: {
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 3, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 4,
  },
  android: { elevation: 8 },
  default: {},
});

const styles = StyleSheet.create({
  fab: {
    width: SHOPPING_FAB_SIZE,
    height: SHOPPING_FAB_SIZE,
    borderRadius: SHOPPING_FAB_SIZE / 2,
    backgroundColor: colors.button,
    alignItems: "center",
    justifyContent: "center",
  },
});
