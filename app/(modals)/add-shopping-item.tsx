import { useRouter } from "expo-router";
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
import { BarcodeScannerView } from "@/src/features/shoppingList/BarcodeScannerView";
import type { OffSearchHit } from "@/src/features/shoppingList/openFoodFactsApi";
import { displayBrand } from "@/src/features/shoppingList/productDisplay";
import { useProductSearch } from "@/src/features/shoppingList/useProductSearch";
import { useHousehold } from "@/src/features/household/HouseholdProvider";
import { useShoppingList } from "@/src/features/shoppingList/useShoppingList";
import { getUserFacingErrorMessage } from "@/src/shared/api/getUserFacingErrorMessage";
import { FormTextField } from "@/src/shared/components/form/FormTextField";
import { formStyles } from "@/src/shared/components/form/formStyles";
import { Screen } from "@/src/shared/components/Screen";

type AddMode = "search" | "scan";

export default function AddShoppingItemModal() {
  const router = useRouter();
  const { profile } = useHousehold();
  const shoppingListId = profile?.shoppingList.id;
  const { addByBarcode, fetchProductByBarcode, adding } = useShoppingList(shoppingListId);
  const { query, setQuery, results, showResults, searching, searchError, isBarcodeQuery, trimmedQuery } =
    useProductSearch();

  const [mode, setMode] = useState<AddMode>("search");
  const [error, setError] = useState<string | null>(null);
  const [scannerKey, setScannerKey] = useState(0);
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
      setScannerKey((key) => key + 1);
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

  async function onScanBarcode(barcode: string) {
    setMode("search");
    await resolvePendingFromBarcode(barcode);
  }

  if (mode === "scan" && !pending) {
    return (
      <Screen withStackHeader>
        <View style={styles.container}>
          <Text style={styles.title}>Scan barcode</Text>
          <BarcodeScannerView
            key={scannerKey}
            onBarcodeScanned={(barcode) => void onScanBarcode(barcode)}
            onBack={() => {
              setMode("search");
              setError(null);
            }}
            adding={adding || loadingPreview}
            error={error}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen withStackHeader>
      <View style={styles.container}>
        <Text style={styles.title}>Add product</Text>

        {!pending && (
          <>
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

            <Pressable
              style={styles.scanButton}
              disabled={adding || loadingPreview}
              onPress={() => {
                clearPending();
                setMode("scan");
              }}
            >
              <Text style={styles.scanButtonText}>Scan barcode</Text>
            </Pressable>
          </>
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
                <Text style={styles.emptyResults}>
                  No products found. Try another name or scan.
                </Text>
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 12 },
  title: { fontSize: 22, fontWeight: "700" },
  scanButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2563eb",
    alignSelf: "flex-start",
  },
  scanButtonText: { color: "#2563eb", fontWeight: "600" },
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
