import { Link, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function WelcomeScreen() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const normalizedJoinCode = useMemo(() => joinCode.trim().toUpperCase(), [joinCode]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Roomly</Text>

      <Text style={styles.sectionTitle}>Join household</Text>
      <TextInput
        value={joinCode}
        onChangeText={setJoinCode}
        placeholder="Enter join code"
        autoCapitalize="characters"
        style={styles.input}
      />
      <Pressable
        style={[styles.button, !normalizedJoinCode && styles.buttonDisabled]}
        disabled={!normalizedJoinCode}
        onPress={() => router.push({ pathname: "/(auth)/join-household", params: { joinCode: normalizedJoinCode } })}
      >
        <Text style={styles.buttonText}>Join</Text>
      </Pressable>

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>Create household</Text>
      <Pressable style={styles.button} onPress={() => router.push("/(auth)/create-household")}>
        <Text style={styles.buttonText}>Create new household</Text>
      </Pressable>

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>Log in</Text>
      <View style={styles.iconRow}>
        <Pressable style={styles.iconButton} onPress={() => router.push("/(auth)/sign-in")}>
          <Ionicons name="mail" size={22} />
          <Text style={styles.iconLabel}>Email</Text>
        </Pressable>

        <Pressable style={styles.iconButton} onPress={() => router.push("/(auth)/sign-in")}>
          <Ionicons name="logo-google" size={22} />
          <Text style={styles.iconLabel}>Google</Text>
        </Pressable>
      </View>

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
  title: { fontSize: 28, fontWeight: "700", marginTop: 6 },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  button: {
    backgroundColor: "#111827",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: "white", fontWeight: "600" },
  divider: { height: 1, backgroundColor: "#eee", marginVertical: 10 },
  iconRow: { flexDirection: "row", gap: 12 },
  iconButton: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 12,
    borderRadius: 10,
  },
  iconLabel: { fontWeight: "600" },
  footer: { flexDirection: "row", gap: 6, marginTop: "auto", justifyContent: "center" },
  footerText: { color: "#6b7280" },
  footerLink: { color: "#2563eb", fontWeight: "700" },
});

