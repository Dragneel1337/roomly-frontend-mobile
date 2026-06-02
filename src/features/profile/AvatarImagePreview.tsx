import { Image } from "expo-image";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { AvatarColor } from "@/src/features/household/householdApi";
import { resolveHexForDisplay } from "@/src/features/profile/avatarColorCatalog";
import { buildAvatarImageUrl } from "@/src/features/profile/avatarImageUrl";
import { colors } from "@/src/shared/theme/colors";

const PREVIEW_SIZE = 128;

type AvatarImagePreviewProps = {
  avatarName: string | null;
  color: AvatarColor | null;
  dimmed?: boolean;
};

export function AvatarImagePreview({ avatarName, color, dimmed = false }: AvatarImagePreviewProps) {
  const [loadedUri, setLoadedUri] = useState<string | null>(null);
  const [failedUri, setFailedUri] = useState<string | null>(null);

  const imageUri = useMemo(() => {
    if (!avatarName || !color) return null;
    return buildAvatarImageUrl(avatarName, color);
  }, [avatarName, color]);

  useEffect(() => {
    setLoadedUri(null);
    setFailedUri(null);
  }, [avatarName]);

  const ringColor = color ? resolveHexForDisplay(color) : colors.inputText;

  const displayUri = useMemo(() => {
    if (!imageUri) return loadedUri;
    if (imageUri === failedUri) return loadedUri;
    if (!loadedUri || loadedUri === imageUri) return imageUri;
    return loadedUri;
  }, [imageUri, loadedUri, failedUri]);

  useEffect(() => {
    if (!imageUri || imageUri === failedUri) return;
    void Image.prefetch(imageUri).then(() => setLoadedUri(imageUri));
  }, [imageUri, failedUri]);

  return (
    <View
      style={[
        styles.ring,
        { borderColor: ringColor },
        dimmed && styles.dimmed,
      ]}
    >
      <View style={styles.inner}>
        {displayUri ? (
          <Image
            source={{ uri: displayUri }}
            style={styles.image}
            contentFit="cover"
            onLoad={() => {
              if (imageUri) setLoadedUri(imageUri);
            }}
            onError={() => {
              if (imageUri) setFailedUri(imageUri);
            }}
          />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="person" size={40} color={colors.inputText} style={styles.personBack} />
            <Ionicons name="person" size={40} color={colors.textPrimary} style={styles.personFront} />
            {avatarName ? <Text style={styles.placeholderLabel}>{avatarName}</Text> : null}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    width: PREVIEW_SIZE,
    height: PREVIEW_SIZE,
    borderRadius: PREVIEW_SIZE / 2,
    borderWidth: 4,
    padding: 5,
    backgroundColor: colors.white,
  },
  dimmed: {
    opacity: 0.45,
  },
  inner: {
    flex: 1,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: colors.inputBackground,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  personBack: {
    position: "absolute",
    left: 16,
    opacity: 0.5,
  },
  personFront: {
    position: "absolute",
    right: 16,
  },
  placeholderLabel: {
    position: "absolute",
    bottom: 8,
    fontSize: 11,
    fontWeight: "600",
    color: colors.inputText,
  },
});
