import { useEffect, useMemo, useState } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { AvatarCircle } from "@/src/features/profile/AvatarCircle";
import { avatarSizes } from "@/src/features/profile/avatarDisplay";
import {
  enrichProfileAvatar,
  fetchColorCatalog,
  type NormalizedColor,
} from "@/src/features/profile/avatarColorCatalog";
import { buildAvatarImageUrl } from "@/src/features/profile/avatarImageUrl";

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

const DEFAULT_OVERLAP = 10;

export function MemberAvatarStack({
  members,
  size = avatarSizes.chip,
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
  const [failed, setFailed] = useState(false);

  const enriched = useMemo(() => {
    if (!catalog) return null;
    return enrichProfileAvatar(member.colorName, catalog);
  }, [catalog, member.colorName]);

  const imageUri = useMemo(() => {
    if (!enriched || failed) return null;
    return buildAvatarImageUrl(member.avatarName, {
      name: enriched.colorName,
      hex: enriched.colorHex,
    });
  }, [member.avatarName, enriched, failed]);

  return (
    <AvatarCircle
      uri={imageUri}
      size={size}
      variant="chip"
      avatarName={member.avatarName}
      style={style}
      onError={() => setFailed(true)}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
});
