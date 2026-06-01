import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/src/features/auth/AuthProvider";
import {
  validateEmail,
  validatePassword,
  validatePasswordsMatch,
} from "@/src/features/auth/validation";
import { getUserFacingErrorMessage } from "@/src/shared/api/getUserFacingErrorMessage";
import { FormSubmitButton } from "@/src/shared/components/form/FormSubmitButton";
import { FormTextField } from "@/src/shared/components/form/FormTextField";
import { formStyles } from "@/src/shared/components/form/formStyles";
import { resetToOnboardingChoose, resetToTabs } from "@/src/shared/navigation/resetRoutes";
import { routes } from "@/src/shared/routes";
import { ModalScreen, modalScreenStyles } from "@/src/shared/components/ModalScreen";
import { useFormValidation } from "@/src/shared/validation/useFormValidation";

type SignUpField = "email" | "password" | "repeatPassword";

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default function SignUpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ intent?: string }>();
  const isUpgrade = firstParam(params.intent) === "upgrade";
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateRepeatPassword = useCallback(
    (value: string) => validatePasswordsMatch(password, value),
    [password],
  );

  const fieldsConfig = useMemo(
    () => ({
      email: { value: email, validate: validateEmail },
      password: { value: password, validate: validatePassword },
      repeatPassword: { value: repeatPassword, validate: validateRepeatPassword },
    }),
    [email, password, repeatPassword, validateRepeatPassword],
  );

  const form = useFormValidation<SignUpField>(fieldsConfig);

  const signInHref = isUpgrade
    ? { pathname: routes.guest.signIn, params: { intent: "upgrade" } }
    : routes.guest.signIn;

  return (
    <ModalScreen title={isUpgrade ? "Create account" : "Create my account"}>
      <View style={styles.container}>
        {isUpgrade ? (
          <Text style={modalScreenStyles.subtitle}>
            Add email and password to keep this device&apos;s households and sync across devices.
          </Text>
        ) : null}

        <FormTextField
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
          value={password}
          onChangeText={setPassword}
          onBlur={() => form.touch("password")}
          placeholder="Password"
          secureTextEntry
          error={form.getError("password")}
          showError={form.showError("password")}
        />

        <FormTextField
          value={repeatPassword}
          onChangeText={setRepeatPassword}
          onBlur={() => form.touch("repeatPassword")}
          placeholder="Repeat password"
          secureTextEntry
          error={form.getError("repeatPassword")}
          showError={form.showError("repeatPassword")}
        />

        <FormSubmitButton
          label={isUpgrade ? "Create account" : "Sign up"}
          loadingLabel={isUpgrade ? "Creating account..." : "Signing up..."}
          loading={isSubmitting}
          disabled={!form.isValid}
          onPress={async () => {
            form.touchAll();
            if (!form.isValid) return;

            setIsSubmitting(true);
            setSubmitError(null);
            try {
              await signUp(email.trim(), password, isUpgrade ? { linkDevice: true } : undefined);
              if (isUpgrade) {
                resetToTabs(router);
              } else {
                resetToOnboardingChoose(router);
              }
            } catch (e: unknown) {
              setSubmitError(getUserFacingErrorMessage(e, "Sign up failed"));
            } finally {
              setIsSubmitting(false);
            }
          }}
        />

        {!!submitError && <Text style={formStyles.submitError}>{submitError}</Text>}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Link href={signInHref} style={styles.footerLink}>
            Sign in
          </Link>
        </View>
      </View>
    </ModalScreen>
  );
}

const styles = StyleSheet.create({
  ...modalScreenStyles,
  footer: { flexDirection: "row", gap: 6, marginTop: 14, justifyContent: "center" },
  footerText: { color: "#6b7280" },
  footerLink: { color: "#2563eb", fontWeight: "700" },
});
