import { useRouter } from "expo-router";
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
import { Screen } from "@/src/shared/components/Screen";
import { useFormValidation } from "@/src/shared/validation/useFormValidation";

type UpgradeField = "email" | "password" | "repeatPassword";

export default function UpgradeModal() {
  const router = useRouter();
  const { upgradeAccount } = useAuth();
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

  const form = useFormValidation<UpgradeField>(fieldsConfig);

  return (
    <Screen withStackHeader>
      <View style={styles.container}>
        <Text style={styles.title}>Create an account</Text>
        <Text style={styles.subtitle}>
          Add an email and password to back up your data and sync it across devices.
        </Text>

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
          label="Upgrade account"
          loadingLabel="Upgrading..."
          loading={isSubmitting}
          disabled={!form.isValid}
          onPress={async () => {
            form.touchAll();
            if (!form.isValid) return;

            setIsSubmitting(true);
            setSubmitError(null);
            try {
              await upgradeAccount(email.trim(), password);
              if (router.canDismiss()) router.dismissAll();
            } catch (e: unknown) {
              setSubmitError(getUserFacingErrorMessage(e, "Upgrade failed"));
            } finally {
              setIsSubmitting(false);
            }
          }}
        />

        {!!submitError && <Text style={formStyles.submitError}>{submitError}</Text>}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 10 },
  title: { fontSize: 22, fontWeight: "700" },
  subtitle: { color: "#6b7280", marginBottom: 4 },
});
