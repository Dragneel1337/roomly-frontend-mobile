import { Stack, useLocalSearchParams, useRouter, type Href } from "expo-router";
import { View, StyleSheet } from "react-native";
import { TabAppHeader } from "@/src/features/household/TabAppHeader";
import { BarcodeScannerView } from "@/src/features/shoppingList/BarcodeScannerView";
import { Screen } from "@/src/shared/components/Screen";
import { routes } from "@/src/shared/routes";
import { spacing } from "@/src/shared/theme/spacing";

export default function AddFridgeScanModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    ownInventoryId?: string;
    sharedInventoryId?: string;
  }>();

  function onBarcodeScanned(barcode: string) {
    router.replace({
      pathname: routes.modals.addFridgeProduct,
      params: {
        barcode,
        name: "",
        brand: "",
        ownInventoryId: params.ownInventoryId ?? "",
        sharedInventoryId: params.sharedInventoryId ?? "",
      },
    } as Href);
  }

  return (
    <>
      <Stack.Screen options={{ header: () => <TabAppHeader showBack showHouseholdSubheader={false} /> }} />
      <Screen withStackHeader>
        <View style={styles.container}>
          <BarcodeScannerView
            onBarcodeScanned={onBarcodeScanned}
            onBack={() => router.back()}
          />
        </View>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.screenPadding,
  },
});
