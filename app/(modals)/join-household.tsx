import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { JoinCodeForm } from "@/src/features/household/JoinCodeForm";
import { getJoinCodeMembershipError } from "@/src/features/household/joinHouseholdFlow";
import { useHousehold } from "@/src/features/household/HouseholdProvider";
import { useJoinCodeCheck } from "@/src/features/household/useJoinCodeCheck";
import { getUserFacingErrorMessage } from "@/src/shared/api/getUserFacingErrorMessage";
import { ModalScreen, modalScreenStyles } from "@/src/shared/components/ModalScreen";
import { routes } from "@/src/shared/routes";

export default function JoinHouseholdModal() {
  const router = useRouter();
  const { household, households } = useHousehold();
  const { checkJoinCode } = useJoinCodeCheck();
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  async function onSubmit(joinCode: string) {
    if (joining) return;

    const membershipError = getJoinCodeMembershipError(joinCode, households, household);
    if (membershipError) {
      setJoinError(membershipError);
      return;
    }

    setJoining(true);
    setJoinError(null);
    try {
      const check = await checkJoinCode(joinCode);
      if (!check.ok) {
        setJoinError(check.message);
        return;
      }
      router.push({ pathname: routes.modals.joinHouseholdProfile, params: { joinCode } });
    } catch (e: unknown) {
      setJoinError(getUserFacingErrorMessage(e, "Something went wrong"));
    } finally {
      setJoining(false);
    }
  }

  return (
    <ModalScreen title="Join household">
      <View style={modalScreenStyles.container}>
        <JoinCodeForm
          submitLabel="Continue"
          loadingLabel="Checking..."
          loading={joining}
          submitError={joinError}
          onSubmit={onSubmit}
        />
      </View>
    </ModalScreen>
  );
}
