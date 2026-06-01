import { Link, useRouter, type Href } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/src/features/auth/AuthProvider";
import { JoinCodeForm } from "@/src/features/household/JoinCodeForm";
import { useJoinCodeCheck } from "@/src/features/household/useJoinCodeCheck";
import { getUserFacingErrorMessage } from "@/src/shared/api/getUserFacingErrorMessage";
import { FormSubmitButton } from "@/src/shared/components/form/FormSubmitButton";
import { formStyles } from "@/src/shared/components/form/formStyles";
import { routes } from "@/src/shared/routes";
import { ModalScreen, modalScreenStyles } from "@/src/shared/components/ModalScreen";

export default function WelcomeScreen() {
  const router = useRouter();
  const { continueWithDevice } = useAuth();
  const { checkJoinCode } = useJoinCodeCheck();
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);

  async function startHouseholdPath(target: Href) {
    if (isStarting) return;
    setIsStarting(true);
    setStartError(null);
    try {
      await continueWithDevice();
      router.push(target);
    } catch (e: unknown) {
      setStartError(getUserFacingErrorMessage(e, "Could not start. Try again."));
    } finally {
      setIsStarting(false);
    }
  }

  async function joinHouseholdPath(joinCode: string) {
    if (isStarting) return;
    setIsStarting(true);
    setJoinError(null);
    try {
      await continueWithDevice();
      const check = await checkJoinCode(joinCode);
      if (!check.ok) {
        setJoinError(check.message);
        return;
      }
      router.push({ pathname: routes.onboarding.createProfile, params: { joinCode } });
    } catch (e: unknown) {
      setJoinError(getUserFacingErrorMessage(e, "Could not start. Try again."));
    } finally {
      setIsStarting(false);
    }
  }

  return (
    <ModalScreen title="Roomly">
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Join household</Text>
        <JoinCodeForm
          submitLabel="Join household"
          loadingLabel="Checking..."
          loading={isStarting}
          submitError={joinError}
          onSubmit={joinHouseholdPath}
        />

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Create household</Text>
        <FormSubmitButton
          label="Create new household"
          loadingLabel="Starting..."
          loading={isStarting}
          onPress={() => startHouseholdPath(routes.onboarding.createHousehold)}
        />

        {!!startError && <Text style={formStyles.submitError}>{startError}</Text>}

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Log in</Text>
        <View style={styles.iconRow}>
          <Pressable style={styles.iconButton} onPress={() => router.push(routes.guest.signIn)}>
            <Ionicons name="mail" size={22} />
            <Text style={styles.iconLabel}>Email</Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don’t have an account?</Text>
          <Link href={routes.guest.signUp} style={styles.footerLink}>
            Sign up
          </Link>
        </View>
      </View>
    </ModalScreen>
  );
}

const styles = StyleSheet.create({
  ...modalScreenStyles,
  sectionTitle: { fontSize: 16, fontWeight: "600", marginTop: 4 },
  divider: { height: 1, backgroundColor: "#eee", marginVertical: 10 },
  iconRow: { flexDirection: "row", gap: 12 },
  iconButton: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 12,
    borderRadius: 10,
  },
  iconLabel: { fontWeight: "600" },
  footer: { flexDirection: "row", gap: 6, marginTop: "auto", justifyContent: "center" },
  footerText: { color: "#6b7280" },
  footerLink: { color: "#2563eb", fontWeight: "700" },
});
