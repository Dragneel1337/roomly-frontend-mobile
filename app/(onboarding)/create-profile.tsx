import { useLocalSearchParams, useRouter } from "expo-router";
import { useMutation } from "@apollo/client/react";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/src/features/auth/AuthProvider";
import { CREATE_HOUSEHOLD } from "@/src/features/household/householdApi";
import { joinHouseholdWithProfile } from "@/src/features/household/joinHouseholdFlow";
import { useHousehold } from "@/src/features/household/HouseholdProvider";
import { MEMBERS_LIMIT_DEFAULT } from "@/src/features/household/validation";
import { ProfileSetupFields } from "@/src/features/profile/ProfileSetupFields";
import { useProfileSetup } from "@/src/features/profile/useProfileSetup";
import { getUserFacingErrorMessage } from "@/src/shared/api/getUserFacingErrorMessage";
import { FormSubmitButton } from "@/src/shared/components/form/FormSubmitButton";
import { formStyles } from "@/src/shared/components/form/formStyles";
import { resetToTabs } from "@/src/shared/navigation/resetRoutes";
import { ModalScreen, modalScreenStyles } from "@/src/shared/components/ModalScreen";

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default function CreateProfileScreen() {
  const router = useRouter();
  const { completeOnboarding } = useAuth();
  const { setActiveHousehold } = useHousehold();
  const params = useLocalSearchParams<{
    joinCode?: string;
    householdName?: string;
    membersLimit?: string;
  }>();
  const joinCode = firstParam(params.joinCode);
  const householdName = firstParam(params.householdName);
  const membersLimitParam = firstParam(params.membersLimit);

  const setup = useProfileSetup({ joinCode });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [createHousehold] = useMutation(CREATE_HOUSEHOLD);

  async function onConfirm() {
    setup.touchAll();

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
      if (joinCode) {
        const { householdId, profileId } = await joinHouseholdWithProfile({
          joinCode,
          ...payload,
        });
        await setActiveHousehold(householdId, profileId);
      } else if (householdName) {
        const result = await createHousehold({
          variables: {
            name: householdName,
            membersLimit: Number(membersLimitParam) || MEMBERS_LIMIT_DEFAULT,
            ...payload,
          },
        });
        const created = result.data?.createHousehold;
        if (!created?.owner?.id) throw new Error("Create failed");
        await setActiveHousehold(created.id, created.owner.id);
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
    <ModalScreen title="Choose your name and avatar">
      <View style={styles.container}>
        <ProfileSetupFields setup={setup} />

        <FormSubmitButton
          label="Confirm"
          loadingLabel="Setting up..."
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
