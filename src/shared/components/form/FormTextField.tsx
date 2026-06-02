import type { TextInputProps } from "react-native";
import { Text, TextInput, View } from "react-native";
import { colors } from "@/src/shared/theme/colors";
import { formStyles } from "./formStyles";

type FormTextFieldProps = Omit<TextInputProps, "style"> & {
  error?: string | null;
  showError?: boolean;
  variant?: "default" | "pill";
};

export function FormTextField({
  error,
  showError = false,
  variant = "default",
  onBlur,
  ...inputProps
}: FormTextFieldProps) {
  const hasError = showError && !!error;
  const isPill = variant === "pill";

  return (
    <View style={isPill ? formStyles.pillFieldContainer : undefined}>
      <TextInput
        {...inputProps}
        onBlur={onBlur}
        placeholderTextColor={inputProps.placeholderTextColor ?? colors.inputText}
        style={[
          isPill ? formStyles.inputPill : formStyles.input,
          hasError && (isPill ? formStyles.inputPillError : formStyles.inputError),
        ]}
      />
      {hasError ? (
        <Text style={isPill ? formStyles.fieldErrorPill : formStyles.fieldError}>{error}</Text>
      ) : null}
    </View>
  );
}
