import { Stack, useLocalSearchParams, useRouter, type Href } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TabAppHeader } from "@/src/features/household/TabAppHeader";
import { useHouseholdResources } from "@/src/features/household/useHouseholdResources";
import { useInventory } from "@/src/features/inventory/useInventory";
import { profileToAvatarSource } from "@/src/features/household/profileAvatar";
import {
  AddProductForm,
  AddProductFormLoading,
  type ProductListVisibility,
} from "@/src/features/product/AddProductForm";
import type { PendingProduct } from "@/src/features/product/pendingProduct";
import { getUserFacingErrorMessage } from "@/src/shared/api/getUserFacingErrorMessage";
import { formStyles } from "@/src/shared/components/form/formStyles";
import { Screen } from "@/src/shared/components/Screen";
import { routes } from "@/src/shared/routes";
import { colors } from "@/src/shared/theme/colors";
import { spacing } from "@/src/shared/theme/spacing";

export default function AddFridgeProductModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    barcode?: string;
    name?: string;
    brand?: string;
    ownInventoryId?: string;
    sharedInventoryId?: string;
  }>();

  const ownInventoryId = params.ownInventoryId ? Number(params.ownInventoryId) : undefined;
  const sharedInventoryId = params.sharedInventoryId
    ? Number(params.sharedInventoryId)
    : undefined;
  const barcode = params.barcode?.trim() ?? "";

  const { resources } = useHouseholdResources();
  const resolvedOwnId = ownInventoryId ?? resources?.own.inventoryId;
  const resolvedSharedId = sharedInventoryId ?? resources?.sharedInventoryId;

  const { addByBarcode, fetchProductByBarcode, adding } = useInventory(resolvedOwnId);

  const [product, setProduct] = useState<PendingProduct | null>(
    params.name
      ? { barcode, name: params.name, brand: params.brand || undefined }
      : null,
  );
  const [loadingProduct, setLoadingProduct] = useState(!params.name && barcode.length > 0);
  const [quantity, setQuantity] = useState(1);
  const [visibility, setVisibility] = useState<ProductListVisibility>("private");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const memberAvatars = useMemo(() => {
    if (!resources) return null;
    return {
      privateMember: profileToAvatarSource(resources.own),
      sharedMembers: resources.allMembers.map(profileToAvatarSource),
    };
  }, [resources]);

  useEffect(() => {
    if (!barcode || product) return;

    let cancelled = false;
    setLoadingProduct(true);
    setError(null);

    void fetchProductByBarcode(barcode)
      .then((resolved) => {
        if (cancelled) return;
        if (!resolved) {
          setError("No product found for this barcode.");
          return;
        }
        setProduct({
          barcode,
          name: resolved.name,
          brand: resolved.brand,
          quantity: resolved.quantity,
        });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(getUserFacingErrorMessage(err, "Could not load product."));
      })
      .finally(() => {
        if (!cancelled) setLoadingProduct(false);
      });

    return () => {
      cancelled = true;
    };
  }, [barcode, product, fetchProductByBarcode]);

  async function handleAdd() {
    if (!product) return;

    const inventoryId = visibility === "shared" ? resolvedSharedId : resolvedOwnId;
    if (inventoryId == null || Number.isNaN(inventoryId)) {
      setError("Fridge is not available.");
      return;
    }

    setError(null);
    const result = await addByBarcode(product.barcode, quantity, {
      targetInventoryId: inventoryId,
      notes: notes.trim() || null,
    });

    if (!result.ok) {
      setError(result.message);
      return;
    }

    router.replace(routes.tabs.fridge as Href);
  }

  const listIdsValid =
    resolvedOwnId != null &&
    !Number.isNaN(resolvedOwnId) &&
    resolvedSharedId != null &&
    !Number.isNaN(resolvedSharedId);

  return (
    <>
      <Stack.Screen options={{ header: () => <TabAppHeader showBack showHouseholdSubheader={false} /> }} />
      <Screen withStackHeader>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 16) + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {!barcode || !listIdsValid ? (
            <Text style={styles.errorText}>Product or fridge is not available.</Text>
          ) : loadingProduct || !product || !memberAvatars ? (
            <AddProductFormLoading
              message={!memberAvatars ? "Loading household…" : undefined}
            />
          ) : (
            <AddProductForm
              product={product}
              quantity={quantity}
              onQuantityChange={setQuantity}
              visibility={visibility}
              onVisibilityChange={setVisibility}
              notes={notes}
              onNotesChange={setNotes}
              onAdd={() => void handleAdd()}
              adding={adding}
              privateMember={memberAvatars.privateMember}
              sharedMembers={memberAvatars.sharedMembers}
            />
          )}
          {!!error && <Text style={formStyles.submitError}>{error}</Text>}
        </ScrollView>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.sectionGap,
    gap: spacing.sectionGap,
  },
  errorText: { color: colors.error, textAlign: "center" },
});
