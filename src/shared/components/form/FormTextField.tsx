import type { TextInputProps } from "react-native";
import { Text, TextInput, View } from "react-native";
import { formStyles } from "./formStyles";

type FormTextFieldProps = Omit<TextInputProps, "style"> & {
  error?: string | null;
  showError?: boolean;
};

export function FormTextField({
  error,
  showError = false,
  onBlur,
  ...inputProps
}: FormTextFieldProps) {
  const hasError = showError && !!error;

  return (
    <View>
      <TextInput
        {...inputProps}
        onBlur={onBlur}
        style={[formStyles.input, hasError && formStyles.inputError]}
      />
      {hasError && <Text style={formStyles.fieldError}>{error}</Text>}
    </View>
  );
}
