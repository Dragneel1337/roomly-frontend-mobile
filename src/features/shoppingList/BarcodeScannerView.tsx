import { CameraView, useCameraPermissions } from "expo-camera";
import { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { formStyles } from "@/src/shared/components/form/formStyles";

type BarcodeScannerViewProps = {
  onBarcodeScanned: (barcode: string) => void;
  onBack: () => void;
  adding?: boolean;
  error?: string | null;
};

export function BarcodeScannerView({
  onBarcodeScanned,
  onBack,
  adding = false,
  error = null,
}: BarcodeScannerViewProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  function handleScanAgain() {
    setScanned(false);
  }

  function handleBarcodeScanned({ data }: { data: string }) {
    if (scanned || adding) return;
    setScanned(true);
    onBarcodeScanned(data);
  }

  if (Platform.OS === "web") {
    return (
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>Camera not available on web</Text>
        <Pressable style={styles.secondaryButton} onPress={onBack}>
          <Text style={styles.secondaryButtonText}>Back to search</Text>
        </Pressable>
      </View>
    );
  }

  if (!permission) {
    return (
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>Checking camera permission…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>Camera access is required to scan barcodes.</Text>
        <Pressable style={styles.primaryButton} onPress={() => void requestPermission()}>
          <Text style={styles.primaryButtonText}>Allow camera</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={onBack}>
          <Text style={styles.secondaryButtonText}>Back to search</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.scannerContainer}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned || adding ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"],
        }}
      />
      <View style={styles.overlay}>
        <Text style={styles.hint}>Point your camera at a product barcode</Text>
        {adding && <Text style={styles.hint}>Adding product…</Text>}
        {!!error && <Text style={formStyles.submitError}>{error}</Text>}
        {scanned && !adding && !!error && (
          <Pressable style={styles.primaryButton} onPress={handleScanAgain}>
            <Text style={styles.primaryButtonText}>Scan again</Text>
          </Pressable>
        )}
        <Pressable style={styles.secondaryButton} onPress={onBack} disabled={adding}>
          <Text style={styles.secondaryButtonText}>Back to search</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scannerContainer: { flex: 1, minHeight: 320 },
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    gap: 10,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  hint: { color: "#fff", textAlign: "center" },
  messageContainer: {
    flex: 1,
    minHeight: 200,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    gap: 12,
  },
  messageText: { textAlign: "center", color: "#374151" },
  primaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#2563eb",
    alignSelf: "center",
  },
  primaryButtonText: { color: "#fff", fontWeight: "600" },
  secondaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#fff",
    alignSelf: "center",
  },
  secondaryButtonText: { color: "#2563eb", fontWeight: "600" },
});
