import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/src/features/auth/AuthProvider";
import { validateEmail, validatePassword } from "@/src/features/auth/validation";
import { getUserFacingErrorMessage } from "@/src/shared/api/getUserFacingErrorMessage";
import { FormSubmitButton } from "@/src/shared/components/form/FormSubmitButton";
import { FormTextField } from "@/src/shared/components/form/FormTextField";
import { formStyles } from "@/src/shared/components/form/formStyles";
import { resetToOnboardingChoose, resetToTabs } from "@/src/shared/navigation/resetRoutes";
import { routes } from "@/src/shared/routes";
import { ModalScreen } from "@/src/shared/components/ModalScreen";
import { authScreenStyles } from "@/src/shared/theme/authScreenStyles";
import { useFormValidation } from "@/src/shared/validation/useFormValidation";

type SignInField = "email" | "password";

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default function SignInScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ intent?: string }>();
  const isUpgrade = firstParam(params.intent) === "upgrade";
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fieldsConfig = useMemo(
    () => ({
      email: { value: email, validate: validateEmail },
      password: { value: password, validate: validatePassword },
    }),
    [email, password],
  );

  const form = useFormValidation<SignInField>(fieldsConfig);

  const headerTitle = isUpgrade ? "Sign in" : "#Roomly";

  return (
    <ModalScreen title={headerTitle}>
      <ScrollView
        contentContainerStyle={authScreenStyles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={authScreenStyles.centerBlock}>
          <View style={authScreenStyles.card}>
            <Text style={authScreenStyles.cardTitle}>
              {isUpgrade ? "Sign in to your account" : "Sign into your\nRoomly account"}
            </Text>

            {isUpgrade ? (
              <Text style={styles.upgradeNote}>
                Device-only households on this phone are not merged automatically — use Sign up
                below to keep them.
              </Text>
            ) : null}

            <FormTextField
              variant="pill"
              value={email}
              onChangeText={setEmail}
              onBlur={() => form.touch("email")}
              placeholder="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              error={form.getError("email")}
              showError={form.showError("email")}
            />

            <FormTextField
              variant="pill"
              value={password}
              onChangeText={setPassword}
              onBlur={() => form.touch("password")}
              placeholder="Password"
              secureTextEntry
              error={form.getError("password")}
              showError={form.showError("password")}
            />

            <FormSubmitButton
              label="Sign in"
              loadingLabel="Signing in..."
              loading={isSubmitting}
              disabled={!form.isValid}
              style={authScreenStyles.submitButton}
              onPress={async () => {
                form.touchAll();
                if (!form.isValid) return;

                setIsSubmitting(true);
                setSubmitError(null);
                try {
                  const onboardingComplete = await signIn(email.trim(), password);
                  if (onboardingComplete) {
                    resetToTabs(router);
                  } else {
                    resetToOnboardingChoose(router);
                  }
                } catch (e: unknown) {
                  setSubmitError(getUserFacingErrorMessage(e, "Sign in failed"));
                } finally {
                  setIsSubmitting(false);
                }
              }}
            />

            {!!submitError && <Text style={formStyles.submitError}>{submitError}</Text>}

            <View style={authScreenStyles.footerBlock}>
              <Text style={authScreenStyles.footerPrompt}>
                {isUpgrade ? "New here?" : "Don't have account yet?"}
              </Text>
              <Pressable
                onPress={() =>
                  router.push(
                    isUpgrade
                      ? { pathname: routes.guest.signUp, params: { intent: "upgrade" } }
                      : routes.guest.signUp,
                  )
                }
                accessibilityRole="link"
              >
                <Text style={authScreenStyles.footerLink}>
                  {isUpgrade ? "Create account on this device" : "Sign up"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </ModalScreen>
  );
}

const styles = StyleSheet.create({
  upgradeNote: {
    ...authScreenStyles.hintText,
    marginTop: -8,
  },
});
