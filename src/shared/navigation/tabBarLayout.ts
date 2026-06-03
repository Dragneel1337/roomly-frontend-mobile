/** Keep in sync with RoomlyTabBar layout. */
export const TAB_ROW_HEIGHT = 56;
export const TAB_BOTTOM_ACCENT_HEIGHT = 8;
export const TAB_TOTAL_HEIGHT = TAB_ROW_HEIGHT + TAB_BOTTOM_ACCENT_HEIGHT;
export const TAB_BAR_SAFE_AREA_GAP = 6;

/** Total vertical space occupied by the tab bar from the physical bottom edge. */
export function getTabBarOccupiedHeight(bottomInset: number): number {
  return Math.max(bottomInset, TAB_BAR_SAFE_AREA_GAP) + TAB_TOTAL_HEIGHT;
}
