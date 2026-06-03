import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TabAppHeader } from "@/src/features/household/TabAppHeader";
import { useHouseholdResources } from "@/src/features/household/useHouseholdResources";
import { FridgeProductDetailCard } from "@/src/features/inventory/FridgeProductDetailCard";
import { useInventory } from "@/src/features/inventory/useInventory";
import { profileToAvatarSource } from "@/src/features/household/profileAvatar";
import { getUserFacingErrorMessage } from "@/src/shared/api/getUserFacingErrorMessage";
import { formStyles } from "@/src/shared/components/form/formStyles";
import { Screen } from "@/src/shared/components/Screen";
import { colors } from "@/src/shared/theme/colors";
import { spacing } from "@/src/shared/theme/spacing";

export default function FridgeProductDetailModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    inventoryId?: string;
    productId?: string;
    isShared?: string;
  }>();

  const inventoryId = params.inventoryId ? Number(params.inventoryId) : undefined;
  const productId = params.productId ? Number(params.productId) : undefined;
  const isShared = params.isShared === "1";

  const { resources } = useHouseholdResources();
  const {
    displayItems,
    loading,
    error,
    incrementItem,
    decrementItem,
    removeItem,
    updatingProductId,
  } = useInventory(inventoryId);

  const item = useMemo(
    () => displayItems.find((entry) => entry.product.id === productId),
    [displayItems, productId],
  );

  const owners = useMemo(() => {
    if (!resources) return [];
    if (isShared) {
      return resources.allMembers.map(profileToAvatarSource);
    }
    return [profileToAvatarSource(resources.own)];
  }, [resources, isShared]);

  const busy = updatingProductId === productId;

  function confirmRemove(onConfirm: () => void) {
    if (!item) return;
    Alert.alert(
      "Remove product?",
      `Remove "${item.product.name}" from the fridge?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", style: "destructive", onPress: () => void onConfirm() },
      ],
    );
  }

  async function removeAllAndClose() {
    if (!item || productId == null) return;
    try {
      await removeItem(productId, item.count);
      router.back();
    } catch {
      // error surfaced via hook refetch
    }
  }

  function onQuantityChange(next: number) {
    if (!item || productId == null) return;

    if (next <= 0 || (next < item.count && item.count <= 1)) {
      confirmRemove(() => void removeAllAndClose());
      return;
    }

    if (next > item.count) {
      void incrementItem(productId);
      return;
    }

    if (next < item.count) {
      void decrementItem(productId);
    }
  }

  function onRemoveAllPress() {
    confirmRemove(() => void removeAllAndClose());
  }

  return (
    <>
      <Stack.Screen options={{ header: () => <TabAppHeader showBack showHouseholdSubheader={false} /> }} />
      <Screen withStackHeader>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 16) + 24 },
          ]}
        >
          {inventoryId == null || productId == null ? (
            <Text style={styles.errorText}>Product is not available.</Text>
          ) : loading && !item ? (
            <ActivityIndicator color={colors.textPrimary} style={styles.loader} />
          ) : error && !item ? (
            <Text style={styles.errorText}>
              {getUserFacingErrorMessage(error, "Could not load product.")}
            </Text>
          ) : !item ? (
            <Text style={styles.errorText}>Product not found in this fridge.</Text>
          ) : (
            <FridgeProductDetailCard
              item={item}
              quantity={item.count}
              onQuantityChange={onQuantityChange}
              onRemoveAll={onRemoveAllPress}
              owners={owners}
              busy={busy}
            />
          )}
          {!!error && item && <Text style={formStyles.submitError}>{getUserFacingErrorMessage(error)}</Text>}
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
  },
  loader: { marginTop: 40 },
  errorText: { color: colors.error, textAlign: "center" },
});
