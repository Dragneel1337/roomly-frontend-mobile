import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { AvatarColorPickerModal } from "@/src/features/profile/AvatarColorPickerModal";
import {
  resolveColorLabel,
  resolveHexForDisplay,
} from "@/src/features/profile/avatarColorCatalog";
import { getUserFacingErrorMessage } from "@/src/shared/api/getUserFacingErrorMessage";
import { FormTextField } from "@/src/shared/components/form/FormTextField";
import { formStyles } from "@/src/shared/components/form/formStyles";
import type { useProfileSetup } from "./useProfileSetup";

type ProfileSetupFieldsProps = {
  setup: ReturnType<typeof useProfileSetup>;
};

export function ProfileSetupFields({ setup }: ProfileSetupFieldsProps) {
  const [pickerVisible, setPickerVisible] = useState(false);

  const {
    nickname,
    setNickname,
    selectedAvatarName,
    selectedColor,
    avatarOptions,
    colorOptions,
    taken,
    hasTakenOptions,
    optionsLoading,
    optionsError,
    refetchOptions,
    form,
    applyPickerSelection,
    selectionTakenError,
  } = setup;

  const previewBorderColor =
    selectedColor && selectedAvatarName
      ? resolveHexForDisplay(selectedColor)
      : "#e5e7eb";

  return (
    <>
      <Text style={styles.label}>Nickname</Text>
      <FormTextField
        value={nickname}
        onChangeText={setNickname}
        onBlur={() => form.touch("nickname")}
        placeholder="Your nickname"
        error={form.getError("nickname")}
        showError={form.showError("nickname")}
      />

      {optionsLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator />
        </View>
      ) : optionsError ? (
        <View style={styles.loading}>
          <Text style={formStyles.submitError}>
            {getUserFacingErrorMessage(optionsError, "Could not load avatars")}
          </Text>
          <Pressable style={styles.pill} onPress={() => void refetchOptions()}>
            <Text style={styles.pillText}>Try again</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <Text style={styles.label}>Avatar & color</Text>
          {hasTakenOptions ? (
            <Text style={styles.legend}>
              Gray options at the end of the list are already used in this household.
            </Text>
          ) : null}

          <Pressable
            style={[styles.previewCard, { borderColor: previewBorderColor }]}
            onPress={() => setPickerVisible(true)}
          >
            <Text style={styles.previewAvatar}>{selectedAvatarName ?? "Pick a look"}</Text>
            <Text
              style={[
                styles.previewColor,
                selectedColor ? { color: resolveHexForDisplay(selectedColor) } : null,
              ]}
            >
              {selectedColor ? resolveColorLabel(selectedColor) : "Tap to choose"}
            </Text>
            <Text style={styles.changeLink}>Change look</Text>
          </Pressable>

          {!!selectionTakenError && (
            <Text style={formStyles.submitError}>{selectionTakenError}</Text>
          )}
        </>
      )}

      <AvatarColorPickerModal
        visible={pickerVisible}
        avatarOptions={avatarOptions}
        colorOptions={colorOptions}
        taken={taken}
        initialAvatarName={selectedAvatarName}
        initialColor={selectedColor}
        onClose={() => setPickerVisible(false)}
        onDone={(avatarName, color) => {
          applyPickerSelection(avatarName, color);
          setPickerVisible(false);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: "600", marginTop: 6 },
  legend: { color: "#6b7280", fontSize: 13, marginBottom: 4 },
  loading: { paddingVertical: 24, alignItems: "center", gap: 12 },
  pill: {
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  pillText: { fontWeight: "600" },
  previewCard: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    backgroundColor: "#fafafa",
  },
  previewAvatar: { fontSize: 18, fontWeight: "700" },
  previewColor: { marginTop: 4, fontWeight: "600" },
  changeLink: { marginTop: 10, color: "#2563eb", fontWeight: "700" },
});
