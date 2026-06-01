import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
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
  const {
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
  } = setup;

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
          <Text style={styles.label}>Avatar</Text>
          <View style={styles.row}>
            <Pressable
              style={styles.pill}
              disabled={!avatars.length}
              onPress={() => setAvatarIndex((i) => i - 1)}
            >
              <Text style={styles.pillText}>Prev</Text>
            </Pressable>
            <View
              style={[
                styles.preview,
                selectedColor ? { borderColor: resolveHexForDisplay(selectedColor) } : null,
              ]}
            >
              <Text style={styles.previewTitle}>{avatarName ?? "No avatars"}</Text>
              <Text
                style={[
                  styles.previewSubtitle,
                  selectedColor ? { color: resolveHexForDisplay(selectedColor) } : null,
                ]}
              >
                {selectedColor ? resolveColorLabel(selectedColor) : "No colors"}
              </Text>
            </View>
            <Pressable
              style={styles.pill}
              disabled={!avatars.length}
              onPress={() => setAvatarIndex((i) => i + 1)}
            >
              <Text style={styles.pillText}>Next</Text>
            </Pressable>
          </View>

          <View style={styles.row}>
            <Pressable
              style={styles.pill}
              disabled={!colors.length}
              onPress={() => setColorIndex((i) => i - 1)}
            >
              <Text style={styles.pillText}>Prev color</Text>
            </Pressable>
            <Pressable
              style={styles.pill}
              disabled={!colors.length}
              onPress={() => setColorIndex((i) => i + 1)}
            >
              <Text style={styles.pillText}>Next color</Text>
            </Pressable>
          </View>
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: "600", marginTop: 6 },
  loading: { paddingVertical: 24, alignItems: "center", gap: 12 },
  row: { flexDirection: "row", gap: 10, alignItems: "center", marginTop: 4 },
  pill: {
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  pillText: { fontWeight: "600" },
  preview: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#eee",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  previewTitle: { fontSize: 16, fontWeight: "700" },
  previewSubtitle: { color: "#6b7280", marginTop: 2 },
});
