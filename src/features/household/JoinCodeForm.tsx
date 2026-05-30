import { useMemo, useState } from "react";
import { Text, View } from "react-native";
import { FormSubmitButton } from "@/src/shared/components/form/FormSubmitButton";
import { FormTextField } from "@/src/shared/components/form/FormTextField";
import { formStyles } from "@/src/shared/components/form/formStyles";
import { useFormValidation } from "@/src/shared/validation/useFormValidation";
import { HOUSEHOLD_JOIN_CODE_LENGTH, validateJoinCode } from "./validation";

type JoinCodeFormProps = {
  onSubmit: (joinCode: string) => void | Promise<void>;
  submitLabel?: string;
  loadingLabel?: string;
  loading?: boolean;
  placeholder?: string;
  submitError?: string | null;
};

type JoinCodeField = "joinCode";

export function JoinCodeForm({
  onSubmit,
  submitLabel = "Join",
  loadingLabel,
  loading = false,
  placeholder = "Enter join code",
  submitError = null,
}: JoinCodeFormProps) {
  const [joinCode, setJoinCode] = useState("");

  const normalizedJoinCode = useMemo(() => joinCode.trim().toUpperCase(), [joinCode]);

  const fieldsConfig = useMemo(
    () => ({
      joinCode: { value: joinCode, validate: validateJoinCode },
    }),
    [joinCode],
  );

  const form = useFormValidation<JoinCodeField>(fieldsConfig);

  return (
    <View style={{ gap: 10 }}>
      <FormTextField
        value={joinCode}
        onChangeText={(text) => setJoinCode(text.toUpperCase())}
        onBlur={() => form.touch("joinCode")}
        placeholder={placeholder}
        autoCapitalize="characters"
        maxLength={HOUSEHOLD_JOIN_CODE_LENGTH}
        error={form.getError("joinCode")}
        showError={form.showError("joinCode")}
      />

      <FormSubmitButton
        label={submitLabel}
        loadingLabel={loadingLabel}
        loading={loading}
        disabled={!form.isValid}
        onPress={() => {
          form.touchAll();
          if (!form.isValid) return;
          void onSubmit(normalizedJoinCode);
        }}
      />

      {!!submitError && <Text style={formStyles.submitError}>{submitError}</Text>}
    </View>
  );
}
