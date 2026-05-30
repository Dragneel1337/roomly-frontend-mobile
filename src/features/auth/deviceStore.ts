import * as SecureStore from "expo-secure-store";

const DEVICE_ID_KEY = "roomly.deviceId";
const AUTH_MODE_KEY = "roomly.authMode";

export type AuthMode = "device" | "email";

export async function getDeviceId(): Promise<string | null> {
  return await SecureStore.getItemAsync(DEVICE_ID_KEY);
}

export async function setDeviceId(deviceId: string): Promise<void> {
  await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId);
}

export async function clearDeviceId(): Promise<void> {
  await SecureStore.deleteItemAsync(DEVICE_ID_KEY);
}

export async function getAuthMode(): Promise<AuthMode | null> {
  const value = await SecureStore.getItemAsync(AUTH_MODE_KEY);
  if (value === "device" || value === "email") return value;
  return null;
}

export async function setAuthMode(mode: AuthMode): Promise<void> {
  await SecureStore.setItemAsync(AUTH_MODE_KEY, mode);
}

export async function clearAuthMode(): Promise<void> {
  await SecureStore.deleteItemAsync(AUTH_MODE_KEY);
}
