const LOCAL_DATE_TIME_RE =
  /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?$/;

const pad2 = (n: number) => String(n).padStart(2, "0");

/** Local wall-clock without timezone (parsing API responses, internal use). */
export function toLocalDateTimeString(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}T${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;
}

/**
 * RFC3339 for all GraphQL DateTime variables (queries + mutations).
 * GraphQL rejects plain LocalDateTime strings (no offset at index 19).
 * Uses local wall-clock + device offset, e.g. 2026-06-02T23:37:00+02:00
 * (not toISOString().slice(0,19), which is UTC and wrong hour).
 */
export function toGraphQLDateTimeString(date: Date): string {
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMinutes);
  return `${toLocalDateTimeString(date)}${sign}${pad2(Math.floor(abs / 60))}:${pad2(abs % 60)}`;
}

/** Parse API date-time (LocalDateTime or RFC3339) into a local Date. */
export function parseLocalDateTime(value: string): Date {
  const trimmed = value.trim();
  if (/[Zz]$|[+-]\d{2}:\d{2}$/.test(trimmed)) {
    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  const match = LOCAL_DATE_TIME_RE.exec(trimmed);
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const hour = Number(match[4]);
    const minute = Number(match[5]);
    const second = match[6] ? Number(match[6]) : 0;
    return new Date(year, month - 1, day, hour, minute, second, 0);
  }
  const fallback = new Date(trimmed);
  if (Number.isNaN(fallback.getTime())) {
    throw new Error(`Invalid local date-time: ${value}`);
  }
  return fallback;
}

function formatDateLocale(date: Date): string {
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatEventDateTimeFromDate(date: Date): string {
  if (Number.isNaN(date.getTime())) return "";
  return formatDateLocale(date);
}

export function formatEventDateTime(value: string | Date): string {
  if (value instanceof Date) {
    return formatEventDateTimeFromDate(value);
  }
  try {
    return formatEventDateTimeFromDate(parseLocalDateTime(value));
  } catch {
    return value;
  }
}

export function monthRange(year: number, month: number): { from: string; to: string } {
  const from = new Date(year, month, 1, 0, 0, 0, 0);
  const to = new Date(year, month + 1, 0, 23, 59, 59, 999);
  return { from: toGraphQLDateTimeString(from), to: toGraphQLDateTimeString(to) };
}

export function formatMonthLabel(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleString(undefined, {
    month: "long",
    year: "numeric",
  });
}
