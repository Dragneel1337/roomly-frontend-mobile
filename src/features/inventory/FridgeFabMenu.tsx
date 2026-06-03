import { Ionicons } from "@expo/vector-icons";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { SHOPPING_FAB_SIZE, ShoppingFab } from "@/src/features/shoppingList/ShoppingFab";
import { colors } from "@/src/shared/theme/colors";

const SUB_FAB_SIZE = 48;
const SUB_FAB_GAP = 12;

type FridgeFabMenuProps = {
  expanded: boolean;
  onToggle: () => void;
  onSearch: () => void;
  onScan: () => void;
};

export function FridgeFabMenu({ expanded, onToggle, onSearch, onScan }: FridgeFabMenuProps) {
  return (
    <View style={styles.wrap} pointerEvents="box-none">
      {expanded && (
        <View style={styles.subStack}>
          <Pressable
            style={[styles.subFab, subFabShadow]}
            onPress={onScan}
            accessibilityRole="button"
            accessibilityLabel="Scan barcode"
          >
            <Ionicons name="barcode-outline" size={26} color={colors.onHeader} />
          </Pressable>
          <Pressable
            style={[styles.subFab, subFabShadow]}
            onPress={onSearch}
            accessibilityRole="button"
            accessibilityLabel="Search products"
          >
            <Ionicons name="search" size={26} color={colors.onHeader} />
          </Pressable>
        </View>
      )}
      {expanded ? (
        <Pressable
          style={[styles.mainFab, subFabShadow]}
          onPress={onToggle}
          accessibilityRole="button"
          accessibilityLabel="Close add menu"
        >
          <Ionicons name="close" size={32} color={colors.onHeader} />
        </Pressable>
      ) : (
        <ShoppingFab onPress={onToggle} />
      )}
    </View>
  );
}

const subFabShadow = Platform.select({
  ios: {
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 3, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  android: { elevation: 8 },
  default: {},
});

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    gap: SUB_FAB_GAP,
  },
  subStack: {
    alignItems: "center",
    gap: SUB_FAB_GAP,
  },
  subFab: {
    width: SUB_FAB_SIZE,
    height: SUB_FAB_SIZE,
    borderRadius: SUB_FAB_SIZE / 2,
    backgroundColor: colors.button,
    alignItems: "center",
    justifyContent: "center",
  },
  mainFab: {
    width: SHOPPING_FAB_SIZE,
    height: SHOPPING_FAB_SIZE,
    borderRadius: SHOPPING_FAB_SIZE / 2,
    backgroundColor: colors.button,
    alignItems: "center",
    justifyContent: "center",
  },
});
