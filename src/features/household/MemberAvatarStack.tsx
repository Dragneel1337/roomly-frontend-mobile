import { Image } from "expo-image";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  enrichProfileAvatar,
  fetchColorCatalog,
  type NormalizedColor,
} from "@/src/features/profile/avatarColorCatalog";
import { buildAvatarImageUrl } from "@/src/features/profile/avatarImageUrl";
import { colors } from "@/src/shared/theme/colors";

export type MemberAvatarSource = {
  profileId: string;
  avatarName: string;
  colorName: string;
};

type MemberAvatarStackProps = {
  members: MemberAvatarSource[];
  size?: number;
  overlap?: number;
};

const DEFAULT_SIZE = 32;
const DEFAULT_OVERLAP = 10;

export function MemberAvatarStack({
  members,
  size = DEFAULT_SIZE,
  overlap = DEFAULT_OVERLAP,
}: MemberAvatarStackProps) {
  const [catalog, setCatalog] = useState<NormalizedColor[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchColorCatalog().then((loaded) => {
      if (!cancelled) setCatalog(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (members.length === 0) {
    return null;
  }

  return (
    <View style={styles.row}>
      {members.map((member, index) => (
        <MemberAvatarChip
          key={member.profileId}
          member={member}
          catalog={catalog}
          size={size}
          style={[
            index > 0 && { marginLeft: -overlap },
            { zIndex: members.length - index },
          ]}
        />
      ))}
    </View>
  );
}

function MemberAvatarChip({
  member,
  catalog,
  size,
  style,
}: {
  member: MemberAvatarSource;
  catalog: NormalizedColor[] | null;
  size: number;
  style?: StyleProp<ViewStyle>;
}) {
  const [failedUri, setFailedUri] = useState<string | null>(null);

  const enriched = useMemo(() => {
    if (!catalog) return null;
    return enrichProfileAvatar(member.colorName, catalog);
  }, [catalog, member.colorName]);

  const imageUri = useMemo(() => {
    if (!enriched) return null;
    return buildAvatarImageUrl(member.avatarName, {
      name: enriched.colorName,
      hex: enriched.colorHex,
    });
  }, [member.avatarName, enriched]);

  useEffect(() => {
    setFailedUri(null);
  }, [imageUri]);

  const ringColor = enriched?.colorHex ?? colors.inputBackground;
  const showImage = imageUri && imageUri !== failedUri;
  const innerSize = size - 6;

  return (
    <View
      style={[
        styles.ring,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: ringColor,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.inner,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
          },
        ]}
      >
        {showImage ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            contentFit="cover"
            onError={() => setFailedUri(imageUri)}
          />
        ) : (
          <Ionicons name="person" size={size * 0.42} color={colors.inputText} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  ring: {
    borderWidth: 2,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  inner: {
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
