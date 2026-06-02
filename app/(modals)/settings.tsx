import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "@/src/features/auth/AuthProvider";
import {
  deleteHousehold,
  leaveHousehold,
} from "@/src/features/household/householdApi";
import { completeHouseholdExit } from "@/src/features/household/householdExitFlow";
import { useHousehold } from "@/src/features/household/HouseholdProvider";
import { useIsHouseholdOwner } from "@/src/features/household/useIsHouseholdOwner";
import { getUserFacingErrorMessage } from "@/src/shared/api/getUserFacingErrorMessage";
import { resetToWelcome } from "@/src/shared/navigation/resetRoutes";
import { ModalScreen, modalScreenStyles } from "@/src/shared/components/ModalScreen";
import { formStyles } from "@/src/shared/components/form/formStyles";
import { routes } from "@/src/shared/routes";

export default function SettingsModal() {
  const router = useRouter();
  const { authMode, signOut, resetOnboarding } = useAuth();
  const {
    household,
    activeHouseholdId,
    activeProfileId,
    switchHousehold,
    refreshHouseholds,
  } = useHousehold();
  const { isOwner, loading: ownerLoading } = useIsHouseholdOwner();
  const [exiting, setExiting] = useState(false);
  const [exitError, setExitError] = useState<string | null>(null);

  function confirmDeleteHousehold() {
    if (!household || !activeHouseholdId || exiting) return;

    Alert.alert(
      "Delete household?",
      `"${household.name}" and all its data will be permanently deleted. This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => void runDeleteHousehold(),
        },
      ],
    );
  }

  function confirmLeaveHousehold() {
    if (!household || exiting) return;

    Alert.alert(
      "Leave household?",
      `You will leave "${household.name}" and your profile in this household will be removed.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: () => void runLeaveHousehold(),
        },
      ],
    );
  }

  async function runDeleteHousehold() {
    if (!activeHouseholdId) return;
    setExiting(true);
    setExitError(null);
    try {
      await deleteHousehold(activeHouseholdId);
      await completeHouseholdExit({
        router,
        removedHouseholdId: activeHouseholdId,
        switchHousehold,
        refreshHouseholds,
        onNoHouseholdsLeft: resetOnboarding,
      });
    } catch (e: unknown) {
      setExitError(getUserFacingErrorMessage(e, "Could not delete household"));
    } finally {
      setExiting(false);
    }
  }

  async function runLeaveHousehold() {
    if (!activeHouseholdId || !activeProfileId) return;
    setExiting(true);
    setExitError(null);
    try {
      await leaveHousehold(activeProfileId);
      await completeHouseholdExit({
        router,
        removedHouseholdId: activeHouseholdId,
        switchHousehold,
        refreshHouseholds,
        onNoHouseholdsLeft: resetOnboarding,
      });
    } catch (e: unknown) {
      setExitError(getUserFacingErrorMessage(e, "Could not leave household"));
    } finally {
      setExiting(false);
    }
  }

  const showHouseholdActions =
    !!household && !!activeHouseholdId && !!activeProfileId && !ownerLoading;

  return (
    <ModalScreen title="Settings">
      <View style={modalScreenStyles.container}>
        {household && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Household</Text>
            <Text style={styles.householdName}>{household.name}</Text>
            <Text style={styles.label}>Join code</Text>
            <Text style={styles.joinCode} selectable>
              {household.joinCode}
            </Text>
            <Link href={routes.modals.switchHousehold} style={styles.link}>
              Switch household
            </Link>
            <Link href={routes.modals.joinHousehold} style={styles.link}>
              Join another household
            </Link>

            {showHouseholdActions ? (
              isOwner ? (
                <Pressable
                  style={[styles.destructiveButton, exiting && styles.buttonDisabled]}
                  disabled={exiting}
                  onPress={confirmDeleteHousehold}
                >
                  {exiting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.destructiveText}>Delete household</Text>
                  )}
                </Pressable>
              ) : (
                <Pressable
                  style={[styles.destructiveButton, exiting && styles.buttonDisabled]}
                  disabled={exiting}
                  onPress={confirmLeaveHousehold}
                >
                  {exiting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.destructiveText}>Leave household</Text>
                  )}
                </Pressable>
              )
            ) : ownerLoading ? (
              <ActivityIndicator style={styles.ownerLoading} />
            ) : null}
          </View>
        )}

        {!!exitError && <Text style={formStyles.submitError}>{exitError}</Text>}

        {authMode === "device" ? (
          <>
            <Text style={modalScreenStyles.subtitle}>
              Your data lives only on this device. Create an account to back it up and sync across
              devices.
            </Text>
            <Pressable
              style={styles.upgradeButton}
              onPress={() =>
                router.push({
                  pathname: routes.guest.signIn,
                  params: { intent: "upgrade" },
                })
              }
            >
              <Text style={styles.upgradeText}>Upgrade account</Text>
            </Pressable>
          </>
        ) : (
          <Pressable
            style={styles.signOutButton}
            onPress={async () => {
              await signOut();
              resetToWelcome(router);
            }}
          >
            <Text style={styles.signOutText}>Sign out</Text>
          </Pressable>
        )}
      </View>
    </ModalScreen>
  );
}

const styles = StyleSheet.create({
  section: { gap: 6, marginTop: 8, marginBottom: 8 },
  sectionTitle: { fontSize: 14, fontWeight: "600", color: "#374151" },
  householdName: { fontSize: 16, fontWeight: "600" },
  label: { fontSize: 13, color: "#6b7280", marginTop: 4 },
  joinCode: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 2,
    fontVariant: ["tabular-nums"],
  },
  link: { color: "#2563eb", fontWeight: "600", marginTop: 8 },
  destructiveButton: {
    marginTop: 16,
    backgroundColor: "#b91c1c",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    minHeight: 44,
    justifyContent: "center",
  },
  destructiveText: { color: "white", fontWeight: "600" },
  buttonDisabled: { opacity: 0.7 },
  ownerLoading: { marginTop: 16 },
  upgradeButton: {
    marginTop: 16,
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  upgradeText: { color: "white", fontWeight: "600" },
  signOutButton: {
    marginTop: 16,
    backgroundColor: "#b91c1c",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  signOutText: { color: "white", fontWeight: "600" },
});
