import { useQuery } from "@apollo/client/react";
import { useMemo, useState } from "react";
import { AVAILABLE_AVATARS_AND_COLORS } from "@/src/features/household/householdApi";
import type { AvatarColor } from "@/src/features/household/householdApi";
import { resolveColorNameForApi } from "@/src/features/profile/avatarColorCatalog";
import { validateNickname } from "@/src/features/profile/validation";
import { useFormValidation } from "@/src/shared/validation/useFormValidation";

type ProfileSetupField = "nickname";

function cycle(index: number, length: number): number {
  if (length <= 0) return 0;
  return ((index % length) + length) % length;
}

export function useProfileSetup() {
  const [nickname, setNickname] = useState("");
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [colorIndex, setColorIndex] = useState(0);

  const {
    data,
    loading: optionsLoading,
    error: optionsError,
    refetch: refetchOptions,
  } = useQuery(AVAILABLE_AVATARS_AND_COLORS);

  const avatars = useMemo(
    () => (data?.availableAvatarsAndColors.avatars ?? []).filter((a): a is string => !!a),
    [data],
  );
  const colors = useMemo(() => data?.availableAvatarsAndColors.colors ?? [], [data]);

  const avatarName = avatars.length ? avatars[cycle(avatarIndex, avatars.length)] : undefined;
  const selectedColor: AvatarColor | undefined = colors.length
    ? colors[cycle(colorIndex, colors.length)]
    : undefined;

  const fieldsConfig = useMemo(
    () => ({
      nickname: { value: nickname, validate: validateNickname },
    }),
    [nickname],
  );

  const form = useFormValidation<ProfileSetupField>(fieldsConfig);

  const canSubmit = form.isValid && !!avatarName && !!selectedColor;

  function touchAll() {
    form.touchAll();
  }

  function getProfilePayload():
    | { nickname: string; avatarName: string; avatarColorName: string }
    | null {
    if (!avatarName || !selectedColor || !form.isValid) return null;
    return {
      nickname: nickname.trim(),
      avatarName,
      avatarColorName: resolveColorNameForApi(selectedColor),
    };
  }

  return {
    nickname,
    setNickname,
    avatarIndex,
    setAvatarIndex,
    colorIndex,
    setColorIndex,
    avatars,
    colors,
    avatarName,
    selectedColor,
    optionsLoading,
    optionsError,
    refetchOptions,
    form,
    canSubmit,
    touchAll,
    getProfilePayload,
  };
}
