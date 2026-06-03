import { Pressable, StyleSheet, Text, View } from "react-native";
import { NavChevronIcon } from "@/src/shared/navigation/NavChevronIcon";
import { authCardShadow } from "@/src/shared/theme/authScreenStyles";
import { colors } from "@/src/shared/theme/colors";
import { spacing } from "@/src/shared/theme/spacing";
import { typography } from "@/src/shared/theme/typography";

const CHEVRON_HEIGHT = 36;

type CalendarMonthNavigatorProps = {
  label: string;
  onPrev: () => void;
  onNext: () => void;
};

export function CalendarMonthNavigator({ label, onPrev, onNext }: CalendarMonthNavigatorProps) {
  return (
    <View style={styles.bar}>
      <Pressable
        accessibilityLabel="Previous month"
        accessibilityRole="button"
        onPress={onPrev}
        style={styles.chevronHit}
      >
        <NavChevronIcon direction="left" height={CHEVRON_HEIGHT} style={styles.chevron} />
      </Pressable>

      <Text style={styles.label}>{label}</Text>

      <Pressable
        accessibilityLabel="Next month"
        accessibilityRole="button"
        onPress={onNext}
        style={styles.chevronHit}
      >
        <NavChevronIcon direction="right" height={CHEVRON_HEIGHT} style={styles.chevron} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.field,
    borderRadius: spacing.cardRadius,
    paddingVertical: 10,
    paddingHorizontal: 8,
    ...authCardShadow,
  },
  chevronHit: {
    minWidth: CHEVRON_HEIGHT + 12,
    height: CHEVRON_HEIGHT + 8,
    alignItems: "center",
    justifyContent: "center",
  },
  chevron: {
    marginLeft: 0,
  },
  label: {
    flex: 1,
    textAlign: "center",
    ...typography.sectionTitle,
    color: colors.textPrimary,
  },
});
