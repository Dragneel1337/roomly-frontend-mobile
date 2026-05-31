import { StyleSheet, Text, View } from "react-native";
import { useHousehold } from "@/src/features/household/HouseholdProvider";
import { Screen } from "@/src/shared/components/Screen";

export default function ProfileModal() {
  const { profile } = useHousehold();

  return (
    <Screen withStackHeader>
      <View style={styles.container}>
        <Text style={styles.title}>Profile</Text>

        {profile ? (
          <View style={styles.section}>
            <Text style={styles.nickname}>{profile.nickname}</Text>
            <Text style={styles.avatarMeta}>
              {profile.avatar.name} ·{" "}
              <Text style={{ color: profile.avatar.colorHex }}>{profile.avatar.colorName}</Text>
            </Text>
          </View>
        ) : (
          <Text style={styles.subtitle}>No profile loaded</Text>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 10 },
  title: { fontSize: 22, fontWeight: "700" },
  subtitle: { color: "#6b7280" },
  section: { gap: 4, marginTop: 8 },
  nickname: { fontSize: 20, fontWeight: "700" },
  avatarMeta: { color: "#6b7280" },
});
