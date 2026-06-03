import { Image } from "expo-image";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useHousehold } from "@/src/features/household/HouseholdProvider";
import { buildAvatarImageUrl } from "@/src/features/profile/avatarImageUrl";
import { colors } from "@/src/shared/theme/colors";

const DEFAULT_SIZE = 40;

type ProfileHeaderAvatarProps = {
  size?: number;
  onPress: () => void;
};

export function ProfileHeaderAvatar({ size = DEFAULT_SIZE, onPress }: ProfileHeaderAvatarProps) {
  const { profile } = useHousehold();
  const [failedUri, setFailedUri] = useState<string | null>(null);

  const avatarName = profile?.avatar.name ?? null;
  const ringColor = profile?.avatar.colorHex ?? colors.inputBackground;

  const imageUri = useMemo(() => {
    if (!avatarName || !profile) return null;
    return buildAvatarImageUrl(avatarName, {
      name: profile.avatar.colorName,
      hex: profile.avatar.colorHex,
    });
  }, [avatarName, profile]);

  useEffect(() => {
    setFailedUri(null);
  }, [imageUri]);

  const showImage = imageUri && imageUri !== failedUri;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Open profile"
      hitSlop={8}
      style={[styles.hit, { width: size, height: size }]}
    >
      <View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: ringColor,
          },
        ]}
      >
        <View style={styles.inner}>
          {showImage ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.image}
              contentFit="cover"
              onError={() => setFailedUri(imageUri)}
            />
          ) : (
            <Ionicons name="person" size={size * 0.45} color={colors.inputText} />
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: {
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    borderWidth: 3,
    padding: 2,
    backgroundColor: colors.white,
  },
  inner: {
    flex: 1,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: colors.inputBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
