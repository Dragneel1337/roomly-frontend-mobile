import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { authCardShadow } from "@/src/shared/theme/authScreenStyles";
import { colors } from "@/src/shared/theme/colors";
import { spacing } from "@/src/shared/theme/spacing";
import { typography } from "@/src/shared/theme/typography";

type HomeSectionCardProps = {
  title: string;
  children: ReactNode;
  footerLabel?: string;
  onFooterPress?: () => void;
};

export function HomeSectionCard({ title, children, footerLabel, onFooterPress }: HomeSectionCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.body}>{children}</View>
      {footerLabel && onFooterPress ? (
        <Pressable
          style={styles.footerButton}
          onPress={onFooterPress}
          accessibilityRole="button"
        >
          <Text style={styles.footerLabel}>{footerLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function HomeItemRow({ children }: { children: ReactNode }) {
  return <View style={styles.itemRow}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.field,
    borderRadius: spacing.cardRadius,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
    gap: 14,
    ...authCardShadow,
  },
  title: {
    ...typography.sectionTitle,
    color: colors.textPrimary,
    textAlign: "center",
  },
  body: {
    gap: 10,
  },
  itemRow: {
    backgroundColor: colors.white,
    borderRadius: spacing.inputRadius,
    paddingVertical: 14,
    paddingHorizontal: 14,
    minHeight: 52,
    justifyContent: "center",
  },
  footerButton: {
    alignSelf: "center",
    backgroundColor: colors.button,
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 999,
    marginTop: 4,
  },
  footerLabel: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
});
