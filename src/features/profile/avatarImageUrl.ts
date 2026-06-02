import type { AvatarColor } from "@/src/features/household/householdApi";
import { resolveColorNameForApi } from "@/src/features/profile/avatarColorCatalog";
import { API_BASE_URL } from "@/src/shared/config";

/** Open REST avatar image served by the API (`/open/api/avatars/{name}?color=…`). */
export function buildAvatarImageUrl(avatarName: string, color: AvatarColor): string {
  const colorParam = encodeURIComponent(resolveColorNameForApi(color));
  return `${API_BASE_URL}/open/api/avatars/${encodeURIComponent(avatarName)}?color=${colorParam}`;
}
