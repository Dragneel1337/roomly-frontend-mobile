import { getJson, postJson } from "@/src/shared/api/http";

export type TokenResponse = {
  accessToken: string;
  refreshToken: string;
};

export async function login(email: string, password: string): Promise<TokenResponse> {
  return await postJson<TokenResponse>("/auth/login", { email, password });
}

export async function register(
  email: string,
  password: string,
  deviceId?: string,
): Promise<TokenResponse> {
  const body = deviceId ? { email, password, deviceId } : { email, password };
  return await postJson<TokenResponse>("/auth/register", body);
}

export async function refresh(refreshToken: string): Promise<TokenResponse> {
  return await getJson<TokenResponse>(`/auth/refresh?t=${encodeURIComponent(refreshToken)}`);
}

export async function registerDevice(): Promise<{ deviceId: string }> {
  return await postJson<{ deviceId: string }>("/auth/device/register", {});
}

export async function loginWithDevice(deviceId: string): Promise<TokenResponse> {
  return await postJson<TokenResponse>("/auth/device/login", { deviceId });
}
