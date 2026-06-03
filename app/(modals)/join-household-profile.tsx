import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { joinHouseholdWithProfile } from "@/src/features/household/joinHouseholdFlow";
import { useHousehold } from "@/src/features/household/HouseholdProvider";
import { ProfileSetupFields } from "@/src/features/profile/ProfileSetupFields";
import { useProfileSetup } from "@/src/features/profile/useProfileSetup";
import { getUserFacingErrorMessage } from "@/src/shared/api/getUserFacingErrorMessage";
import { FormSubmitButton } from "@/src/shared/components/form/FormSubmitButton";
import { formStyles } from "@/src/shared/components/form/formStyles";
import { ModalScreen } from "@/src/shared/components/ModalScreen";
import { resetToTabs } from "@/src/shared/navigation/resetRoutes";
import { authScreenStyles } from "@/src/shared/theme/authScreenStyles";

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default function JoinHouseholdProfileModal() {
  const router = useRouter();
  const { setActiveHousehold, refreshHouseholds } = useHousehold();
  const params = useLocalSearchParams<{ joinCode?: string }>();
  const joinCode = firstParam(params.joinCode);

  const setup = useProfileSetup({ joinCode });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function onConfirm() {
    setup.touchAll();
    if (!joinCode) {
      setSubmitError("Missing join code. Go back and try again.");
      return;
    }

    const payload = setup.getProfilePayload();
    if (!payload) {
      setSubmitError(
        setup.selectionTakenError ?? "Pick an avatar and a color that are not taken.",
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const { householdId, profileId } = await joinHouseholdWithProfile({
        joinCode,
        ...payload,
      });

      await setActiveHousehold(householdId, profileId);
      await refreshHouseholds();
      resetToTabs(router);
    } catch (e: unknown) {
      setSubmitError(getUserFacingErrorMessage(e, "Could not join household"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ModalScreen title="#Roomly">
      <ScrollView
        contentContainerStyle={authScreenStyles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={authScreenStyles.centerBlock}>
          <View style={authScreenStyles.profileCard}>
            <ProfileSetupFields setup={setup} />

            <FormSubmitButton
              label="Join household"
              loadingLabel="Joining..."
              loading={isSubmitting}
              disabled={!setup.canSubmit}
              style={authScreenStyles.submitButton}
              onPress={onConfirm}
            />

            {!!submitError && <Text style={formStyles.submitError}>{submitError}</Text>}
          </View>
        </View>
      </ScrollView>
    </ModalScreen>
  );
}
