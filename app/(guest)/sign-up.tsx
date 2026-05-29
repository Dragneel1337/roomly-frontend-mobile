import { Link, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useAuth } from "@/src/features/auth/AuthProvider";
import {
  validateEmail,
  validateNewPassword,
  validatePasswordsMatch,
} from "@/src/features/auth/validation";
import { routes } from "@/src/shared/routes";
import { Screen } from "@/src/shared/components/Screen";

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState({ email: false, password: false, repeatPassword: false });

  const emailError = useMemo(() => validateEmail(email), [email]);
  const passwordError = useMemo(() => validateNewPassword(password), [password]);
  const repeatPasswordError = useMemo(
    () => validatePasswordsMatch(password, repeatPassword),
    [password, repeatPassword],
  );

  const canContinue =
    !isSubmitting && !emailError && !passwordError && !repeatPasswordError;

  const showEmailError = touched.email && !!emailError;
  const showPasswordError = touched.password && !!passwordError;
  const showRepeatPasswordError = touched.repeatPassword && !!repeatPasswordError;

  return (
    <Screen withStackHeader>
      <View style={styles.container}>
        <Text style={styles.title}>Create my account</Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          style={[styles.input, showEmailError && styles.inputError]}
        />
        {showEmailError && <Text style={styles.fieldError}>{emailError}</Text>}

        <TextInput
          value={password}
          onChangeText={setPassword}
          onBlur={() => setTouched((t) => ({ ...t, password: true }))}
          placeholder="Password"
          secureTextEntry
          style={[styles.input, showPasswordError && styles.inputError]}
        />
        {showPasswordError && <Text style={styles.fieldError}>{passwordError}</Text>}

        <TextInput
          value={repeatPassword}
          onChangeText={setRepeatPassword}
          onBlur={() => setTouched((t) => ({ ...t, repeatPassword: true }))}
          placeholder="Repeat password"
          secureTextEntry
          style={[styles.input, showRepeatPasswordError && styles.inputError]}
        />
        {showRepeatPasswordError && <Text style={styles.fieldError}>{repeatPasswordError}</Text>}

        <Pressable
          style={[styles.button, !canContinue && styles.buttonDisabled]}
          disabled={!canContinue}
          onPress={async () => {
            setTouched({ email: true, password: true, repeatPassword: true });
            if (emailError || passwordError || repeatPasswordError) return;

            setIsSubmitting(true);
            setError(null);
            try {
              await signUp(email.trim(), password);
              router.replace(routes.onboarding.choose);
            } catch (e: unknown) {
              const message = e instanceof Error ? e.message : "Sign up failed";
              setError(message);
            } finally {
              setIsSubmitting(false);
            }
          }}
        >
          <Text style={styles.buttonText}>{isSubmitting ? "Signing up..." : "Sign up"}</Text>
        </Pressable>

        {!!error && <Text style={styles.errorText}>{error}</Text>}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Link href={routes.guest.signIn} style={styles.footerLink}>
            Sign in
          </Link>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 10 },
  title: { fontSize: 22, fontWeight: "700" },
  input: { borderWidth: 1, borderColor: "#ddd", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
  inputError: { borderColor: "#b91c1c" },
  fieldError: { color: "#b91c1c", fontSize: 13, marginTop: -6 },
  button: { backgroundColor: "#111827", paddingVertical: 12, borderRadius: 10, alignItems: "center", marginTop: 6 },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: "white", fontWeight: "600" },
  errorText: { color: "#b91c1c", marginTop: 8 },
  footer: { flexDirection: "row", gap: 6, marginTop: 14, justifyContent: "center" },
  footerText: { color: "#6b7280" },
  footerLink: { color: "#2563eb", fontWeight: "700" },
});
