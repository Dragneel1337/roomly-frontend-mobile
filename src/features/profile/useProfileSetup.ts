import { useQuery } from "@apollo/client/react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AVAILABLE_AVATARS_AND_COLORS,
  HOUSEHOLD_TAKEN_AVATARS,
  type AvatarColor,
} from "@/src/features/household/householdApi";
import {
  normalizeCatalogColor,
  resolveColorNameForApi,
} from "@/src/features/profile/avatarColorCatalog";
import {
  buildTakenSets,
  collectProfilesFromHousehold,
  isSelectionValid,
  type TakenSets,
  partitionAvatars,
  cycleIndex,
  partitionColors,
} from "@/src/features/profile/profileAvailability";
import { validateNickname } from "@/src/features/profile/validation";
import { useFormValidation } from "@/src/shared/validation/useFormValidation";

type ProfileSetupField = "nickname";

type UseProfileSetupOptions = {
  joinCode?: string;
  /** Edit flow: taken avatars/colors from other members in the active household. */
  householdTaken?: TakenSets;
  initial?: {
    nickname: string;
    avatarName: string;
    colorName: string;
  };
};

const EMPTY_TAKEN: TakenSets = {
  takenAvatarNames: new Set(),
  takenColorNames: new Set(),
};

export function useProfileSetup(options?: UseProfileSetupOptions) {
  const joinCode = options?.joinCode?.trim().toUpperCase();
  const householdTaken = options?.householdTaken;
  const initial = options?.initial;
  const initialAppliedRef = useRef(false);

  const [nickname, setNickname] = useState("");
  const [selectedAvatarName, setSelectedAvatarName] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<AvatarColor | null>(null);

  const {
    data,
    loading: optionsLoading,
    error: optionsError,
    refetch: refetchOptions,
  } = useQuery(AVAILABLE_AVATARS_AND_COLORS);

  const {
    data: takenData,
    loading: takenLoading,
  } = useQuery(HOUSEHOLD_TAKEN_AVATARS, {
    variables: { joinCode: joinCode ?? "" },
    skip: !joinCode || !!householdTaken,
    fetchPolicy: "network-only",
  });

  const avatars = useMemo(
    () => (data?.availableAvatarsAndColors.avatars ?? []).filter((a): a is string => !!a),
    [data],
  );
  const colors = useMemo(() => data?.availableAvatarsAndColors.colors ?? [], [data]);

  const taken = useMemo(() => {
    if (householdTaken) return householdTaken;
    if (!joinCode || !takenData?.householdByJoinCode) return EMPTY_TAKEN;
    const profiles = collectProfilesFromHousehold(takenData.householdByJoinCode);
    return buildTakenSets(profiles);
  }, [householdTaken, joinCode, takenData]);

  const avatarOptions = useMemo(() => partitionAvatars(avatars, taken), [avatars, taken]);
  const colorOptions = useMemo(() => partitionColors(colors, taken), [colors, taken]);

  const hasTakenOptions =
    avatarOptions.taken.length > 0 || colorOptions.taken.length > 0;

  const takenKey = useMemo(
    () =>
      `${[...taken.takenAvatarNames].sort().join(",")}|${[...taken.takenColorNames].sort().join(",")}`,
    [taken],
  );

  /** Defaults / invalid picks only when catalog or taken-set changes — not when user changes color. */
  useEffect(() => {
    if (!avatars.length || !colors.length) return;

    setSelectedAvatarName((current) => {
      if (current && avatarOptions.available.includes(current)) return current;
      return avatarOptions.available[0] ?? null;
    });

    setSelectedColor((current) => {
      if (
        current &&
        colorOptions.available.some(
          (c) => normalizeCatalogColor(c).name === normalizeCatalogColor(current).name,
        )
      ) {
        return current;
      }
      return colorOptions.available[0] ?? null;
    });
  }, [avatars, colors, takenKey, avatarOptions, colorOptions]);

  useEffect(() => {
    if (!initial || initialAppliedRef.current || !avatars.length || !colors.length) return;

    initialAppliedRef.current = true;
    setNickname(initial.nickname);
    setSelectedAvatarName(initial.avatarName);

    const colorKey = normalizeCatalogColor({ name: initial.colorName, hex: initial.colorName }).name;
    const match = colors.find(
      (entry) => normalizeCatalogColor(entry).name === colorKey,
    );
    if (match) setSelectedColor(match);
  }, [initial, avatars, colors]);

  const fieldsConfig = useMemo(
    () => ({
      nickname: { value: nickname, validate: validateNickname },
    }),
    [nickname],
  );

  const form = useFormValidation<ProfileSetupField>(fieldsConfig);

  const ownCurrent = initial
    ? { avatarName: initial.avatarName, colorName: initial.colorName }
    : null;

  const canSubmit =
    form.isValid &&
    isSelectionValid(selectedAvatarName, selectedColor, taken, ownCurrent) &&
    !optionsLoading &&
    (!joinCode || !takenLoading);

  function touchAll() {
    form.touchAll();
  }

  function applyPickerSelection(avatarName: string, color: AvatarColor) {
    setSelectedAvatarName(avatarName);
    setSelectedColor(color);
  }

  function cycleAvatar(direction: -1 | 1) {
    const list = avatarOptions.available;
    if (list.length <= 1) return;

    const currentIndex = selectedAvatarName ? list.indexOf(selectedAvatarName) : 0;
    const nextIndex = cycleIndex((currentIndex >= 0 ? currentIndex : 0) + direction, list.length);
    setSelectedAvatarName(list[nextIndex] ?? null);
  }

  function selectColor(color: AvatarColor) {
    const key = normalizeCatalogColor(color).name;
    if (
      !colorOptions.available.some(
        (entry) => normalizeCatalogColor(entry).name === key,
      )
    ) {
      return;
    }
    setSelectedColor(color);
  }

  function getProfilePayload():
    | { nickname: string; avatarName: string; avatarColorName: string }
    | null {
    if (!isSelectionValid(selectedAvatarName, selectedColor, taken, ownCurrent) || !form.isValid) {
      return null;
    }
    return {
      nickname: nickname.trim(),
      avatarName: selectedAvatarName!,
      avatarColorName: resolveColorNameForApi(selectedColor!),
    };
  }

  const selectionTakenError =
    selectedAvatarName &&
    selectedColor &&
    !isSelectionValid(selectedAvatarName, selectedColor, taken, ownCurrent)
      ? "This avatar or color is already taken in this household."
      : null;

  return {
    nickname,
    setNickname,
    selectedAvatarName,
    selectedColor,
    avatarOptions,
    colorOptions,
    taken,
    hasTakenOptions,
    optionsLoading: optionsLoading || (!!joinCode && !householdTaken && takenLoading),
    optionsError,
    refetchOptions,
    form,
    canSubmit,
    touchAll,
    applyPickerSelection,
    cycleAvatar,
    selectColor,
    getProfilePayload,
    selectionTakenError,
    ownCurrent,
  };
}
