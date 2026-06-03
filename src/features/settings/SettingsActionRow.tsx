import { Ionicons } from "@expo/vector-icons";
import { Link, type Href } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";
import { colors } from "@/src/shared/theme/colors";

type SettingsActionRowProps = {
  label: string;
  href: Href;
  accessibilityLabel?: string;
};

export function SettingsActionRow({ label, href, accessibilityLabel }: SettingsActionRowProps) {
  return (
    <Link href={href} asChild>
      <Pressable
        style={styles.row}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
      >
        <Text style={styles.label}>{label}</Text>
        <Ionicons name="chevron-forward" size={20} color={colors.button} />
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
});
