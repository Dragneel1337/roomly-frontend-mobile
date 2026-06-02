import { StyleSheet } from "react-native";
import { authPillShadow } from "@/src/shared/theme/authScreenStyles";
import { colors } from "@/src/shared/theme/colors";
import { spacing } from "@/src/shared/theme/spacing";

export const formStyles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: colors.field,
    backgroundColor: colors.inputBackground,
    color: colors.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: spacing.inputRadius,
  },
  inputPill: {
    borderWidth: 0,
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 20,
    textAlign: "left",
    color: colors.textPrimary,
    ...authPillShadow,
  },
  pillFieldContainer: {
    gap: 6,
  },
  inputError: { borderColor: colors.error },
  inputPillError: {
    borderWidth: 1,
    borderColor: colors.error,
  },
  fieldError: { color: colors.error, fontSize: 13, marginTop: 4 },
  fieldErrorPill: {
    color: colors.error,
    fontSize: 13,
    lineHeight: 18,
    marginHorizontal: 8,
  },
  button: {
    backgroundColor: colors.button,
    paddingVertical: 12,
    borderRadius: spacing.buttonRadius,
    alignItems: "center",
    marginTop: 6,
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: colors.white, fontWeight: "600" },
  submitError: { color: colors.error, marginTop: 8 },
});
