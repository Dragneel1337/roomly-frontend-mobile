import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { validateJoinCode } from "@/src/features/household/validation";
import { routes } from "@/src/shared/routes";
import { Screen } from "@/src/shared/components/Screen";

export default function JoinHouseholdScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ joinCode?: string }>();
  const [nickname, setNickname] = useState("");
  const joinCode = useMemo(() => (params.joinCode ?? "").trim().toUpperCase(), [params.joinCode]);
  const joinCodeError = useMemo(() => validateJoinCode(joinCode), [joinCode]);
  const canContinue = !joinCodeError && !!nickname.trim();

  return (
    <Screen withStackHeader>
      <View style={styles.container}>
        <Text style={styles.title}>Join household</Text>
        <Text style={styles.subtitle}>Join code</Text>
        <TextInput value={joinCode} editable={false} style={[styles.input, styles.inputDisabled]} />
        {!!joinCodeError && <Text style={styles.fieldError}>{joinCodeError}</Text>}

        <Text style={styles.subtitle}>Nickname</Text>
        <TextInput value={nickname} onChangeText={setNickname} placeholder="Your nickname" style={styles.input} />

        <Pressable
          style={[styles.button, !canContinue && styles.buttonDisabled]}
          disabled={!canContinue}
          onPress={() => router.replace(routes.onboarding.createProfile)}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 10 },
  title: { fontSize: 22, fontWeight: "700" },
  subtitle: { fontSize: 14, fontWeight: "600", marginTop: 6 },
  input: { borderWidth: 1, borderColor: "#ddd", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
  inputDisabled: { backgroundColor: "#f9fafb", color: "#111827" },
  fieldError: { color: "#b91c1c", fontSize: 13, marginTop: -6 },
  button: { backgroundColor: "#111827", paddingVertical: 12, borderRadius: 10, alignItems: "center", marginTop: 8 },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: "white", fontWeight: "600" },
});
