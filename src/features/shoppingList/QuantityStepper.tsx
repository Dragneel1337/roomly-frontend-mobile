import { Pressable, StyleSheet, Text, View } from "react-native";

type QuantityStepperProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  disabled?: boolean;
  allowRemoveAtMin?: boolean;
};

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  disabled = false,
  allowRemoveAtMin = false,
}: QuantityStepperProps) {
  const minusDisabled = disabled || (value <= min && !allowRemoveAtMin);

  return (
    <View style={styles.row}>
      <Pressable
        style={[styles.button, minusDisabled && styles.buttonDisabled]}
        disabled={minusDisabled}
        onPress={() => onChange(value <= min ? 0 : value - 1)}
      >
        <Text style={styles.buttonText}>−</Text>
      </Pressable>
      <Text style={styles.value}>{value}</Text>
      <Pressable
        style={[styles.button, disabled && styles.buttonDisabled]}
        disabled={disabled}
        onPress={() => onChange(value + 1)}
      >
        <Text style={styles.buttonText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  button: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { fontSize: 20, fontWeight: "600", lineHeight: 22 },
  value: { fontSize: 16, fontWeight: "600", minWidth: 24, textAlign: "center" },
});
