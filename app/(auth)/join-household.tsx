import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export default function JoinHouseholdScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ joinCode?: string }>();
  const [nickname, setNickname] = useState("");
  const joinCode = useMemo(() => (params.joinCode ?? "").trim().toUpperCase(), [params.joinCode]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Join household</Text>
      <Text style={styles.subtitle}>Join code</Text>
      <TextInput value={joinCode} editable={false} style={[styles.input, styles.inputDisabled]} />

      <Text style={styles.subtitle}>Nickname</Text>
      <TextInput value={nickname} onChangeText={setNickname} placeholder="Your nickname" style={styles.input} />

      <Pressable
        style={[styles.button, (!joinCode || !nickname.trim()) && styles.buttonDisabled]}
        disabled={!joinCode || !nickname.trim()}
        onPress={() => router.replace("/(auth)/create-profile")}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 10 },
  title: { fontSize: 22, fontWeight: "700" },
  subtitle: { fontSize: 14, fontWeight: "600", marginTop: 6 },
  input: { borderWidth: 1, borderColor: "#ddd", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
  inputDisabled: { backgroundColor: "#f9fafb", color: "#111827" },
  button: { backgroundColor: "#111827", paddingVertical: 12, borderRadius: 10, alignItems: "center", marginTop: 8 },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: "white", fontWeight: "600" },
});

