import { useRouter, type Href } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/src/features/auth/AuthProvider";
import {
  deleteHousehold,
  leaveHousehold,
} from "@/src/features/household/householdApi";
import { completeHouseholdExit } from "@/src/features/household/householdExitFlow";
import {
  clearActiveHouseholdContext,
  useHousehold,
} from "@/src/features/household/HouseholdProvider";
import { useIsHouseholdOwner } from "@/src/features/household/useIsHouseholdOwner";
import { SettingsActionRow } from "@/src/features/settings/SettingsActionRow";
import { getUserFacingErrorMessage } from "@/src/shared/api/getUserFacingErrorMessage";
import { FormSubmitButton } from "@/src/shared/components/form/FormSubmitButton";
import { formStyles } from "@/src/shared/components/form/formStyles";
import { resetToWelcome } from "@/src/shared/navigation/resetRoutes";
import { TAB_TOTAL_HEIGHT } from "@/src/shared/navigation/tabBarLayout";
import { routes } from "@/src/shared/routes";
import { authCardShadow } from "@/src/shared/theme/authScreenStyles";
import { colors } from "@/src/shared/theme/colors";
import { spacing } from "@/src/shared/theme/spacing";

const TAB_SCROLL_EXTRA = 24;

function mapHouseholdExitError(error: unknown, fallback: string): string {
  const message = getUserFacingErrorMessage(error, fallback);
  if (message.toLowerCase().includes("owner cannot leave")) {
    return "As the household owner, delete the household instead of leaving.";
  }
  return message;
}

export function SettingsScreenContent() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { authMode, signOut, resetOnboarding } = useAuth();
  const {
    household,
    activeHouseholdId,
    activeProfileId,
    switchHousehold,
    refreshHouseholds,
  } = useHousehold();
  const {
    isOwner,
    loading: ownerLoading,
    ownerResolved,
    ownerCheckFailed,
    retryOwnerCheck,
  } = useIsHouseholdOwner();
  const [exiting, setExiting] = useState(false);
  const [exitError, setExitError] = useState<string | null>(null);

  const scrollBottomPad =
    Platform.OS === "android"
      ? TAB_SCROLL_EXTRA
      : TAB_TOTAL_HEIGHT + Math.max(insets.bottom, 6) + TAB_SCROLL_EXTRA;

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
        authMode,
        removedHouseholdId: activeHouseholdId,
        clearActiveHouseholdContext,
        switchHousehold,
        refreshHouseholds,
        onNoHouseholdsLeft: resetOnboarding,
      });
    } catch (e: unknown) {
      setExitError(mapHouseholdExitError(e, "Could not delete household"));
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
        authMode,
        removedHouseholdId: activeHouseholdId,
        clearActiveHouseholdContext,
        switchHousehold,
        refreshHouseholds,
        onNoHouseholdsLeft: resetOnboarding,
      });
    } catch (e: unknown) {
      setExitError(mapHouseholdExitError(e, "Could not leave household"));
    } finally {
      setExiting(false);
    }
  }

  const showHouseholdActions =
    !!household &&
    !!activeHouseholdId &&
    !!activeProfileId &&
    ownerResolved &&
    !ownerLoading;

  return (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollBottomPad }]}
      showsVerticalScrollIndicator={false}
    >
      {household ? (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Household</Text>
          <View style={styles.card}>
            <Text style={styles.householdName}>{household.name}</Text>

            <View style={styles.joinCodeBlock}>
              <Text style={styles.joinCodeLabel}>Join code</Text>
              <Text style={styles.joinCode} selectable>
                {household.joinCode}
              </Text>
            </View>

            <View style={styles.actionList}>
              <SettingsActionRow
                label="Switch household"
                href={routes.modals.switchHousehold as Href}
              />
              <SettingsActionRow
                label="Join another household"
                href={routes.modals.joinHousehold as Href}
              />
            </View>

            {showHouseholdActions ? (
              isOwner ? (
                <Pressable
                  style={[styles.destructiveButton, exiting && styles.buttonDisabled]}
                  disabled={exiting}
                  onPress={confirmDeleteHousehold}
                >
                  {exiting ? (
                    <ActivityIndicator color={colors.white} />
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
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Text style={styles.destructiveText}>Leave household</Text>
                  )}
                </Pressable>
              )
            ) : ownerLoading ? (
              <ActivityIndicator color={colors.textPrimary} style={styles.ownerLoading} />
            ) : ownerCheckFailed ? (
              <View style={styles.ownerCheckFailed}>
                <Text style={formStyles.submitError}>
                  Could not verify your role in this household.
                </Text>
                <Pressable
                  style={styles.retryButton}
                  onPress={() => void retryOwnerCheck()}
                  accessibilityRole="button"
                >
                  <Text style={styles.retryText}>Try again</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.card}>
          {authMode === "device" ? (
            <>
              <Text style={styles.accountHint}>
                Your data lives only on this device. Create an account to back it up and sync
                across devices.
              </Text>
              <FormSubmitButton
                label="Upgrade account"
                onPress={() =>
                  router.push({
                    pathname: routes.guest.signIn,
                    params: { intent: "upgrade" },
                  })
                }
                style={styles.primaryAction}
              />
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
      </View>

      {!!exitError && <Text style={formStyles.submitError}>{exitError}</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.sectionGap,
    gap: spacing.sectionGap,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: colors.field,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 22,
    gap: 14,
    ...authCardShadow,
  },
  householdName: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
  },
  joinCodeBlock: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    gap: 4,
  },
  joinCodeLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  joinCode: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 3,
    fontVariant: ["tabular-nums"],
    color: colors.textPrimary,
  },
  actionList: {
    gap: 10,
  },
  destructiveButton: {
    marginTop: 4,
    backgroundColor: "#fef2f2",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    minHeight: 48,
    justifyContent: "center",
  },
  destructiveText: {
    color: colors.error,
    fontWeight: "700",
    fontSize: 15,
  },
  buttonDisabled: { opacity: 0.6 },
  ownerLoading: { marginTop: 8 },
  ownerCheckFailed: {
    marginTop: 8,
    alignItems: "center",
    gap: 10,
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  retryText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
    textDecorationLine: "underline",
  },
  accountHint: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary,
    textAlign: "center",
    opacity: 0.9,
  },
  primaryAction: {
    alignSelf: "stretch",
    minWidth: 0,
    marginTop: 4,
  },
  signOutButton: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  signOutText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.error,
  },
});
