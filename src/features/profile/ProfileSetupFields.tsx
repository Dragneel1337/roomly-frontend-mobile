import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import type { AvatarColor } from "@/src/features/household/householdApi";
import { AvatarImagePreview } from "@/src/features/profile/AvatarImagePreview";
import {
  normalizeCatalogColor,
  resolveHexForDisplay,
} from "@/src/features/profile/avatarColorCatalog";
import {
  avatarSizes,
  getAvatarPickerStageHeight,
  getAvatarPickerStageWidth,
  profilePickerChevronHeight,
} from "@/src/features/profile/avatarDisplay";
import {
  isAvatarTaken,
  isColorTaken,
  type OwnProfileSelection,
} from "@/src/features/profile/profileAvailability";
import { getUserFacingErrorMessage } from "@/src/shared/api/getUserFacingErrorMessage";
import { FormTextField } from "@/src/shared/components/form/FormTextField";
import { formStyles } from "@/src/shared/components/form/formStyles";
import { NavChevronIcon } from "@/src/shared/navigation/NavChevronIcon";
import { authPillShadow, authScreenStyles } from "@/src/shared/theme/authScreenStyles";
import { colors } from "@/src/shared/theme/colors";
import type { useProfileSetup } from "./useProfileSetup";

type ProfileSetupFieldsProps = {
  setup: ReturnType<typeof useProfileSetup>;
  variant?: "create" | "edit";
};

const SWATCH_SIZE = 52;

export function ProfileSetupFields({ setup, variant = "create" }: ProfileSetupFieldsProps) {
  const {
    nickname,
    setNickname,
    selectedAvatarName,
    selectedColor,
    avatarOptions,
    colorOptions,
    taken,
    optionsLoading,
    optionsError,
    refetchOptions,
    form,
    cycleAvatar,
    selectColor,
    selectionTakenError,
    ownCurrent,
  } = setup;

  const avatarTaken =
    !!selectedAvatarName &&
    isAvatarTaken(selectedAvatarName, taken) &&
    !(ownCurrent && selectedAvatarName === ownCurrent.avatarName);
  const canCycleAvatars = avatarOptions.available.length > 1;

  if (optionsLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.textPrimary} />
      </View>
    );
  }

  if (optionsError) {
    return (
      <View style={styles.loading}>
        <Text style={formStyles.submitError}>
          {getUserFacingErrorMessage(optionsError, "Could not load avatars")}
        </Text>
        <Pressable style={styles.retryButton} onPress={() => void refetchOptions()}>
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <>
      <Text style={authScreenStyles.cardTitle}>
        {variant === "edit" ? "Appearance" : "Choose your avatar"}
      </Text>
      {variant === "create" ? (
        <Text style={authScreenStyles.cardSubtitle}>(you can change it later)</Text>
      ) : null}

      <View style={styles.avatarRow}>
        {canCycleAvatars ? (
          <Pressable
            accessibilityLabel="Previous avatar"
            hitSlop={12}
            onPress={() => cycleAvatar(-1)}
            style={styles.chevronHit}
          >
            <NavChevronIcon
              direction="left"
              height={profilePickerChevronHeight}
              style={styles.chevronLeft}
            />
          </Pressable>
        ) : (
          <View style={styles.chevronSpacer} />
        )}

        <View style={styles.avatarStage}>
          <AvatarImagePreview
            avatarName={selectedAvatarName}
            color={selectedColor}
            dimmed={avatarTaken}
            size={avatarSizes.profile}
            picker
          />
        </View>

        {canCycleAvatars ? (
          <Pressable
            accessibilityLabel="Next avatar"
            hitSlop={12}
            onPress={() => cycleAvatar(1)}
            style={styles.chevronHit}
          >
            <NavChevronIcon
              direction="right"
              height={profilePickerChevronHeight}
              style={styles.chevronRight}
            />
          </Pressable>
        ) : (
          <View style={styles.chevronSpacer} />
        )}
      </View>

      <View style={styles.nameFieldWrap}>
        <FormTextField
          variant="pill"
          value={nickname}
          onChangeText={setNickname}
          onBlur={() => form.touch("nickname")}
          placeholder="Name"
          error={form.getError("nickname")}
          showError={form.showError("nickname")}
        />
      </View>

      <Text style={authScreenStyles.fieldLabel}>Choose color</Text>
      <ColorSwatchGrid
        colors={colorOptions.ordered}
        selectedColor={selectedColor}
        taken={taken}
        ownCurrent={ownCurrent}
        onSelect={selectColor}
      />

      {!!selectionTakenError && (
        <Text style={formStyles.submitError}>{selectionTakenError}</Text>
      )}
    </>
  );
}

type ColorSwatchGridProps = {
  colors: AvatarColor[];
  selectedColor: AvatarColor | null;
  taken: { takenAvatarNames: Set<string>; takenColorNames: Set<string> };
  ownCurrent?: OwnProfileSelection | null;
  onSelect: (color: AvatarColor) => void;
};

function isColorBlocked(
  color: AvatarColor,
  taken: ColorSwatchGridProps["taken"],
  ownCurrent?: OwnProfileSelection | null,
): boolean {
  const keepingOwn =
    ownCurrent != null &&
    normalizeCatalogColor(color).name ===
      normalizeCatalogColor({ name: ownCurrent.colorName, hex: ownCurrent.colorName }).name;
  return isColorTaken(color, taken) && !keepingOwn;
}

function ColorSwatchGrid({
  colors: colorList,
  selectedColor,
  taken,
  ownCurrent,
  onSelect,
}: ColorSwatchGridProps) {
  return (
    <View style={styles.colorGrid}>
      {colorList.map((color) => {
        const takenColor = isColorBlocked(color, taken, ownCurrent);
        const selected = selectedColor?.name === color.name;

        return (
          <Pressable
            key={color.name}
            accessibilityLabel={color.name}
            accessibilityState={{ selected, disabled: takenColor }}
            disabled={takenColor}
            onPress={() => onSelect(color)}
            style={styles.swatchCell}
          >
            <View
              style={[
                styles.swatch,
                { backgroundColor: resolveHexForDisplay(color) },
                selected && styles.swatchSelected,
                takenColor && styles.swatchTaken,
              ]}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    paddingVertical: 32,
    alignItems: "center",
    gap: 12,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 999,
    backgroundColor: colors.button,
  },
  retryText: {
    color: colors.white,
    fontWeight: "600",
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginTop: 4,
    marginBottom: 0,
  },
  avatarStage: {
    width: getAvatarPickerStageWidth(avatarSizes.profile),
    height: getAvatarPickerStageHeight(avatarSizes.profile),
    alignItems: "center",
    justifyContent: "center",
  },
  chevronHit: {
    width: profilePickerChevronHeight + 12,
    height: getAvatarPickerStageHeight(avatarSizes.profile),
    alignItems: "center",
    justifyContent: "center",
  },
  chevronSpacer: {
    width: profilePickerChevronHeight + 12,
    height: getAvatarPickerStageHeight(avatarSizes.profile),
  },
  chevronLeft: {
    marginLeft: 0,
  },
  chevronRight: {
    marginLeft: 0,
  },
  nameFieldWrap: {
    marginTop: 4,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 6,
    paddingHorizontal: 2,
  },
  swatchCell: {
    width: "25%",
    alignItems: "center",
    marginBottom: 18,
    paddingVertical: 2,
  },
  swatch: {
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    borderRadius: SWATCH_SIZE / 2,
    borderWidth: 2,
    borderColor: colors.textPrimary,
    ...authPillShadow,
  },
  swatchSelected: {
    borderWidth: 4,
    borderColor: colors.textPrimary,
  },
  swatchTaken: {
    opacity: 0.35,
  },
});
