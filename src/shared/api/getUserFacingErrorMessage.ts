import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { getHttpErrorStatus, HttpError, HTTP_BAD_REQUEST_USER_MESSAGE } from "./http";

function messageFromHttpBody(body: unknown): string | null {
  if (typeof body === "string") {
    const prefix = "An error occurred: ";
    if (body.startsWith(prefix)) return body.slice(prefix.length).trim();
    if (body.trim()) return body.trim();
  }
  if (typeof body === "object" && body !== null && "message" in body) {
    const message = (body as { message: unknown }).message;
    if (typeof message === "string" && message.trim()) return message.trim();
  }
  return null;
}

export function getUserFacingErrorMessage(
  error: unknown,
  fallback = "Something went wrong",
): string {
  if (CombinedGraphQLErrors.is(error)) {
    const message = error.errors.find((e) => e.message)?.message;
    if (message) return message;
  }
  if (error instanceof HttpError) {
    const fromBody = messageFromHttpBody(error.body);
    if (fromBody) return fromBody;
    if (error.status === 400) return HTTP_BAD_REQUEST_USER_MESSAGE;
  }
  if (getHttpErrorStatus(error) === 400) return HTTP_BAD_REQUEST_USER_MESSAGE;
  if (error instanceof Error && error.message === HTTP_BAD_REQUEST_USER_MESSAGE) {
    return HTTP_BAD_REQUEST_USER_MESSAGE;
  }
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
}
