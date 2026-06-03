import { useMemo } from "react";
import type { AvatarColor } from "@/src/features/household/householdApi";
import { AvatarCircle } from "@/src/features/profile/AvatarCircle";
import { avatarSizes } from "@/src/features/profile/avatarDisplay";
import { buildAvatarImageUrl } from "@/src/features/profile/avatarImageUrl";

type AvatarImagePreviewProps = {
  avatarName: string | null;
  color: AvatarColor | null;
  dimmed?: boolean;
  size?: number;
  /** Large profile / onboarding preview — transparent square slot. */
  picker?: boolean;
  /** Tighter stage for profile view card (not onboarding picker). */
  compactStage?: boolean;
};

export function AvatarImagePreview({
  avatarName,
  color,
  dimmed = false,
  size = avatarSizes.profile,
  picker = false,
  compactStage = false,
}: AvatarImagePreviewProps) {
  const imageUri = useMemo(() => {
    if (!avatarName || !color) return null;
    return buildAvatarImageUrl(avatarName, color);
  }, [avatarName, color]);

  return (
    <AvatarCircle
      uri={imageUri}
      size={size}
      variant={picker ? "picker" : "chip"}
      avatarName={avatarName}
      dimmed={dimmed}
      compactStage={compactStage}
      prefetch
    />
  );
}
