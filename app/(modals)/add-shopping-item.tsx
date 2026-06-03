import { Stack, useLocalSearchParams, useRouter, type Href } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { TabAppHeader } from "@/src/features/household/TabAppHeader";
import type { OffSearchHit } from "@/src/features/product/openFoodFactsApi";
import { ProductResultCard } from "@/src/features/product/ProductResultCard";
import { ProductSearchBar } from "@/src/features/product/ProductSearchBar";
import { displayBrand } from "@/src/features/product/productDisplay";
import { useProductSearch } from "@/src/features/product/useProductSearch";
import { formStyles } from "@/src/shared/components/form/formStyles";
import { Screen } from "@/src/shared/components/Screen";
import { routes } from "@/src/shared/routes";
import { colors } from "@/src/shared/theme/colors";
import { spacing } from "@/src/shared/theme/spacing";

export default function AddShoppingItemModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    ownShoppingListId?: string;
    sharedShoppingListId?: string;
  }>();

  const ownShoppingListId = params.ownShoppingListId;
  const sharedShoppingListId = params.sharedShoppingListId;

  const {
    query,
    setQuery,
    results,
    showResults,
    searching,
    searchError,
    isBarcodeQuery,
    trimmedQuery,
    submitSearch,
  } = useProductSearch();

  const [error, setError] = useState<string | null>(null);

  function goToProductDetail(barcode: string, name?: string, brand?: string) {
    router.push({
      pathname: routes.modals.addShoppingProduct,
      params: {
        barcode,
        name: name ?? "",
        brand: brand ?? "",
        ownShoppingListId: ownShoppingListId ?? "",
        sharedShoppingListId: sharedShoppingListId ?? "",
      },
    } as Href);
  }

  function onSelectHit(hit: OffSearchHit) {
    goToProductDetail(hit.barcode, hit.name, hit.brand || undefined);
  }

  function onBarcodeQuerySelect() {
    goToProductDetail(trimmedQuery);
  }

  const listIdsValid = !!ownShoppingListId && !!sharedShoppingListId;
  const busy = searching;

  return (
    <>
      <Stack.Screen options={{ header: () => <TabAppHeader showBack showHouseholdSubheader={false} /> }} />
      <Screen withStackHeader>
        <View style={styles.container}>
          {!listIdsValid ? (
            <Text style={styles.errorText}>Shopping list is not available.</Text>
          ) : (
            <>
              <ProductSearchBar
                value={query}
                onChangeText={(text) => {
                  setQuery(text);
                  setError(null);
                }}
                onSearch={submitSearch}
                editable={!busy}
              />

              {!!error && <Text style={formStyles.submitError}>{error}</Text>}
              {!!searchError && <Text style={formStyles.submitError}>{searchError}</Text>}

              <ScrollView
                style={styles.resultsScroll}
                contentContainerStyle={styles.resultsContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {searching && (
                  <View style={styles.searchingRow}>
                    <ActivityIndicator size="small" color={colors.textPrimary} />
                    <Text style={styles.searchingText}>Searching…</Text>
                  </View>
                )}

                {isBarcodeQuery && trimmedQuery.length >= 8 && !searching && (
                  <ProductResultCard
                    title={`Look up barcode ${trimmedQuery}`}
                    onPress={onBarcodeQuerySelect}
                    disabled={busy}
                  />
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
                      <ProductResultCard
                        key={hit.barcode}
                        title={hit.name}
                        subtitle={brand || undefined}
                        onPress={() => onSelectHit(hit)}
                        disabled={busy}
                      />
                    );
                  })}
              </ScrollView>
            </>
          )}
        </View>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.sectionGap,
    gap: spacing.sectionGap,
  },
  resultsScroll: {
    flex: 1,
  },
  resultsContent: {
    gap: 12,
    paddingBottom: 32,
  },
  searchingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  searchingText: {
    color: colors.textSecondary,
    fontSize: 15,
  },
  emptyResults: {
    color: colors.textSecondary,
    textAlign: "center",
    paddingTop: 12,
    fontSize: 15,
  },
  errorText: {
    color: colors.error,
    textAlign: "center",
  },
});
