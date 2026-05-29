import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/src/features/auth/AuthProvider";
import { routes } from "@/src/shared/routes";
import { Screen } from "@/src/shared/components/Screen";

export default function SettingsModal() {
  const router = useRouter();
  const { signOut } = useAuth();

  return (
    <Screen withStackHeader>
      <View style={styles.container}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Placeholder modal</Text>

        <Pressable
          style={styles.signOutButton}
          onPress={async () => {
            await signOut();
            router.replace(routes.guest.welcome);
          }}
        >
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 8 },
  title: { fontSize: 22, fontWeight: "700" },
  subtitle: { color: "#6b7280" },
  signOutButton: {
    marginTop: 16,
    backgroundColor: "#b91c1c",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  signOutText: { color: "white", fontWeight: "600" },
});
