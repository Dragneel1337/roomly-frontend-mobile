import { Link, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/src/features/auth/AuthProvider";
import { useHousehold } from "@/src/features/household/HouseholdProvider";
import { resetToWelcome } from "@/src/shared/navigation/resetRoutes";
import { ModalScreen, modalScreenStyles } from "@/src/shared/components/ModalScreen";
import { routes } from "@/src/shared/routes";

export default function SettingsModal() {
  const router = useRouter();
  const { authMode, signOut } = useAuth();
  const { household } = useHousehold();

  return (
    <ModalScreen title="Settings">
      <View style={modalScreenStyles.container}>
        {household && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Household</Text>
            <Text style={styles.householdName}>{household.name}</Text>
            <Text style={styles.label}>Join code</Text>
            <Text style={styles.joinCode} selectable>
              {household.joinCode}
            </Text>
            <Link href={routes.modals.switchHousehold} style={styles.link}>
              Switch household
            </Link>
            <Link href={routes.modals.joinHousehold} style={styles.link}>
              Join another household
            </Link>
          </View>
        )}

        {authMode === "device" ? (
          <>
            <Text style={modalScreenStyles.subtitle}>
              Your data lives only on this device. Create an account to back it up and sync across
              devices.
            </Text>
            <Pressable
              style={styles.upgradeButton}
              onPress={() =>
                router.push({
                  pathname: routes.guest.signIn,
                  params: { intent: "upgrade" },
                })
              }
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
    </ModalScreen>
  );
}

const styles = StyleSheet.create({
  section: { gap: 6, marginTop: 8, marginBottom: 8 },
  sectionTitle: { fontSize: 14, fontWeight: "600", color: "#374151" },
  householdName: { fontSize: 16, fontWeight: "600" },
  label: { fontSize: 13, color: "#6b7280", marginTop: 4 },
  joinCode: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 2,
    fontVariant: ["tabular-nums"],
  },
  link: { color: "#2563eb", fontWeight: "600", marginTop: 8 },
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
