import { Image } from "expo-image";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { comingSoonImage } from "@/src/shared/brand/brandAssets";
import { spacing } from "@/src/shared/theme/spacing";

type ComingSoonIllustrationProps = {
  style?: StyleProp<ViewStyle>;
};

export function ComingSoonIllustration({ style }: ComingSoonIllustrationProps) {
  return (
    <View style={[styles.wrap, style]} accessibilityRole="image" accessibilityLabel="Coming soon">
      <Image source={comingSoonImage} style={styles.image} contentFit="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: 24,
  },
  image: {
    width: "100%",
    maxWidth: 340,
    flex: 1,
    maxHeight: 420,
  },
});
