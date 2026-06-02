import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { AvatarColor } from "@/src/features/household/householdApi";
import {
  resolveColorLabel,
  resolveHexForDisplay,
} from "@/src/features/profile/avatarColorCatalog";
import {
  cycleIndex,
  isAvatarTaken,
  isColorTaken,
  type PartitionedOptions,
  type TakenSets,
} from "@/src/features/profile/profileAvailability";

type AvatarColorPickerModalProps = {
  visible: boolean;
  avatarOptions: PartitionedOptions<string>;
  colorOptions: PartitionedOptions<AvatarColor>;
  taken: TakenSets;
  initialAvatarName: string | null;
  initialColor: AvatarColor | null;
  onClose: () => void;
  onDone: (avatarName: string, color: AvatarColor) => void;
};

function indexInOrdered<T>(ordered: T[], item: T | null, matches: (a: T, b: T) => boolean): number {
  if (!item || ordered.length === 0) return 0;
  const found = ordered.findIndex((entry) => matches(entry, item));
  return found >= 0 ? found : 0;
}

export function AvatarColorPickerModal({
  visible,
  avatarOptions,
  colorOptions,
  taken,
  initialAvatarName,
  initialColor,
  onClose,
  onDone,
}: AvatarColorPickerModalProps) {
  const insets = useSafeAreaInsets();

  const [avatarIndex, setAvatarIndex] = useState(0);
  const [colorIndex, setColorIndex] = useState(0);

  useEffect(() => {
    if (!visible) return;

    const avatarStart = indexInOrdered(
      avatarOptions.ordered,
      initialAvatarName,
      (a, b) => a === b,
    );
    const colorStart = indexInOrdered(
      colorOptions.ordered,
      initialColor,
      (a, b) => a.name === b.name,
    );

    setAvatarIndex(
      avatarOptions.available.includes(initialAvatarName ?? "")
        ? avatarStart
        : avatarOptions.ordered.findIndex((name) =>
            avatarOptions.available.includes(name),
          ) || 0,
    );
    setColorIndex(
      initialColor && colorOptions.available.some((c) => c.name === initialColor.name)
        ? colorStart
        : colorOptions.ordered.findIndex((c) =>
            colorOptions.available.some((a) => a.name === c.name),
          ) || 0,
    );
  }, [visible, initialAvatarName, initialColor, avatarOptions, colorOptions]);

  const currentAvatar = avatarOptions.ordered[avatarIndex];
  const currentColor = colorOptions.ordered[colorIndex];

  const avatarTaken = currentAvatar ? isAvatarTaken(currentAvatar, taken) : false;
  const colorTaken = currentColor ? isColorTaken(currentColor, taken) : false;
  const canConfirm = currentAvatar && currentColor && !avatarTaken && !colorTaken;

  const previewBorderColor = useMemo(
    () => (currentColor && !colorTaken ? resolveHexForDisplay(currentColor) : "#d1d5db"),
    [currentColor, colorTaken],
  );

  function showTakenHint(index: number, total: number, takenCount: number) {
    return takenCount > 0 && index >= total - takenCount;
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.header}>
            <Pressable onPress={onClose} hitSlop={8}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Text style={styles.title}>Choose look</Text>
            <Pressable
              onPress={() => {
                if (!canConfirm || !currentAvatar || !currentColor) return;
                onDone(currentAvatar, currentColor);
              }}
              hitSlop={8}
              disabled={!canConfirm}
            >
              <Text style={[styles.doneText, !canConfirm && styles.doneTextDisabled]}>Done</Text>
            </Pressable>
          </View>

          <Text style={styles.hint}>
            Gray options at the end are already used in this household. Use arrows to browse;
            only free options can be saved.
          </Text>

          <View style={[styles.preview, { borderColor: previewBorderColor }, avatarTaken && styles.previewTaken]}>
            <Text style={[styles.previewAvatar, avatarTaken && styles.takenText]}>
              {currentAvatar ?? "—"}
            </Text>
            <Text
              style={[
                styles.previewColor,
                currentColor && !colorTaken ? { color: resolveHexForDisplay(currentColor) } : null,
                (colorTaken || avatarTaken) && styles.takenText,
              ]}
            >
              {currentColor ? resolveColorLabel(currentColor) : "—"}
              {avatarTaken || colorTaken ? " · Taken" : ""}
            </Text>
          </View>

          <Text style={styles.sectionLabel}>Avatar</Text>
          <PickerRow
            label={currentAvatar ?? "—"}
            taken={avatarTaken}
            showTakenBadge={showTakenHint(
              avatarIndex,
              avatarOptions.ordered.length,
              avatarOptions.taken.length,
            )}
            onPrev={() => setAvatarIndex((i) => cycleIndex(i - 1, avatarOptions.ordered.length))}
            onNext={() => setAvatarIndex((i) => cycleIndex(i + 1, avatarOptions.ordered.length))}
          />

          <Text style={styles.sectionLabel}>Color</Text>
          <PickerRow
            label={currentColor ? resolveColorLabel(currentColor) : "—"}
            taken={colorTaken}
            swatchHex={currentColor && !colorTaken ? resolveHexForDisplay(currentColor) : "#d1d5db"}
            showTakenBadge={showTakenHint(
              colorIndex,
              colorOptions.ordered.length,
              colorOptions.taken.length,
            )}
            onPrev={() => setColorIndex((i) => cycleIndex(i - 1, colorOptions.ordered.length))}
            onNext={() => setColorIndex((i) => cycleIndex(i + 1, colorOptions.ordered.length))}
          />
        </View>
      </View>
    </Modal>
  );
}

type PickerRowProps = {
  label: string;
  taken: boolean;
  swatchHex?: string;
  showTakenBadge: boolean;
  onPrev: () => void;
  onNext: () => void;
};

function PickerRow({ label, taken, swatchHex, showTakenBadge, onPrev, onNext }: PickerRowProps) {
  return (
    <View style={styles.row}>
      <Pressable style={styles.arrow} onPress={onPrev}>
        <Text style={styles.arrowText}>‹</Text>
      </Pressable>
      <View style={[styles.rowCenter, taken && styles.rowCenterTaken]}>
        {swatchHex ? <View style={[styles.swatch, { backgroundColor: swatchHex }]} /> : null}
        <Text style={[styles.rowLabel, taken && styles.takenText]} numberOfLines={1}>
          {label}
        </Text>
        {showTakenBadge ? <Text style={styles.takenBadge}>Taken</Text> : null}
      </View>
      <Pressable style={styles.arrow} onPress={onNext}>
        <Text style={styles.arrowText}>›</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    gap: 10,
    maxHeight: "92%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: 17, fontWeight: "700" },
  cancelText: { color: "#6b7280", fontWeight: "600" },
  doneText: { color: "#2563eb", fontWeight: "700" },
  doneTextDisabled: { color: "#93c5fd" },
  hint: { color: "#6b7280", fontSize: 13, lineHeight: 18 },
  preview: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 4,
  },
  previewTaken: { opacity: 0.45 },
  previewAvatar: { fontSize: 18, fontWeight: "700" },
  previewColor: { marginTop: 4, fontWeight: "600" },
  sectionLabel: { fontSize: 14, fontWeight: "600", marginTop: 4 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  arrow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
  },
  arrowText: { fontSize: 28, fontWeight: "600", lineHeight: 30 },
  rowCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 8,
  },
  rowCenterTaken: { opacity: 0.4 },
  rowLabel: { fontSize: 16, fontWeight: "600", flexShrink: 1 },
  takenText: { color: "#9ca3af" },
  takenBadge: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6b7280",
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  swatch: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
});
