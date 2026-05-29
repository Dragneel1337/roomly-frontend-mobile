import { getHttpErrorStatus, HTTP_BAD_REQUEST_USER_MESSAGE } from "./http";

export function getUserFacingErrorMessage(
  error: unknown,
  fallback = "Something went wrong",
): string {
  if (getHttpErrorStatus(error) === 400) return HTTP_BAD_REQUEST_USER_MESSAGE;
  if (error instanceof Error && error.message === HTTP_BAD_REQUEST_USER_MESSAGE) {
    return HTTP_BAD_REQUEST_USER_MESSAGE;
  }
  return fallback;
}
