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
