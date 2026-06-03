import { type ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  MemberAvatarStack,
  type MemberAvatarSource,
} from "@/src/features/household/MemberAvatarStack";
import type { ProfileListResource } from "@/src/features/household/householdResourcesApi";
import type { PendingProduct } from "@/src/features/shoppingList/pendingProduct";
import { displayBrand } from "@/src/features/shoppingList/productDisplay";
import { FormSubmitButton } from "@/src/shared/components/form/FormSubmitButton";
import { authCardShadow } from "@/src/shared/theme/authScreenStyles";
import { colors } from "@/src/shared/theme/colors";
import { spacing } from "@/src/shared/theme/spacing";

export function profileToAvatarSource(member: ProfileListResource): MemberAvatarSource {
  return {
    profileId: member.profileId,
    avatarName: member.avatar.name,
    colorName: member.avatar.colorName,
  };
}

export type ShoppingListVisibility = "private" | "shared";

type AddShoppingProductFormProps = {
  product: PendingProduct;
  quantity: number;
  onQuantityChange: (value: number) => void;
  visibility: ShoppingListVisibility;
  onVisibilityChange: (value: ShoppingListVisibility) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  onAdd: () => void;
  adding?: boolean;
  loading?: boolean;
  privateMember: MemberAvatarSource;
  sharedMembers: MemberAvatarSource[];
};

export function AddShoppingProductForm({
  product,
  quantity,
  onQuantityChange,
  visibility,
  onVisibilityChange,
  notes,
  onNotesChange,
  onAdd,
  adding = false,
  loading = false,
  privateMember,
  sharedMembers,
}: AddShoppingProductFormProps) {
  const brandLabel = displayBrand(product.brand) || "—";
  const busy = adding || loading;

  return (
    <View style={styles.card}>
      <View style={styles.productBlock}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.productBrand} numberOfLines={1}>
          {brandLabel}
        </Text>
        <View style={styles.quantityRow}>
          <Text style={styles.quantityLabel}>Quantity:</Text>
          <View style={styles.stepper}>
            <Pressable
              style={[styles.stepButton, busy && styles.stepDisabled]}
              disabled={busy || quantity <= 1}
              onPress={() => onQuantityChange(quantity - 1)}
              accessibilityLabel="Decrease quantity"
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
              accessibilityLabel="Increase quantity"
            >
              <Text style={styles.stepSymbol}>+</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.visibilityBlock}>
        <VisibilityOption
          label="Private"
          selected={visibility === "private"}
          disabled={busy}
          onPress={() => onVisibilityChange("private")}
          trailing={<MemberAvatarStack members={[privateMember]} />}
        />
        <VisibilityOption
          label="Shared"
          selected={visibility === "shared"}
          disabled={busy}
          onPress={() => onVisibilityChange("shared")}
          trailing={<MemberAvatarStack members={sharedMembers} />}
        />
      </View>

      <View style={styles.notesBlock}>
        <Text style={styles.notesLabel}>Notes</Text>
        <TextInput
          style={styles.notesInput}
          value={notes}
          onChangeText={onNotesChange}
          placeholder="Add a note…"
          placeholderTextColor={colors.inputText}
          multiline
          textAlignVertical="top"
          editable={!busy}
        />
      </View>

      <FormSubmitButton
        label="Add"
        loadingLabel="Adding…"
        loading={adding}
        disabled={loading}
        onPress={onAdd}
        style={styles.addButton}
      />
    </View>
  );
}

function VisibilityOption({
  label,
  selected,
  disabled,
  onPress,
  trailing,
}: {
  label: string;
  selected: boolean;
  disabled?: boolean;
  onPress: () => void;
  trailing: ReactNode;
}) {
  return (
    <Pressable
      style={styles.visibilityRow}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
    >
      <View style={styles.visibilityLeft}>
        <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
          {selected ? <View style={styles.radioInner} /> : null}
        </View>
        <Text style={styles.visibilityLabel}>{label}</Text>
      </View>
      {trailing}
    </Pressable>
  );
}

type AddShoppingProductFormLoadingProps = {
  message?: string;
};

export function AddShoppingProductFormLoading({
  message = "Loading product…",
}: AddShoppingProductFormLoadingProps) {
  return (
    <View style={[styles.card, styles.loadingCard]}>
      <ActivityIndicator color={colors.textPrimary} />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.field,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 24,
    gap: 18,
    ...authCardShadow,
  },
  loadingCard: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    color: colors.textPrimary,
    fontSize: 15,
  },
  productBlock: {
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
  stepDisabled: {
    opacity: 0.45,
  },
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
  visibilityBlock: {
    gap: 12,
  },
  visibilityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  visibilityLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexShrink: 1,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.button,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: {
    borderColor: colors.button,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.button,
  },
  visibilityLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  notesBlock: {
    gap: 8,
  },
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
  addButton: {
    marginTop: 4,
    borderRadius: 999,
    paddingVertical: 14,
  },
});
