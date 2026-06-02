import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { joinHouseholdWithProfile } from "@/src/features/household/joinHouseholdFlow";
import { useHousehold } from "@/src/features/household/HouseholdProvider";
import { ProfileSetupFields } from "@/src/features/profile/ProfileSetupFields";
import { useProfileSetup } from "@/src/features/profile/useProfileSetup";
import { apolloClient } from "@/src/shared/api/apolloClient";
import { getUserFacingErrorMessage } from "@/src/shared/api/getUserFacingErrorMessage";
import { FormSubmitButton } from "@/src/shared/components/form/FormSubmitButton";
import { formStyles } from "@/src/shared/components/form/formStyles";
import { ModalScreen, modalScreenStyles } from "@/src/shared/components/ModalScreen";

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
      await apolloClient.resetStore();

      if (router.canDismiss()) {
        router.dismissAll();
      } else {
        router.back();
      }
    } catch (e: unknown) {
      setSubmitError(getUserFacingErrorMessage(e, "Could not join household"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ModalScreen title="Your profile in this household">
      <View style={styles.container}>
        <Text style={modalScreenStyles.subtitle}>
          Choose how you appear to other members in this household.
        </Text>

        <ProfileSetupFields setup={setup} />

        <FormSubmitButton
          label="Join household"
          loadingLabel="Joining..."
          loading={isSubmitting}
          disabled={!setup.canSubmit}
          onPress={onConfirm}
        />
        {!!submitError && <Text style={formStyles.submitError}>{submitError}</Text>}
      </View>
    </ModalScreen>
  );
}

const styles = StyleSheet.create({
  ...modalScreenStyles,
});
