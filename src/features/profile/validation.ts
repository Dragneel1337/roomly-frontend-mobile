export const NAME_MAX_LENGTH = 50;

export function validateNickname(nickname: string): string | null {
  const v = nickname.trim();
  if (!v) return "Nickname is required";
  if (v.length > NAME_MAX_LENGTH) {
    return `Nickname must be at most ${NAME_MAX_LENGTH} characters`;
  }
  return null;
}

export function validateHouseholdName(name: string): string | null {
  const v = name.trim();
  if (!v) return "Household name is required";
  if (v.length > NAME_MAX_LENGTH) {
    return `Household name must be at most ${NAME_MAX_LENGTH} characters`;
  }
  return null;
}
