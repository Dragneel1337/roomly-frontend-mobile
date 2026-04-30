import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

const AVATARS = ["Cat", "Dog", "Fox"];
const COLORS = ["Blue", "Red", "Green"];

export default function CreateProfileScreen() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [colorIndex, setColorIndex] = useState(0);

  const avatar = useMemo(() => AVATARS[avatarIndex % AVATARS.length], [avatarIndex]);
  const color = useMemo(() => COLORS[colorIndex % COLORS.length], [colorIndex]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose your name and avatar</Text>

      <Text style={styles.label}>Nickname</Text>
      <TextInput value={nickname} onChangeText={setNickname} placeholder="Your nickname" style={styles.input} />

      <Text style={styles.label}>Avatar</Text>
      <View style={styles.row}>
        <Pressable style={styles.pill} onPress={() => setAvatarIndex((i) => i - 1)}>
          <Text style={styles.pillText}>Prev</Text>
        </Pressable>
        <View style={styles.preview}>
          <Text style={styles.previewTitle}>{avatar}</Text>
          <Text style={styles.previewSubtitle}>{color}</Text>
        </View>
        <Pressable style={styles.pill} onPress={() => setAvatarIndex((i) => i + 1)}>
          <Text style={styles.pillText}>Next</Text>
        </Pressable>
      </View>

      <View style={styles.row}>
        <Pressable style={styles.pill} onPress={() => setColorIndex((i) => i - 1)}>
          <Text style={styles.pillText}>Prev color</Text>
        </Pressable>
        <Pressable style={styles.pill} onPress={() => setColorIndex((i) => i + 1)}>
          <Text style={styles.pillText}>Next color</Text>
        </Pressable>
      </View>

      <Pressable
        style={[styles.button, !nickname.trim() && styles.buttonDisabled]}
        disabled={!nickname.trim()}
        onPress={() => router.replace("/(tabs)/shopping")}
      >
        <Text style={styles.buttonText}>Confirm</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 10 },
  title: { fontSize: 22, fontWeight: "700" },
  label: { fontSize: 14, fontWeight: "600", marginTop: 6 },
  input: { borderWidth: 1, borderColor: "#ddd", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
  row: { flexDirection: "row", gap: 10, alignItems: "center", marginTop: 4 },
  pill: {
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  pillText: { fontWeight: "600" },
  preview: { flex: 1, borderWidth: 1, borderColor: "#eee", padding: 12, borderRadius: 12, alignItems: "center" },
  previewTitle: { fontSize: 16, fontWeight: "700" },
  previewSubtitle: { color: "#6b7280", marginTop: 2 },
  button: { backgroundColor: "#111827", paddingVertical: 12, borderRadius: 10, alignItems: "center", marginTop: 10 },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: "white", fontWeight: "600" },
});

