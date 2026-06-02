import * as SecureStore from "expo-secure-store";

const ACTIVE_HOUSEHOLD_KEY = "roomly.activeHouseholdId";
const ACTIVE_PROFILE_KEY = "roomly.activeProfileId";
const MAP_KEY = "roomly.householdProfileMap";

export type ActiveSession = {
  householdId: string | null;
  profileId: string | null;
};

export async function getActiveSession(): Promise<ActiveSession> {
  const [householdId, profileId] = await Promise.all([
    SecureStore.getItemAsync(ACTIVE_HOUSEHOLD_KEY),
    SecureStore.getItemAsync(ACTIVE_PROFILE_KEY),
  ]);
  return { householdId, profileId };
}

export async function getHouseholdProfileMap(): Promise<Record<string, string>> {
  const raw = await SecureStore.getItemAsync(MAP_KEY);
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return {};
    return parsed as Record<string, string>;
  } catch {
    return {};
  }
}

async function saveHouseholdProfileMap(map: Record<string, string>): Promise<void> {
  await SecureStore.setItemAsync(MAP_KEY, JSON.stringify(map));
}

export async function mergeHouseholdProfileMap(
  entries: Record<string, string>,
): Promise<Record<string, string>> {
  const map = await getHouseholdProfileMap();
  Object.assign(map, entries);
  await saveHouseholdProfileMap(map);
  return map;
}

export async function setStoredActiveHousehold(
  householdId: string,
  profileId: string,
): Promise<void> {
  const map = await getHouseholdProfileMap();
  map[householdId] = profileId;
  await Promise.all([
    SecureStore.setItemAsync(ACTIVE_HOUSEHOLD_KEY, householdId),
    SecureStore.setItemAsync(ACTIVE_PROFILE_KEY, profileId),
    saveHouseholdProfileMap(map),
  ]);
}

export async function clearActivePointers(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(ACTIVE_HOUSEHOLD_KEY),
    SecureStore.deleteItemAsync(ACTIVE_PROFILE_KEY),
  ]);
}

export async function removeHouseholdFromMap(householdId: string): Promise<void> {
  const map = await getHouseholdProfileMap();
  delete map[householdId];
  await saveHouseholdProfileMap(map);
  const session = await getActiveSession();
  if (session.householdId === householdId) {
    await clearActivePointers();
  }
}

export async function clearActiveSession(): Promise<void> {
  await Promise.all([
    clearActivePointers(),
    SecureStore.deleteItemAsync(MAP_KEY),
  ]);
}
