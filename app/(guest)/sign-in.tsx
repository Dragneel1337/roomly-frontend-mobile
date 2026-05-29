import { Link, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/src/features/auth/AuthProvider";
import { validateEmail, validatePassword } from "@/src/features/auth/validation";
import { getUserFacingErrorMessage } from "@/src/shared/api/getUserFacingErrorMessage";
import { FormSubmitButton } from "@/src/shared/components/form/FormSubmitButton";
import { FormTextField } from "@/src/shared/components/form/FormTextField";
import { formStyles } from "@/src/shared/components/form/formStyles";
import { resetToOnboardingChoose, resetToTabs } from "@/src/shared/navigation/resetRoutes";
import { routes } from "@/src/shared/routes";
import { Screen } from "@/src/shared/components/Screen";
import { useFormValidation } from "@/src/shared/validation/useFormValidation";

type SignInField = "email" | "password";

export default function SignInScreen() {
  const router = useRouter();
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

  return (
    <Screen withStackHeader>
      <View style={styles.container}>
        <Text style={styles.title}>Sign in</Text>

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

        <FormSubmitButton
          label="Sign in"
          loadingLabel="Signing in..."
          loading={isSubmitting}
          disabled={!form.isValid}
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

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don’t have an account?</Text>
          <Link href={routes.guest.signUp} style={styles.footerLink}>
            Sign up
          </Link>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 10 },
  title: { fontSize: 22, fontWeight: "700" },
  footer: { flexDirection: "row", gap: 6, marginTop: 14, justifyContent: "center" },
  footerText: { color: "#6b7280" },
  footerLink: { color: "#2563eb", fontWeight: "700" },
});
