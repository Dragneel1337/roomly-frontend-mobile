import { useRouter } from "expo-router";
import { useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
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

export default function ChooseHouseholdScreen() {
  const router = useRouter();
  const { checkJoinCode } = useJoinCodeCheck();
  const [isBusy, setIsBusy] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  async function joinHouseholdPath(joinCode: string) {
    if (isBusy) return;
    setIsBusy(true);
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
      setIsBusy(false);
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
              loading={isBusy}
              submitError={joinError}
              onSubmit={joinHouseholdPath}
              joinButtonStyle={styles.joinButton}
            />
          </View>
        </View>

        <View style={styles.bottomBlock}>
          <Pressable
            disabled={isBusy}
            onPress={() => router.push(routes.onboarding.createHousehold)}
            accessibilityRole="button"
            style={styles.createPressable}
          >
            <Text style={styles.createPrompt}>Don&apos;t have a household yet?</Text>
          </Pressable>
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
    alignItems: "center",
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
  createPressable: {
    alignItems: "center",
    paddingHorizontal: 8,
  },
  createPrompt: {
    fontSize: 15,
    fontWeight: "600",
    fontStyle: "italic",
    color: colors.textPrimary,
    textAlign: "center",
    textDecorationLine: "underline",
  },
});
