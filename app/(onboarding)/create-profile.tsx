import { useLocalSearchParams, useRouter } from "expo-router";
import { useMutation, useQuery } from "@apollo/client/react";
import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/src/features/auth/AuthProvider";
import {
  AVAILABLE_AVATARS_AND_COLORS,
  CREATE_HOUSEHOLD,
  JOIN_HOUSEHOLD,
} from "@/src/features/household/householdApi";
import { MEMBERS_LIMIT_DEFAULT } from "@/src/features/household/validation";
import { validateNickname } from "@/src/features/profile/validation";
import { getUserFacingErrorMessage } from "@/src/shared/api/getUserFacingErrorMessage";
import { FormSubmitButton } from "@/src/shared/components/form/FormSubmitButton";
import { FormTextField } from "@/src/shared/components/form/FormTextField";
import { formStyles } from "@/src/shared/components/form/formStyles";
import { resetToTabs } from "@/src/shared/navigation/resetRoutes";
import { Screen } from "@/src/shared/components/Screen";
import { useFormValidation } from "@/src/shared/validation/useFormValidation";

type CreateProfileField = "nickname";

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function cycle(index: number, length: number): number {
  if (length <= 0) return 0;
  return ((index % length) + length) % length;
}

export default function CreateProfileScreen() {
  const router = useRouter();
  const { completeOnboarding } = useAuth();
  const params = useLocalSearchParams<{
    joinCode?: string;
    householdName?: string;
    membersLimit?: string;
  }>();
  const joinCode = firstParam(params.joinCode);
  const householdName = firstParam(params.householdName);
  const membersLimitParam = firstParam(params.membersLimit);

  const [nickname, setNickname] = useState("");
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [colorIndex, setColorIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
  const selectedColor = colors.length ? colors[cycle(colorIndex, colors.length)] : undefined;

  const [createHousehold] = useMutation(CREATE_HOUSEHOLD);
  const [joinHousehold] = useMutation(JOIN_HOUSEHOLD);

  const fieldsConfig = useMemo(
    () => ({
      nickname: { value: nickname, validate: validateNickname },
    }),
    [nickname],
  );

  const form = useFormValidation<CreateProfileField>(fieldsConfig);

  const canSubmit = form.isValid && !!avatarName && !!selectedColor && !isSubmitting;

  async function onConfirm() {
    form.touchAll();
    if (!form.isValid) return;
    if (!avatarName || !selectedColor) {
      setSubmitError("Pick an avatar and a color first.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      if (joinCode) {
        await joinHousehold({
          variables: {
            nickname: nickname.trim(),
            avatarName,
            avatarColorName: selectedColor.name,
            joinCode,
          },
        });
      } else if (householdName) {
        await createHousehold({
          variables: {
            name: householdName,
            membersLimit: Number(membersLimitParam) || MEMBERS_LIMIT_DEFAULT,
            nickname: nickname.trim(),
            avatarName,
            avatarColorName: selectedColor.name,
          },
        });
      } else {
        setSubmitError("Missing household details. Go back and try again.");
        return;
      }

      await completeOnboarding();
      resetToTabs(router);
    } catch (e: unknown) {
      setSubmitError(getUserFacingErrorMessage(e, "Could not finish setup"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Screen withStackHeader>
      <View style={styles.container}>
        <Text style={styles.title}>Choose your name and avatar</Text>

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
                  selectedColor ? { borderColor: selectedColor.hex } : null,
                ]}
              >
                <Text style={styles.previewTitle}>{avatarName ?? "No avatars"}</Text>
                <Text style={[styles.previewSubtitle, selectedColor ? { color: selectedColor.hex } : null]}>
                  {selectedColor?.name ?? "No colors"}
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

        <FormSubmitButton
          label="Confirm"
          loadingLabel="Setting up..."
          loading={isSubmitting}
          disabled={!canSubmit}
          onPress={onConfirm}
        />

        {!!submitError && <Text style={formStyles.submitError}>{submitError}</Text>}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 10 },
  title: { fontSize: 22, fontWeight: "700" },
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
