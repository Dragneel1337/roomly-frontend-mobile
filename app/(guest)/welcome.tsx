import { useRouter, type Href } from "expo-router";
import { useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/src/features/auth/AuthProvider";
import { JoinCodeForm } from "@/src/features/household/JoinCodeForm";
import { useJoinCodeCheck } from "@/src/features/household/useJoinCodeCheck";
import { getUserFacingErrorMessage } from "@/src/shared/api/getUserFacingErrorMessage";
import { formStyles } from "@/src/shared/components/form/formStyles";
import { ModalScreen } from "@/src/shared/components/ModalScreen";
import { colors } from "@/src/shared/theme/colors";
import { spacing } from "@/src/shared/theme/spacing";
import { routes } from "@/src/shared/routes";

const cardShadow = Platform.select({
  ios: {
    shadowColor: "#1c274c",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  android: { elevation: 4 },
  default: {},
});

const buttonShadow = Platform.select({
  ios: {
    shadowColor: "#1c274c",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  android: { elevation: 3 },
  default: {},
});

function OrDivider() {
  return (
    <View style={styles.orRow}>
      <View style={styles.orLine} />
      <Text style={styles.orLabel}>OR</Text>
      <View style={styles.orLine} />
    </View>
  );
}

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
    setJoinError(null);
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
    setStartError(null);
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
    <ModalScreen title="#Roomly">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.centerBlock}>
          <View style={styles.card}>
            <Text style={styles.cardHeading}>Enter code to join household</Text>

            <JoinCodeForm
              submitLabel="Join"
              loadingLabel="Joining..."
              loading={isStarting}
              submitError={joinError}
              onSubmit={joinHouseholdPath}
              joinButtonStyle={styles.joinButton}
            />
          </View>
        </View>

        <View style={styles.bottomBlock}>
          <View style={styles.footerBlock}>
            <Pressable
              disabled={isStarting}
              onPress={() => void startHouseholdPath(routes.onboarding.createHousehold)}
              accessibilityRole="button"
            >
              <Text style={styles.footerPrompt}>Don&apos;t have a household yet?</Text>
            </Pressable>

            <Pressable
              disabled={isStarting}
              onPress={() => router.push(routes.guest.signUp)}
              accessibilityRole="link"
            >
              <Text style={styles.footerLink}>Click here if you want to register</Text>
            </Pressable>

            {!!startError && <Text style={formStyles.submitError}>{startError}</Text>}
          </View>

          <OrDivider />

          <View style={styles.socialSection}>
            <Pressable
              style={styles.socialButton}
              accessibilityRole="button"
              accessibilityLabel="Sign in with Google"
              onPress={() => {
                /* Figma placeholder — no OAuth yet */
              }}
            >
              <Ionicons name="logo-google" size={26} color={colors.navBarIcon} />
            </Pressable>
            <Pressable
              style={styles.socialButton}
              accessibilityRole="button"
              accessibilityLabel="Sign in with profile"
              onPress={() => router.push(routes.guest.signIn)}
            >
              <Ionicons name="person" size={28} color={colors.inputText} />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ModalScreen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  centerBlock: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: 16,
  },
  bottomBlock: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: 32,
    gap: 20,
  },
  card: {
    backgroundColor: colors.field,
    borderRadius: spacing.cardRadius,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 24,
    gap: 18,
    ...cardShadow,
  },
  cardHeading: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
    lineHeight: 22,
  },
  joinButton: {
    alignSelf: "center",
    minWidth: 200,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 999,
    marginTop: 4,
    ...buttonShadow,
  },
  footerBlock: {
    alignItems: "center",
    gap: 20,
    paddingHorizontal: 8,
  },
  footerPrompt: {
    fontSize: 15,
    fontWeight: "600",
    fontStyle: "italic",
    color: colors.textPrimary,
    textAlign: "center",
    textDecorationLine: "underline",
  },
  footerLink: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
    textAlign: "center",
    textDecorationLine: "underline",
  },
  orRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  orLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.inputText,
  },
  orLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  socialSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 28,
  },
  socialButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    ...cardShadow,
  },
});
