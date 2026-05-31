import {
  AVAILABLE_AVATARS_AND_COLORS,
  type AvatarColor,
} from "@/src/features/household/householdApi";
import { apolloClient } from "@/src/shared/api/apolloClient";

export type NormalizedColor = {
  name: string;
  hex: string;
};

let cachedCatalog: NormalizedColor[] | null = null;

function normalizeColorName(value: string): string {
  return value.trim().replace(/\s+/g, "_").toUpperCase();
}

function looksLikeHex(value: string): boolean {
  return /^#?[0-9A-Fa-f]{6}$/.test(value.trim());
}

function normalizeHex(value: string): string {
  const trimmed = value.trim();
  return trimmed.startsWith("#") ? trimmed.toUpperCase() : `#${trimmed.toUpperCase()}`;
}

/** Backend may return swapped name/hex in availableAvatarsAndColors. */
export function normalizeCatalogColor(raw: AvatarColor): NormalizedColor {
  if (looksLikeHex(raw.name) && !looksLikeHex(raw.hex)) {
    return { name: raw.hex, hex: normalizeHex(raw.name) };
  }
  return { name: raw.name, hex: normalizeHex(raw.hex) };
}

export async function fetchColorCatalog(): Promise<NormalizedColor[]> {
  if (cachedCatalog) return cachedCatalog;

  const { data } = await apolloClient.query({
    query: AVAILABLE_AVATARS_AND_COLORS,
    fetchPolicy: "cache-first",
  });

  cachedCatalog = (data?.availableAvatarsAndColors.colors ?? []).map(normalizeCatalogColor);
  return cachedCatalog;
}

export function resolveHexFromColorName(
  colorName: string,
  catalog: NormalizedColor[],
): string | null {
  if (looksLikeHex(colorName)) return normalizeHex(colorName);

  const normalized = normalizeColorName(colorName);
  const match = catalog.find((entry) => normalizeColorName(entry.name) === normalized);
  return match?.hex ?? null;
}

/** Value to send as avatarColorName — always a catalog color name, not hex. */
export function resolveColorNameForApi(color: AvatarColor): string {
  return normalizeCatalogColor(color).name;
}

export function resolveHexForDisplay(color: AvatarColor): string {
  return normalizeCatalogColor(color).hex;
}

export function resolveColorLabel(color: AvatarColor): string {
  return normalizeCatalogColor(color).name;
}

/** Human-readable color name from profile.avatar.colorName (handles legacy hex in DB). */
export function resolveColorLabelFromStoredName(
  storedColorName: string,
  catalog: NormalizedColor[],
): string {
  if (looksLikeHex(storedColorName)) {
    const hex = normalizeHex(storedColorName);
    const match = catalog.find((entry) => entry.hex === hex);
    return match?.name ?? storedColorName;
  }

  const normalized = normalizeColorName(storedColorName);
  const match = catalog.find((entry) => normalizeColorName(entry.name) === normalized);
  return match?.name ?? storedColorName;
}

export function enrichProfileAvatar(
  storedColorName: string,
  catalog: NormalizedColor[],
): { colorName: string; colorHex: string } {
  return {
    colorName: resolveColorLabelFromStoredName(storedColorName, catalog),
    colorHex: resolveHexFromColorName(storedColorName, catalog) ?? "#6b7280",
  };
}
