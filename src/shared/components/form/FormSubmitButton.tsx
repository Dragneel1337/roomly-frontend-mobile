import { Pressable, Text } from "react-native";
import { formStyles } from "./formStyles";

type FormSubmitButtonProps = {
  label: string;
  loadingLabel?: string;
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
};

export function FormSubmitButton({
  label,
  loadingLabel,
  loading = false,
  disabled = false,
  onPress,
}: FormSubmitButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      style={[formStyles.button, isDisabled && formStyles.buttonDisabled]}
      disabled={isDisabled}
      onPress={onPress}
    >
      <Text style={formStyles.buttonText}>{loading ? (loadingLabel ?? label) : label}</Text>
    </Pressable>
  );
}
