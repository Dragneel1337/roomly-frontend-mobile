import * as SecureStore from "expo-secure-store";

const ONBOARDING_COMPLETE_KEY = "roomly.onboardingComplete";

/** `null` = never set (legacy account before onboarding feature). */
export async function getOnboardingComplete(): Promise<boolean | null> {
  const value = await SecureStore.getItemAsync(ONBOARDING_COMPLETE_KEY);
  if (value === null) return null;
  return value === "true";
}

export async function setOnboardingComplete(complete: boolean): Promise<void> {
  await SecureStore.setItemAsync(ONBOARDING_COMPLETE_KEY, complete ? "true" : "false");
}

export async function clearOnboardingComplete(): Promise<void> {
  await SecureStore.deleteItemAsync(ONBOARDING_COMPLETE_KEY);
}

/**
 * `hasHousehold` from API: true = has HH, false = empty list, null = query failed.
 * `false ?? stored` would ignore stored `true` — keep local completion when backend is empty
 * but the user already finished onboarding (e.g. right after create, or transient API mismatch).
 */
export function resolveOnboardingComplete(
  hasHousehold: boolean | null,
  stored: boolean | null,
  defaultWhenUnknown: boolean,
): boolean {
  if (hasHousehold === true) return true;
  if (stored === true) return true;
  if (hasHousehold === false) return false;
  return stored ?? defaultWhenUnknown;
}
