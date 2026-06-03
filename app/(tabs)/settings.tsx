import { StyleSheet, View } from "react-native";
import { SettingsScreenContent } from "@/src/features/settings/SettingsScreenContent";
import { Screen } from "@/src/shared/components/Screen";

export default function SettingsTab() {
  return (
    <Screen withStackHeader edges={["left", "right"]}>
      <View style={styles.page}>
        <SettingsScreenContent />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
});
