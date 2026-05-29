import { API_BASE_URL } from "../config";

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
    throw new HttpError(`Request failed: ${response.status}`, response.status, parsed);
  }

  return parsed as TResponse;
}

export async function getJson<TResponse>(path: string): Promise<TResponse> {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, { method: "GET" });

  const parsed = await readBody(response);
  if (!response.ok) {
    throw new HttpError(`Request failed: ${response.status}`, response.status, parsed);
  }

  return parsed as TResponse;
}
