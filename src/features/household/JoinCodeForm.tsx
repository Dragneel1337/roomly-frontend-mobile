import { useMemo, useState } from "react";
import { View } from "react-native";
import { FormSubmitButton } from "@/src/shared/components/form/FormSubmitButton";
import { FormTextField } from "@/src/shared/components/form/FormTextField";
import { useFormValidation } from "@/src/shared/validation/useFormValidation";
import { HOUSEHOLD_JOIN_CODE_LENGTH, validateJoinCode } from "./validation";

type JoinCodeFormProps = {
  onSubmit: (joinCode: string) => void;
  submitLabel?: string;
  placeholder?: string;
};

type JoinCodeField = "joinCode";

export function JoinCodeForm({
  onSubmit,
  submitLabel = "Join",
  placeholder = "Enter join code",
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
        disabled={!form.isValid}
        onPress={() => {
          form.touchAll();
          if (!form.isValid) return;
          onSubmit(normalizedJoinCode);
        }}
      />
    </View>
  );
}
