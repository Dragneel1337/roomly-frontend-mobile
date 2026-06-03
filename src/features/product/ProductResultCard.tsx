import { Platform, Pressable, StyleSheet, Text } from "react-native";
import { colors } from "@/src/shared/theme/colors";

const CARD_RADIUS = 14;

type ProductResultCardProps = {
  title: string;
  subtitle?: string;
  onPress: () => void;
  disabled?: boolean;
};

export function ProductResultCard({
  title,
  subtitle,
  onPress,
  disabled = false,
}: ProductResultCardProps) {
  return (
    <Pressable
      style={[styles.card, cardShadow]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
      {!!subtitle && (
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      )}
    </Pressable>
  );
}

const cardShadow = Platform.select({
  ios: {
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 0,
  },
  android: { elevation: 3 },
  default: {},
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.inputBackground,
    borderRadius: CARD_RADIUS,
    paddingVertical: 16,
    paddingHorizontal: 18,
    minHeight: 52,
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
});
