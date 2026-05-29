export const PASSWORD_MIN_LENGTH = 8;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | null {
  const v = email.trim();
  if (!v) return "Email is required";
  if (!EMAIL_REGEX.test(v)) return "Enter a valid email address";
  return null;
}

export function validateRequiredPassword(password: string): string | null {
  if (!password) return "Password is required";
  return null;
}

export function validateNewPassword(password: string): string | null {
  if (!password) return "Password is required";
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
  }
  return null;
}

export function validatePasswordsMatch(a: string, b: string): string | null {
  if (a !== b) return "Passwords do not match";
  return null;
}
