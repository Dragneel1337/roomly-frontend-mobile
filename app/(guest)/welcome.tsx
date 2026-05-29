import { Link, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { JoinCodeForm } from "@/src/features/household/JoinCodeForm";
import { routes } from "@/src/shared/routes";
import { Screen } from "@/src/shared/components/Screen";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <Screen withStackHeader>
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to Roomly</Text>

        <Text style={styles.sectionTitle}>Join household</Text>
        <JoinCodeForm
          onSubmit={(joinCode) =>
            router.push({ pathname: routes.onboarding.join, params: { joinCode } })
          }
        />

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Create household</Text>
        <Pressable
          style={styles.button}
          onPress={() => router.push(routes.onboarding.createHousehold)}
        >
          <Text style={styles.buttonText}>Create new household</Text>
        </Pressable>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Log in</Text>
        <View style={styles.iconRow}>
          <Pressable style={styles.iconButton} onPress={() => router.push(routes.guest.signIn)}>
            <Ionicons name="mail" size={22} />
            <Text style={styles.iconLabel}>Email</Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don’t have an account?</Text>
          <Link href={routes.guest.signUp} style={styles.footerLink}>
            Sign up
          </Link>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 10 },
  title: { fontSize: 28, fontWeight: "700", marginTop: 6 },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginTop: 12 },
  button: {
    backgroundColor: "#111827",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "white", fontWeight: "600" },
  divider: { height: 1, backgroundColor: "#eee", marginVertical: 10 },
  iconRow: { flexDirection: "row", gap: 12 },
  iconButton: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 12,
    borderRadius: 10,
  },
  iconLabel: { fontWeight: "600" },
  footer: { flexDirection: "row", gap: 6, marginTop: "auto", justifyContent: "center" },
  footerText: { color: "#6b7280" },
  footerLink: { color: "#2563eb", fontWeight: "700" },
});
