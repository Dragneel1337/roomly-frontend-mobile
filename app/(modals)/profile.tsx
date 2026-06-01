import { StyleSheet, Text, View } from "react-native";
import { useHousehold } from "@/src/features/household/HouseholdProvider";
import { ModalScreen, modalScreenStyles } from "@/src/shared/components/ModalScreen";

export default function ProfileModal() {
  const { profile } = useHousehold();

  return (
    <ModalScreen title="Profile">
      <View style={modalScreenStyles.container}>
        {profile ? (
          <View style={styles.section}>
            <Text style={styles.nickname}>{profile.nickname}</Text>
            <Text style={styles.avatarMeta}>
              {profile.avatar.name} ·{" "}
              <Text style={{ color: profile.avatar.colorHex }}>{profile.avatar.colorName}</Text>
            </Text>
          </View>
        ) : (
          <Text style={modalScreenStyles.subtitle}>No profile loaded</Text>
        )}
      </View>
    </ModalScreen>
  );
}

const styles = StyleSheet.create({
  section: { gap: 4, marginTop: 4 },
  nickname: { fontSize: 20, fontWeight: "700" },
  avatarMeta: { color: "#6b7280" },
});
