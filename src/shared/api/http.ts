import { getAccessToken } from "@/src/features/auth/accessTokenHolder";
import { API_BASE_URL } from "../config";

export const HTTP_BAD_REQUEST_USER_MESSAGE = "Action Failed, Try again";

export class HttpError extends Error {
  status: number;
  body?: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.body = body;
  }
}

function httpErrorMessage(status: number): string {
  if (status === 400) return HTTP_BAD_REQUEST_USER_MESSAGE;
  return `Request failed: ${status}`;
}

export function getHttpErrorStatus(error: unknown): number | undefined {
  if (error instanceof HttpError) return error.status;
  if (typeof error === "object" && error !== null && "status" in error) {
    const status = (error as { status: unknown }).status;
    if (typeof status === "number") return status;
  }
  return undefined;
}

async function readBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return undefined;
    }
  }
  try {
    return await response.text();
  } catch {
    return undefined;
  }
}

export async function postJson<TResponse>(path: string, body: unknown): Promise<TResponse> {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const parsed = await readBody(response);
  if (!response.ok) {
    throw new HttpError(httpErrorMessage(response.status), response.status, parsed);
  }

  return parsed as TResponse;
}

export async function getJson<TResponse>(path: string): Promise<TResponse> {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, { method: "GET" });

  const parsed = await readBody(response);
  if (!response.ok) {
    throw new HttpError(httpErrorMessage(response.status), response.status, parsed);
  }

  return parsed as TResponse;
}

function authHeaders(): Record<string, string> {
  const token = getAccessToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export async function getJsonAuth<TResponse>(path: string): Promise<TResponse> {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    method: "GET",
    headers: authHeaders(),
  });

  const parsed = await readBody(response);
  if (!response.ok) {
    throw new HttpError(httpErrorMessage(response.status), response.status, parsed);
  }

  return parsed as TResponse;
}

export async function postJsonAuth<TResponse>(path: string, body: unknown): Promise<TResponse> {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(body),
  });

  const parsed = await readBody(response);
  if (!response.ok) {
    throw new HttpError(httpErrorMessage(response.status), response.status, parsed);
  }

  return parsed as TResponse;
}
