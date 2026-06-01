import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { JoinCodeForm } from "@/src/features/household/JoinCodeForm";
import { useJoinCodeCheck } from "@/src/features/household/useJoinCodeCheck";
import { getUserFacingErrorMessage } from "@/src/shared/api/getUserFacingErrorMessage";
import { FormSubmitButton } from "@/src/shared/components/form/FormSubmitButton";
import { routes } from "@/src/shared/routes";
import { ModalScreen, modalScreenStyles } from "@/src/shared/components/ModalScreen";

export default function ChooseHouseholdScreen() {
  const router = useRouter();
  const { checkJoinCode } = useJoinCodeCheck();
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  async function joinHouseholdPath(joinCode: string) {
    if (joining) return;
    setJoining(true);
    setJoinError(null);
    try {
      const check = await checkJoinCode(joinCode);
      if (!check.ok) {
        setJoinError(check.message);
        return;
      }
      router.push({ pathname: routes.onboarding.createProfile, params: { joinCode } });
    } catch (e: unknown) {
      setJoinError(getUserFacingErrorMessage(e, "Something went wrong"));
    } finally {
      setJoining(false);
    }
  }

  return (
    <ModalScreen title="Set up your household">
      <View style={styles.container}>
        <Text style={styles.subtitle}>Join an existing household or create a new one.</Text>

        <Text style={styles.sectionTitle}>Join with code</Text>
        <JoinCodeForm
          submitLabel="Join household"
          loadingLabel="Checking..."
          loading={joining}
          submitError={joinError}
          onSubmit={joinHouseholdPath}
        />

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Create new household</Text>
        <FormSubmitButton
          label="Create household"
          onPress={() => router.push(routes.onboarding.createHousehold)}
        />
      </View>
    </ModalScreen>
  );
}

const styles = StyleSheet.create({
  ...modalScreenStyles,
  subtitle: { marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginTop: 8 },
  divider: { height: 1, backgroundColor: "#eee", marginVertical: 10 },
});
