/**
 * Per-avatar optical center correction (px). PNG canvases share size but characters
 * are drawn at different positions — adjust until all avatars align in the picker stage.
 */
export type AvatarOpticalOffset = {
  translateX: number;
  translateY: number;
};

const ZERO: AvatarOpticalOffset = { translateX: 0, translateY: 0 };

/** Keys must match API avatar names (avatars_catalog.json). */
export const AVATAR_OPTICAL_OFFSETS: Record<string, AvatarOpticalOffset> = {
  Dog: ZERO,
  Cat: ZERO,
  Panda: ZERO,
  Fox: ZERO,
  Parrot: ZERO,
  Mouse: ZERO,
  Cameleon: ZERO,
};

export function getAvatarOpticalOffset(avatarName: string | null | undefined): AvatarOpticalOffset {
  if (!avatarName) return ZERO;
  return AVATAR_OPTICAL_OFFSETS[avatarName] ?? ZERO;
}
