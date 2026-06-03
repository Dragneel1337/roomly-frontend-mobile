/** App mark — header, icon, favicon (`assets/images/Logo.png`). */
export const roomlyLogoImage = require("@/assets/images/Logo.png");

/** Transactions tab — feature in progress (`assets/images/ComingSoon.png`). */
export const comingSoonImage = require("@/assets/images/ComingSoon.png");

/** Stack `title` value that renders {@link RoomlyHeaderBrand} (logo + Roomly). */
export const ROOMLY_HEADER_TITLE = "#Roomly";

export function isRoomlyBrandHeaderTitle(title: string): boolean {
  return title === ROOMLY_HEADER_TITLE;
}
