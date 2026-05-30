import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/src/features/auth/AuthProvider";
import { resetToWelcome } from "@/src/shared/navigation/resetRoutes";
import { routes } from "@/src/shared/routes";
import { Screen } from "@/src/shared/components/Screen";

export default function SettingsModal() {
  const router = useRouter();
  const { authMode, signOut } = useAuth();

  return (
    <Screen withStackHeader>
      <View style={styles.container}>
        <Text style={styles.title}>Settings</Text>

        {authMode === "device" ? (
          <>
            <Text style={styles.subtitle}>
              Your data lives only on this device. Create an account to back it up and sync across
              devices.
            </Text>
            <Pressable
              style={styles.upgradeButton}
              onPress={() => router.push(routes.modals.upgrade)}
            >
              <Text style={styles.upgradeText}>Upgrade account</Text>
            </Pressable>
          </>
        ) : (
          <Pressable
            style={styles.signOutButton}
            onPress={async () => {
              await signOut();
              resetToWelcome(router);
            }}
          >
            <Text style={styles.signOutText}>Sign out</Text>
          </Pressable>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 8 },
  title: { fontSize: 22, fontWeight: "700" },
  subtitle: { color: "#6b7280" },
  upgradeButton: {
    marginTop: 16,
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  upgradeText: { color: "white", fontWeight: "600" },
  signOutButton: {
    marginTop: 16,
    backgroundColor: "#b91c1c",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  signOutText: { color: "white", fontWeight: "600" },
});
