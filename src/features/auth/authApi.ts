import { getJson, postJson } from "@/src/shared/api/http";

export type TokenResponse = {
  accessToken: string;
  refreshToken: string;
};

export async function login(email: string, password: string): Promise<TokenResponse> {
  return await postJson<TokenResponse>("/auth/login", { email, password });
}

export async function register(email: string, password: string): Promise<TokenResponse> {
  return await postJson<TokenResponse>("/auth/register", { email, password });
}

export async function refresh(refreshToken: string): Promise<TokenResponse> {
  return await getJson<TokenResponse>(`/auth/refresh?t=${encodeURIComponent(refreshToken)}`);
}
