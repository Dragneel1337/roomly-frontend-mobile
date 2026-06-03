import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { InventoryItem } from "@/src/features/inventory/inventoryApi";
import {
  MemberAvatarStack,
  type MemberAvatarSource,
} from "@/src/features/household/MemberAvatarStack";
import { displayBrand } from "@/src/features/shoppingList/productDisplay";
import { authCardShadow } from "@/src/shared/theme/authScreenStyles";
import { colors } from "@/src/shared/theme/colors";
import { spacing } from "@/src/shared/theme/spacing";

type FridgeProductDetailCardProps = {
  item: InventoryItem;
  quantity: number;
  onQuantityChange: (value: number) => void;
  onRemoveAll?: () => void;
  owners: MemberAvatarSource[];
  busy?: boolean;
};

export function FridgeProductDetailCard({
  item,
  quantity,
  onQuantityChange,
  onRemoveAll,
  owners,
  busy = false,
}: FridgeProductDetailCardProps) {
  const brandLabel = displayBrand(item.product.brand) || "—";
  const notesText = item.notes?.trim() ?? "";

  return (
    <View style={styles.card}>
      <View style={styles.productRow}>
        <View style={styles.productText}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.product.name}
          </Text>
          <Text style={styles.productBrand} numberOfLines={1}>
            {brandLabel}
          </Text>
          <View style={styles.quantityRow}>
            <Text style={styles.quantityLabel}>Quantity:</Text>
            <View style={styles.stepper}>
              <Pressable
                style={[styles.stepButton, busy && styles.stepDisabled]}
                disabled={busy || quantity <= 0}
                onPress={() => onQuantityChange(quantity - 1)}
              >
                <Text style={styles.stepSymbol}>−</Text>
              </Pressable>
              <View style={styles.quantityValueBox}>
                <Text style={styles.quantityValue}>{quantity}</Text>
              </View>
              <Pressable
                style={[styles.stepButton, busy && styles.stepDisabled]}
                disabled={busy}
                onPress={() => onQuantityChange(quantity + 1)}
              >
                <Text style={styles.stepSymbol}>+</Text>
              </Pressable>
            </View>
          </View>
        </View>
        <View style={styles.ownerSlot}>
          <MemberAvatarStack members={owners} />
        </View>
      </View>

      {!!notesText && (
        <View style={styles.notesBlock}>
          <Text style={styles.notesLabel}>Notes</Text>
          <TextInput
            style={styles.notesInput}
            value={notesText}
            editable={false}
            multiline
            textAlignVertical="top"
          />
        </View>
      )}

      {onRemoveAll ? (
        <Pressable
          style={[styles.removeButton, busy && styles.removeButtonDisabled]}
          disabled={busy}
          onPress={onRemoveAll}
          accessibilityLabel="Remove product from fridge"
        >
          <Text style={styles.removeButtonText}>
            {busy ? "Syncing…" : "Remove from fridge"}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.field,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 22,
    gap: 16,
    ...authCardShadow,
  },
  productRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  productText: {
    flex: 1,
    gap: 4,
  },
  productName: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  productBrand: {
    fontSize: 14,
    color: colors.textPrimary,
    opacity: 0.85,
  },
  ownerSlot: {
    justifyContent: "flex-start",
    paddingTop: 4,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 6,
  },
  quantityLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.button,
    alignItems: "center",
    justifyContent: "center",
  },
  stepDisabled: { opacity: 0.45 },
  stepSymbol: {
    color: colors.onHeader,
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 22,
  },
  quantityValueBox: {
    minWidth: 40,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: colors.white,
    alignItems: "center",
  },
  quantityValue: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  notesBlock: { gap: 8 },
  notesLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  notesInput: {
    minHeight: 100,
    borderRadius: spacing.cardRadius,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textPrimary,
  },
  removeButton: {
    alignSelf: "stretch",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#fef2f2",
    alignItems: "center",
  },
  removeButtonDisabled: { opacity: 0.6 },
  removeButtonText: {
    color: "#dc2626",
    fontWeight: "600",
    fontSize: 15,
  },
});
