import { Image } from "expo-image";
import { StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import {
  HEADER_TITLE_FONT_SIZE,
  HEADER_TITLE_LINE_HEIGHT,
} from "@/src/features/profile/avatarDisplay";
import { roomlyLogoImage } from "@/src/shared/brand/brandAssets";
import { colors } from "@/src/shared/theme/colors";

type RoomlyHeaderBrandProps = {
  fontSize?: number;
  lineHeight?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

/** Logo + “Roomly” — logo replaces “#” from the original `#Roomly` title. */
export function RoomlyHeaderBrand({
  fontSize = HEADER_TITLE_FONT_SIZE,
  lineHeight = HEADER_TITLE_LINE_HEIGHT,
  color = colors.onHeader,
  style,
  textStyle,
}: RoomlyHeaderBrandProps) {
  const logoSize = fontSize;

  return (
    <View
      style={[styles.row, style]}
      accessibilityRole="header"
      accessibilityLabel="Roomly"
    >
      <View style={[styles.logoSlot, { width: logoSize, height: logoSize }]}>
        <Image source={roomlyLogoImage} style={styles.logo} contentFit="contain" />
      </View>
      <Text
        style={[
          styles.title,
          {
            fontSize,
            lineHeight,
            color,
          },
          textStyle,
        ]}
      >
        Roomly
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 0,
  },
  logoSlot: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: 1,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  title: {
    fontWeight: "700",
    textAlign: "center",
    includeFontPadding: false,
  },
});
