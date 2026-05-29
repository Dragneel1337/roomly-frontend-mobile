import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { HOUSEHOLD_JOIN_CODE_LENGTH, validateJoinCode } from "./validation";

type JoinCodeFormProps = {
  onSubmit: (joinCode: string) => void;
  submitLabel?: string;
  placeholder?: string;
};

export function JoinCodeForm({
  onSubmit,
  submitLabel = "Join",
  placeholder = "Enter join code",
}: JoinCodeFormProps) {
  const [joinCode, setJoinCode] = useState("");
  const [touched, setTouched] = useState(false);

  const normalizedJoinCode = useMemo(() => joinCode.trim().toUpperCase(), [joinCode]);
  const joinCodeError = useMemo(() => validateJoinCode(joinCode), [joinCode]);
  const canSubmit = !joinCodeError;
  const showError = touched && !!joinCodeError;

  return (
    <View style={styles.wrapper}>
      <TextInput
        value={joinCode}
        onChangeText={(text) => setJoinCode(text.toUpperCase())}
        onBlur={() => setTouched(true)}
        placeholder={placeholder}
        autoCapitalize="characters"
        maxLength={HOUSEHOLD_JOIN_CODE_LENGTH}
        style={[styles.input, showError && styles.inputError]}
      />
      {showError && <Text style={styles.fieldError}>{joinCodeError}</Text>}

      <Pressable
        style={[styles.button, !canSubmit && styles.buttonDisabled]}
        disabled={!canSubmit}
        onPress={() => {
          setTouched(true);
          if (joinCodeError) return;
          onSubmit(normalizedJoinCode);
        }}
      >
        <Text style={styles.buttonText}>{submitLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  inputError: { borderColor: "#b91c1c" },
  fieldError: { color: "#b91c1c", fontSize: 13, marginTop: -6 },
  button: {
    backgroundColor: "#111827",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: "white", fontWeight: "600" },
});
