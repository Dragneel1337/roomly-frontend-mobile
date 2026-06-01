import { useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { formStyles } from "@/src/shared/components/form/formStyles";
import { HOUSEHOLD_JOIN_CODE_LENGTH } from "./validation";

function normalizeJoinCodeInput(text: string): string {
  return text.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, HOUSEHOLD_JOIN_CODE_LENGTH);
}

type JoinCodeInputProps = {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string | null;
  showError?: boolean;
};

export function JoinCodeInput({
  value,
  onChange,
  onBlur,
  error,
  showError = false,
}: JoinCodeInputProps) {
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);

  const hasError = showError && !!error;
  const cells = Array.from({ length: HOUSEHOLD_JOIN_CODE_LENGTH }, (_, index) => value[index] ?? "");

  const activeIndex = focused
    ? Math.min(value.length, HOUSEHOLD_JOIN_CODE_LENGTH - 1)
    : -1;

  return (
    <View>
      <Pressable style={styles.row} onPress={() => inputRef.current?.focus()}>
        {cells.map((char, index) => (
          <Pressable
            key={index}
            style={[
              styles.cell,
              char !== "" && styles.cellFilled,
              index === activeIndex && styles.cellActive,
              hasError && styles.cellError,
            ]}
            onPress={() => inputRef.current?.focus()}
          >
            <Text style={styles.cellText}>{char}</Text>
          </Pressable>
        ))}
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={(text) => onChange(normalizeJoinCodeInput(text))}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          maxLength={HOUSEHOLD_JOIN_CODE_LENGTH}
          autoCapitalize="characters"
          autoCorrect={false}
          autoComplete="off"
          caretHidden
          style={styles.hiddenInput}
        />
      </Pressable>
      {hasError && <Text style={formStyles.fieldError}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    position: "relative",
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 48,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  cellFilled: {
    backgroundColor: "#f9fafb",
  },
  cellActive: {
    borderColor: "#2563eb",
    borderWidth: 2,
  },
  cellError: {
    borderColor: "#dc2626",
  },
  cellText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    width: "100%",
    height: "100%",
  },
});
