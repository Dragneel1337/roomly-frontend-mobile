import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/src/features/auth/AuthProvider";
import { validateNickname } from "@/src/features/profile/validation";
import { FormSubmitButton } from "@/src/shared/components/form/FormSubmitButton";
import { FormTextField } from "@/src/shared/components/form/FormTextField";
import { resetToTabs } from "@/src/shared/navigation/resetRoutes";
import { Screen } from "@/src/shared/components/Screen";
import { useFormValidation } from "@/src/shared/validation/useFormValidation";

const AVATARS = ["Cat", "Dog", "Fox"];
const COLORS = ["Blue", "Red", "Green"];

type CreateProfileField = "nickname";

export default function CreateProfileScreen() {
  const router = useRouter();
  const { completeOnboarding } = useAuth();
  const [nickname, setNickname] = useState("");
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [colorIndex, setColorIndex] = useState(0);

  const avatar = useMemo(() => AVATARS[avatarIndex % AVATARS.length], [avatarIndex]);
  const color = useMemo(() => COLORS[colorIndex % COLORS.length], [colorIndex]);

  const fieldsConfig = useMemo(
    () => ({
      nickname: { value: nickname, validate: validateNickname },
    }),
    [nickname],
  );

  const form = useFormValidation<CreateProfileField>(fieldsConfig);

  return (
    <Screen withStackHeader>
      <View style={styles.container}>
        <Text style={styles.title}>Choose your name and avatar</Text>

        <Text style={styles.label}>Nickname</Text>
        <FormTextField
          value={nickname}
          onChangeText={setNickname}
          onBlur={() => form.touch("nickname")}
          placeholder="Your nickname"
          error={form.getError("nickname")}
          showError={form.showError("nickname")}
        />

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

        <FormSubmitButton
          label="Confirm"
          disabled={!form.isValid}
          onPress={async () => {
            form.touchAll();
            if (!form.isValid) return;
            await completeOnboarding();
            resetToTabs(router);
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 10 },
  title: { fontSize: 22, fontWeight: "700" },
  label: { fontSize: 14, fontWeight: "600", marginTop: 6 },
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
});
