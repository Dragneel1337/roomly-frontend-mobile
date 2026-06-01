import { Link } from "expo-router";
import { StyleSheet, View } from "react-native";
import { ModalScreen, modalScreenStyles } from "@/src/shared/components/ModalScreen";
import { routes } from "@/src/shared/routes";

export default function MenuModal() {
  return (
    <ModalScreen title="Menu">
      <View style={modalScreenStyles.container}>
        <View style={styles.list}>
          <Link href={routes.modals.profile} style={styles.item}>
            Profile
          </Link>
          <Link href={routes.modals.settings} style={styles.item}>
            Settings
          </Link>
        </View>
      </View>
    </ModalScreen>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10 },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
  },
});
