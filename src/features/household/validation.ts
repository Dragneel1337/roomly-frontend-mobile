export const HOUSEHOLD_JOIN_CODE_LENGTH = 6;

const JOIN_CODE_REGEX = /^[a-zA-Z0-9]{6}$/;

/** Backend: GeneratedCodeFactory.generate(6, LOWERCASE_LETTERS_AND_DIGITS) */
export function validateJoinCode(code: string): string | null {
  const v = code.trim();
  if (!v) return "Join code is required";
  if (v.length !== HOUSEHOLD_JOIN_CODE_LENGTH) {
    return `Join code must be exactly ${HOUSEHOLD_JOIN_CODE_LENGTH} characters`;
  }
  if (!JOIN_CODE_REGEX.test(v)) return "Join code must contain only letters and numbers";
  return null;
}
