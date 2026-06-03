import { useMemo, useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { useHousehold } from "@/src/features/household/HouseholdProvider";
import { AvatarCircle } from "@/src/features/profile/AvatarCircle";
import { avatarSizes } from "@/src/features/profile/avatarDisplay";
import { buildAvatarImageUrl } from "@/src/features/profile/avatarImageUrl";

type ProfileHeaderAvatarProps = {
  size?: number;
  onPress: () => void;
};

export function ProfileHeaderAvatar({
  size = avatarSizes.header,
  onPress,
}: ProfileHeaderAvatarProps) {
  const { profile } = useHousehold();
  const [failed, setFailed] = useState(false);

  const imageUri = useMemo(() => {
    if (!profile?.avatar.name || failed) return null;
    return buildAvatarImageUrl(profile.avatar.name, {
      name: profile.avatar.colorName,
      hex: profile.avatar.colorHex,
    });
  }, [profile, failed]);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Open profile"
      hitSlop={8}
      style={styles.hit}
    >
      <AvatarCircle
        uri={imageUri}
        size={size}
        variant="header"
        avatarName={profile?.avatar.name}
        onError={() => setFailed(true)}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
});
