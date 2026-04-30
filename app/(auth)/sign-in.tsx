import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const canContinue = email.trim().length > 3 && password.length > 3;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign in</Text>

      <TextInput value={email} onChangeText={setEmail} placeholder="Email" autoCapitalize="none" style={styles.input} />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
        style={styles.input}
      />

      <Pressable
        style={[styles.button, !canContinue && styles.buttonDisabled]}
        disabled={!canContinue}
        onPress={() => router.replace("/(tabs)/shopping")}
      >
        <Text style={styles.buttonText}>Sign in</Text>
      </Pressable>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don’t have an account?</Text>
        <Link href="/(auth)/sign-up" style={styles.footerLink}>
          Sign up
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 10 },
  title: { fontSize: 22, fontWeight: "700" },
  input: { borderWidth: 1, borderColor: "#ddd", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
  button: { backgroundColor: "#111827", paddingVertical: 12, borderRadius: 10, alignItems: "center", marginTop: 6 },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: "white", fontWeight: "600" },
  footer: { flexDirection: "row", gap: 6, marginTop: 14, justifyContent: "center" },
  footerText: { color: "#6b7280" },
  footerLink: { color: "#2563eb", fontWeight: "700" },
});

