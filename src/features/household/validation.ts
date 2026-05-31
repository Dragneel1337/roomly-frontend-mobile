export const HOUSEHOLD_JOIN_CODE_LENGTH = 6;
export const MEMBERS_LIMIT_MIN = 1;
export const MEMBERS_LIMIT_MAX = 64;
export const MEMBERS_LIMIT_DEFAULT = 2;

const JOIN_CODE_REGEX = /^[a-zA-Z0-9]{6}$/;

export function validateMembersLimit(value: string): string | null {
  const v = value.trim();
  if (!v) return "Members limit is required";
  if (!/^\d+$/.test(v)) return "Members limit must be a whole number";
  const n = Number(v);
  if (n < MEMBERS_LIMIT_MIN) return `Members limit must be at least ${MEMBERS_LIMIT_MIN}`;
  if (n > MEMBERS_LIMIT_MAX) return `Members limit must be at most ${MEMBERS_LIMIT_MAX}`;
  return null;
}

export function validateJoinCode(code: string): string | null {
  const v = code.trim();
  if (!v) return "Join code is required";
  if (v.length !== HOUSEHOLD_JOIN_CODE_LENGTH) {
    return `Join code must be exactly ${HOUSEHOLD_JOIN_CODE_LENGTH} characters`;
  }
  if (!JOIN_CODE_REGEX.test(v)) return "Join code must contain only letters and numbers";
  return null;
}
