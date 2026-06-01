import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  AddProductPreview,
  type PendingProduct,
} from "@/src/features/shoppingList/AddProductPreview";
import type { OffSearchHit } from "@/src/features/shoppingList/openFoodFactsApi";
import { displayBrand } from "@/src/features/shoppingList/productDisplay";
import { useProductSearch } from "@/src/features/shoppingList/useProductSearch";
import { useShoppingList } from "@/src/features/shoppingList/useShoppingList";
import { getUserFacingErrorMessage } from "@/src/shared/api/getUserFacingErrorMessage";
import { FormTextField } from "@/src/shared/components/form/FormTextField";
import { formStyles } from "@/src/shared/components/form/formStyles";
import { ModalScreen, modalScreenStyles } from "@/src/shared/components/ModalScreen";

export default function AddShoppingItemModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{ shoppingListId?: string; title?: string }>();
  const shoppingListId = params.shoppingListId ? Number(params.shoppingListId) : undefined;
  const modalTitle = params.title ?? "Add product";

  const { addByBarcode, fetchProductByBarcode, adding } = useShoppingList(shoppingListId);
  const { query, setQuery, results, showResults, searching, searchError, isBarcodeQuery, trimmedQuery } =
    useProductSearch();

  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingProduct | null>(null);
  const [pendingQty, setPendingQty] = useState(1);
  const [loadingPreview, setLoadingPreview] = useState(false);

  function clearPending() {
    setPending(null);
    setPendingQty(1);
    setError(null);
  }

  async function resolvePendingFromBarcode(barcode: string): Promise<boolean> {
    setLoadingPreview(true);
    setError(null);
    try {
      const product = await fetchProductByBarcode(barcode);
      if (!product) {
        setError("No product found for this barcode.");
        return false;
      }
      setPending({
        barcode,
        name: product.name,
        brand: product.brand,
        quantity: product.quantity,
      });
      setPendingQty(1);
      return true;
    } catch (err) {
      setError(getUserFacingErrorMessage(err, "Could not load product."));
      return false;
    } finally {
      setLoadingPreview(false);
    }
  }

  async function handleAddPending() {
    if (!pending) return;
    setError(null);
    const result = await addByBarcode(pending.barcode, pendingQty);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    router.back();
  }

  function onSelectHit(hit: OffSearchHit) {
    setPending({
      barcode: hit.barcode,
      name: hit.name,
      brand: hit.brand || undefined,
    });
    setPendingQty(1);
    setError(null);
  }

  async function onBarcodeQuerySelect() {
    await resolvePendingFromBarcode(trimmedQuery);
  }

  if (shoppingListId == null || Number.isNaN(shoppingListId)) {
    return (
      <ModalScreen title={modalTitle}>
        <View style={modalScreenStyles.container}>
          <Text style={styles.errorText}>Shopping list is not available.</Text>
        </View>
      </ModalScreen>
    );
  }

  return (
    <ModalScreen title={modalTitle}>
      <View style={modalScreenStyles.container}>
          {!pending && (
            <FormTextField
              value={query}
              onChangeText={(text) => {
                setQuery(text);
                setError(null);
              }}
              placeholder="Search by product name…"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!adding && !loadingPreview}
            />
          )}

          {!!error && !pending && <Text style={formStyles.submitError}>{error}</Text>}
          {!!searchError && !pending && <Text style={formStyles.submitError}>{searchError}</Text>}

          {pending && (
            <>
              <AddProductPreview
                product={pending}
                quantity={pendingQty}
                onQuantityChange={setPendingQty}
                onAdd={() => void handleAddPending()}
                onCancel={clearPending}
                adding={adding}
                loading={loadingPreview}
              />
              {!!error && <Text style={formStyles.submitError}>{error}</Text>}
            </>
          )}

          {!pending && (
            <ScrollView contentContainerStyle={styles.resultsContent} keyboardShouldPersistTaps="handled">
              {(searching || loadingPreview) && (
                <View style={styles.searchingRow}>
                  <ActivityIndicator size="small" />
                  <Text style={styles.searchingText}>
                    {loadingPreview ? "Loading product…" : "Searching…"}
                  </Text>
                </View>
              )}

              {isBarcodeQuery && trimmedQuery.length >= 8 && !loadingPreview && (
                <Pressable
                  style={styles.resultItem}
                  disabled={adding || loadingPreview}
                  onPress={() => void onBarcodeQuerySelect()}
                >
                  <Text style={styles.resultTitle}>Look up barcode {trimmedQuery}</Text>
                </Pressable>
              )}

              {!searching &&
                !isBarcodeQuery &&
                trimmedQuery.length >= 2 &&
                !showResults &&
                !searchError && (
                  <Text style={styles.emptyResults}>No products found. Try another name.</Text>
                )}

              {showResults &&
                results.map((hit) => {
                  const brand = displayBrand(hit.brand);
                  return (
                    <Pressable
                      key={hit.barcode}
                      style={styles.resultItem}
                      disabled={adding || loadingPreview}
                      onPress={() => onSelectHit(hit)}
                    >
                      <Text style={styles.resultTitle}>{hit.name}</Text>
                      {!!brand && <Text style={styles.resultMeta}>{brand}</Text>}
                    </Pressable>
                  );
                })}
            </ScrollView>
          )}
      </View>
    </ModalScreen>
  );
}

const styles = StyleSheet.create({
  errorText: { color: "#dc2626" },
  resultsContent: { gap: 10, paddingBottom: 24 },
  searchingRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  searchingText: { color: "#6b7280" },
  resultItem: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
  },
  resultTitle: { fontSize: 16, fontWeight: "600" },
  resultMeta: { color: "#6b7280", fontSize: 14, marginTop: 4 },
  emptyResults: { color: "#6b7280", textAlign: "center", paddingTop: 8 },
});
