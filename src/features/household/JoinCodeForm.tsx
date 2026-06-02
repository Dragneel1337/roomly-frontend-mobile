import { useMemo, useState } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { Text, View } from "react-native";
import { FormSubmitButton } from "@/src/shared/components/form/FormSubmitButton";
import { formStyles } from "@/src/shared/components/form/formStyles";
import { useFormValidation } from "@/src/shared/validation/useFormValidation";
import { JoinCodeInput } from "./JoinCodeInput";
import { validateJoinCode } from "./validation";

type JoinCodeFormProps = {
  onSubmit: (joinCode: string) => void | Promise<void>;
  submitLabel?: string;
  loadingLabel?: string;
  loading?: boolean;
  submitError?: string | null;
  joinButtonStyle?: StyleProp<ViewStyle>;
};

type JoinCodeField = "joinCode";

export function JoinCodeForm({
  onSubmit,
  submitLabel = "Join",
  loadingLabel,
  loading = false,
  submitError = null,
  joinButtonStyle,
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
      <JoinCodeInput
        value={joinCode}
        onChange={setJoinCode}
        onBlur={() => form.touch("joinCode")}
        error={form.getError("joinCode")}
        showError={form.showError("joinCode")}
      />

      <FormSubmitButton
        label={submitLabel}
        loadingLabel={loadingLabel}
        loading={loading}
        disabled={!form.isValid}
        style={joinButtonStyle}
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
