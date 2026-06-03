import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  avatarInnerBackground,
  getAvatarBoxSize,
  getAvatarHeaderImageSize,
  getAvatarHeaderStageHeight,
  getAvatarHeaderStageWidth,
  getAvatarImageSize,
  getAvatarProfileCardStageHeight,
  getAvatarPickerStageHeight,
  getAvatarPickerStageWidth,
  type AvatarDisplayVariant,
} from "@/src/features/profile/avatarDisplay";
import { getAvatarOpticalOffset } from "@/src/features/profile/avatarOpticalOffsets";
import { colors } from "@/src/shared/theme/colors";

export type AvatarCircleVariant = AvatarDisplayVariant;

type AvatarCircleProps = {
  uri: string | null;
  /** Layout slot size; visual transparent square uses bleed. */
  size: number;
  variant?: AvatarCircleVariant;
  avatarName?: string | null;
  dimmed?: boolean;
  prefetch?: boolean;
  /** Shorter stage — profile card only (trims transparent PNG padding below). */
  compactStage?: boolean;
  style?: StyleProp<ViewStyle>;
  onError?: () => void;
};

export function AvatarCircle({
  uri,
  size,
  variant = "chip",
  avatarName = null,
  dimmed = false,
  prefetch = false,
  compactStage = false,
  style,
  onError,
}: AvatarCircleProps) {
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const isPicker = variant === "picker";
  const isHeader = variant === "header";
  const optical = getAvatarOpticalOffset(avatarName);

  useEffect(() => {
    setFailedUri(null);
  }, [uri]);

  useEffect(() => {
    if (!prefetch || !uri || uri === failedUri) return;
    void Image.prefetch(uri);
  }, [prefetch, uri, failedUri]);

  const displayUri = uri && uri !== failedUri ? uri : null;

  if (isPicker || isHeader) {
    const stageWidth = isPicker ? getAvatarPickerStageWidth(size) : getAvatarHeaderStageWidth();
    const stageHeight = isPicker
      ? compactStage
        ? getAvatarProfileCardStageHeight(size)
        : getAvatarPickerStageHeight(size)
      : getAvatarHeaderStageHeight();
    const imageSize = isHeader ? getAvatarHeaderImageSize() : getAvatarImageSize(size, variant);
    const offsetX = (stageWidth - imageSize) / 2 + optical.translateX;
    const offsetY = (stageHeight - imageSize) / 2 + optical.translateY;

    return (
      <View
        style={[
          styles.stage,
          {
            width: stageWidth,
            height: stageHeight,
            opacity: dimmed ? 0.45 : 1,
          },
          style,
        ]}
      >
        {displayUri ? (
          <Image
            source={{ uri: displayUri }}
            style={{
              position: "absolute",
              left: offsetX,
              top: offsetY,
              width: imageSize,
              height: imageSize,
            }}
            contentFit="contain"
            contentPosition="center"
            onError={() => {
              if (uri) setFailedUri(uri);
              onError?.();
            }}
          />
        ) : (
          <View
            style={[
              styles.placeholder,
              styles.placeholderCentered,
              {
                width: imageSize,
                height: imageSize,
                left: offsetX,
                top: offsetY,
              },
            ]}
          >
            <Ionicons name="person" size={size * 0.38} color={colors.textSecondary} />
          </View>
        )}
      </View>
    );
  }

  const boxSize = getAvatarBoxSize(size);
  const imageSize = getAvatarImageSize(size, variant);

  return (
    <View
      style={[
        styles.slot,
        {
          width: boxSize,
          height: boxSize,
          opacity: dimmed ? 0.45 : 1,
        },
        style,
      ]}
    >
      {displayUri ? (
        <Image
          source={{ uri: displayUri }}
          style={{
            width: imageSize,
            height: imageSize,
          }}
          contentFit="contain"
          contentPosition="center"
          onError={() => {
            if (uri) setFailedUri(uri);
            onError?.();
          }}
        />
      ) : (
        <View style={[styles.placeholder, { width: imageSize, height: imageSize }]}>
          <Ionicons name="person" size={size * 0.38} color={colors.textSecondary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    position: "relative",
    overflow: "visible",
    backgroundColor: "transparent",
  },
  slot: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    overflow: "visible",
  },
  placeholder: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: avatarInnerBackground,
    borderRadius: 8,
  },
  placeholderCentered: {
    alignSelf: "center",
  },
});
