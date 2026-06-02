import { StyleSheet, View, type ViewStyle } from "react-native";
import Svg, { G, Path } from "react-native-svg";
import { colors } from "@/src/shared/theme/colors";

const CHEVRON_PATH =
  "M24.206 0.530414C26.7738 -1.19914 29.9604 1.62173 28.5551 4.38036L22.0912 17.0692C21.6554 17.9247 21.6554 18.9372 22.0912 19.7927L28.5551 32.4816C29.9604 35.2402 26.7738 38.0611 24.206 36.3315L1.32405 20.9192C-0.441347 19.7301 -0.441351 17.1318 1.32405 15.9427L24.206 0.530414Z";

const VIEW_WIDTH = 31;
const VIEW_HEIGHT = 39;

type HeaderBackChevronIconProps = {
  height?: number;
  style?: ViewStyle;
};

/** Figma back chevron (#E7F3FF + drop shadow offset 2×2 @ 25%). */
export function HeaderBackChevronIcon({ height = 32, style }: HeaderBackChevronIconProps) {
  const width = (VIEW_WIDTH / VIEW_HEIGHT) * height;

  return (
    <View style={[styles.wrap, style]}>
      <Svg width={width} height={height} viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`} fill="none">
        <G transform="translate(2, 2)">
          <Path d={CHEVRON_PATH} fill="rgba(28, 39, 76, 0.25)" />
        </G>
        <Path d={CHEVRON_PATH} fill={colors.inputBackground} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginLeft: 4,
  },
});
