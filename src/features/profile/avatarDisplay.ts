import { colors } from "@/src/shared/theme/colors";

/** Placeholder only when the image failed to load. */
export const avatarInnerBackground = colors.inputBackground;

/** Visual box is slightly larger than the layout slot so ears etc. are not clipped. */
export const avatarBleedRatio = 1.18;

export type AvatarDisplayVariant = "picker" | "header" | "chip";

/** Image scale vs box — >1 lets the PNG fill the slot (ears stay visible). */
const imageSizeRatioByVariant: Record<AvatarDisplayVariant, number> = {
  picker: 1.24,
  header: 1.05,
  chip: 1.05,
};

export function getAvatarBoxSize(layoutSize: number): number {
  return Math.round(layoutSize * avatarBleedRatio);
}

export function getAvatarImageSize(
  layoutSize: number,
  variant: AvatarDisplayVariant,
): number {
  const box = getAvatarBoxSize(layoutSize);
  return Math.round(box * imageSizeRatioByVariant[variant]);
}

/** Fixed carousel stage — same box for every avatar so chevrons do not shift. */
export function getAvatarPickerStageWidth(layoutSize: number): number {
  return getAvatarBoxSize(layoutSize);
}

/** Row height without extra transparent padding below the graphic. */
export function getAvatarPickerStageHeight(layoutSize: number): number {
  return layoutSize;
}

/** Profile view card — less empty space under the character (PNG bottom padding). */
export function getAvatarProfileCardStageHeight(layoutSize: number): number {
  return Math.round(layoutSize * 0.76);
}

/** Matches TabAppHeader title — avatar row height aligns to this. */
export const HEADER_TITLE_FONT_SIZE = 28;
export const HEADER_TITLE_LINE_HEIGHT = 34;

/** Layout slot width in header (not image size). */
export const HEADER_STAGE_WIDTH_RATIO = 1.22;

/** Image render scale vs title line — PNG padding; does not change layout box. */
export const HEADER_AVATAR_IMAGE_SCALE = 2.2;

/** Layout anchor height (= title line height). */
export function getAvatarHeaderStageHeight(): number {
  return HEADER_TITLE_LINE_HEIGHT;
}

export function getAvatarHeaderStageWidth(): number {
  return Math.round(HEADER_TITLE_LINE_HEIGHT * HEADER_STAGE_WIDTH_RATIO);
}

export function getAvatarHeaderImageSize(): number {
  return Math.round(HEADER_TITLE_LINE_HEIGHT * HEADER_AVATAR_IMAGE_SCALE);
}

export function getAvatarHeaderRowMinHeight(): number {
  return HEADER_TITLE_LINE_HEIGHT + 12;
}

export const profilePickerChevronHeight = 42;

/** Layout slot sizes — visual box = getAvatarBoxSize(slot). */
export const avatarSizes = {
  profile: 176,
  header: HEADER_TITLE_LINE_HEIGHT,
  chip: 32,
  /** Fridge list “Owners” column and product detail owner stack. */
  listOwner: 80,
  /** Private / shared picker when adding to shopping or fridge. */
  visibilityPicker: 88,
} as const;

/** Avatar stack overlap for a given layout slot size. */
export function getAvatarStackOverlap(size: number): number {
  return Math.round(size * 0.3);
}

/** Horizontal space for N overlapping avatars (layout column / trailing slot). */
export function getAvatarStackRowWidth(
  memberCount: number,
  size: number,
  overlap: number = getAvatarStackOverlap(size),
): number {
  if (memberCount <= 0) return 0;
  if (memberCount === 1) return size;
  return size + (memberCount - 1) * (size - overlap);
}
