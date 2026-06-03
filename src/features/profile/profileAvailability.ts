import type { AvatarColor } from "@/src/features/household/householdApi";
import { normalizeCatalogColor } from "@/src/features/profile/avatarColorCatalog";

export type ProfileAvatarRef = {
  avatar: { name: string; colorName: string };
};

export type TakenSets = {
  takenAvatarNames: Set<string>;
  takenColorNames: Set<string>;
};

export type PartitionedOptions<T> = {
  available: T[];
  taken: T[];
  ordered: T[];
};

function normalizeColorKey(colorName: string): string {
  return normalizeCatalogColor({ name: colorName, hex: colorName }).name;
}

export function buildTakenSetsForHouseholdEdit(
  members: { profileId: string; avatar: { name: string; colorName: string } }[],
  activeProfileId: string,
): TakenSets {
  const others = members
    .filter((member) => member.profileId !== activeProfileId)
    .map((member) => ({ avatar: member.avatar }));
  return buildTakenSets(others);
}

export function buildTakenSets(profiles: ProfileAvatarRef[]): TakenSets {
  const takenAvatarNames = new Set<string>();
  const takenColorNames = new Set<string>();

  for (const profile of profiles) {
    takenAvatarNames.add(profile.avatar.name);
    takenColorNames.add(normalizeColorKey(profile.avatar.colorName));
  }

  return { takenAvatarNames, takenColorNames };
}

export function isAvatarTaken(avatarName: string, taken: TakenSets): boolean {
  return taken.takenAvatarNames.has(avatarName);
}

export function isColorTaken(color: AvatarColor, taken: TakenSets): boolean {
  return taken.takenColorNames.has(normalizeColorKey(color.name));
}

export function partitionAvatars(avatars: string[], taken: TakenSets): PartitionedOptions<string> {
  const available: string[] = [];
  const takenList: string[] = [];

  for (const name of avatars) {
    if (isAvatarTaken(name, taken)) {
      takenList.push(name);
    } else {
      available.push(name);
    }
  }

  return { available, taken: takenList, ordered: [...available, ...takenList] };
}

export function partitionColors(
  colors: AvatarColor[],
  taken: TakenSets,
): PartitionedOptions<AvatarColor> {
  const available: AvatarColor[] = [];
  const takenList: AvatarColor[] = [];

  for (const color of colors) {
    if (isColorTaken(color, taken)) {
      takenList.push(color);
    } else {
      available.push(color);
    }
  }

  return { available, taken: takenList, ordered: [...available, ...takenList] };
}

export type OwnProfileSelection = {
  avatarName: string;
  colorName: string;
};

export function isSelectionValid(
  avatarName: string | null | undefined,
  color: AvatarColor | null | undefined,
  taken: TakenSets,
  ownCurrent?: OwnProfileSelection | null,
): boolean {
  if (!avatarName || !color) return false;

  const keepingOwnAvatar =
    ownCurrent != null && avatarName === ownCurrent.avatarName;
  const keepingOwnColor =
    ownCurrent != null &&
    normalizeColorKey(color.name) === normalizeColorKey(ownCurrent.colorName);

  const avatarBlocked = isAvatarTaken(avatarName, taken) && !keepingOwnAvatar;
  const colorBlocked = isColorTaken(color, taken) && !keepingOwnColor;

  return !avatarBlocked && !colorBlocked;
}

export function collectProfilesFromHousehold(household: {
  owner: { avatar: { name: string; colorName: string } } | null;
  members: { avatar: { name: string; colorName: string } }[];
}): ProfileAvatarRef[] {
  const profiles: ProfileAvatarRef[] = [];
  if (household.owner) profiles.push(household.owner);
  for (const member of household.members) {
    profiles.push(member);
  }
  return profiles;
}

export function cycleIndex(index: number, length: number): number {
  if (length <= 0) return 0;
  return ((index % length) + length) % length;
}

/** Move to previous/next item that passes `isSelectable`. */
export function stepSelectableIndex<T>(
  currentIndex: number,
  ordered: T[],
  direction: -1 | 1,
  isSelectable: (item: T) => boolean,
): number {
  if (ordered.length === 0) return 0;

  let index = currentIndex;
  for (let step = 0; step < ordered.length; step += 1) {
    index = cycleIndex(index + direction, ordered.length);
    if (isSelectable(ordered[index])) return index;
  }

  return currentIndex;
}
