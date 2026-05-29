import { StyleSheet } from "react-native";

export const formStyles = StyleSheet.create({
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
    borderRadius: 10,
    alignItems: "center",
    marginTop: 6,
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: "white", fontWeight: "600" },
  submitError: { color: "#b91c1c", marginTop: 8 },
});
