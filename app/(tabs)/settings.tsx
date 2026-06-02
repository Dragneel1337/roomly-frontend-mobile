import { Link } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Screen } from "@/src/shared/components/Screen";
import { routes } from "@/src/shared/routes";

export default function SettingsTab() {
  return (
    <Screen withStackHeader>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.list}>
          <Link href={routes.modals.profile} style={styles.item}>
            <Text style={styles.itemText}>Profile</Text>
          </Link>
          <Link href={routes.modals.settings} style={styles.item}>
            <Text style={styles.itemText}>Household & account</Text>
          </Link>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  list: {
    gap: 10,
  },
  item: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
  },
  itemText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
