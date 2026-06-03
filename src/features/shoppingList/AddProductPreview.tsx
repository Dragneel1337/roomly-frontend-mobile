import { Pressable, StyleSheet, Text, View } from "react-native";
import { QuantityStepper } from "./QuantityStepper";
import { formatProductMeta } from "./productDisplay";
import { FormSubmitButton } from "@/src/shared/components/form/FormSubmitButton";

import type { PendingProduct } from "@/src/features/shoppingList/pendingProduct";

export type { PendingProduct };

type AddProductPreviewProps = {
  product: PendingProduct;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onAdd: () => void;
  onCancel: () => void;
  adding?: boolean;
  loading?: boolean;
};

export function AddProductPreview({
  product,
  quantity,
  onQuantityChange,
  onAdd,
  onCancel,
  adding = false,
  loading = false,
}: AddProductPreviewProps) {
  const meta = formatProductMeta(product.brand, product.quantity);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{product.name}</Text>
      {!!meta && <Text style={styles.meta}>{meta}</Text>}
      <Text style={styles.barcode}>Barcode: {product.barcode}</Text>

      <View style={styles.qtyRow}>
        <Text style={styles.qtyLabel}>Quantity</Text>
        <QuantityStepper
          value={quantity}
          onChange={onQuantityChange}
          disabled={adding || loading}
        />
      </View>

      <FormSubmitButton
        label="Add to list"
        loadingLabel="Adding…"
        loading={adding}
        disabled={loading}
        onPress={onAdd}
      />

      <Pressable style={styles.cancelButton} disabled={adding} onPress={onCancel}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#2563eb",
    borderRadius: 12,
    backgroundColor: "#eff6ff",
  },
  title: { fontSize: 18, fontWeight: "700" },
  meta: { color: "#6b7280", fontSize: 14 },
  barcode: { color: "#9ca3af", fontSize: 12 },
  qtyRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  qtyLabel: { fontSize: 15, fontWeight: "500" },
  cancelButton: { alignSelf: "center", paddingVertical: 8 },
  cancelButtonText: { color: "#6b7280", fontWeight: "600" },
});
