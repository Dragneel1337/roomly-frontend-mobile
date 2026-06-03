const PLACEHOLDER_VALUES = new Set(["unknown", "unknown product"]);

export function isPlaceholderValue(value: string | null | undefined): boolean {
  if (!value?.trim()) return true;
  return PLACEHOLDER_VALUES.has(value.trim().toLowerCase());
}

export function formatProductMeta(
  brand: string | null | undefined,
  quantity?: string | null,
): string | null {
  const parts: string[] = [];

  if (!isPlaceholderValue(brand)) {
    parts.push(brand!.trim());
  }
  if (quantity?.trim() && !isPlaceholderValue(quantity)) {
    parts.push(quantity.trim());
  }

  return parts.length > 0 ? parts.join(" · ") : null;
}

export function displayBrand(brand: string | null | undefined): string | null {
  if (isPlaceholderValue(brand)) return null;
  return brand!.trim();
}
