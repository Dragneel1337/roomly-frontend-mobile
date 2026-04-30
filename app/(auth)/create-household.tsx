import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export default function CreateHouseholdScreen() {
  const router = useRouter();
  const [name, setName] = useState("");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create new household</Text>
      <TextInput value={name} onChangeText={setName} placeholder="Household name" style={styles.input} />
      <Pressable
        style={[styles.button, !name.trim() && styles.buttonDisabled]}
        disabled={!name.trim()}
        onPress={() => router.replace("/(auth)/create-profile")}
      >
        <Text style={styles.buttonText}>Create</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 10 },
  title: { fontSize: 22, fontWeight: "700" },
  input: { borderWidth: 1, borderColor: "#ddd", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
  button: { backgroundColor: "#111827", paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: "white", fontWeight: "600" },
});

