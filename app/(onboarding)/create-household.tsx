import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  MEMBERS_LIMIT_DEFAULT,
  validateMembersLimit,
} from "@/src/features/household/validation";
import { validateHouseholdName } from "@/src/features/profile/validation";
import { FormSubmitButton } from "@/src/shared/components/form/FormSubmitButton";
import { FormTextField } from "@/src/shared/components/form/FormTextField";
import { routes } from "@/src/shared/routes";
import { ModalScreen, modalScreenStyles } from "@/src/shared/components/ModalScreen";
import { useFormValidation } from "@/src/shared/validation/useFormValidation";

type CreateHouseholdField = "name" | "membersLimit";

export default function CreateHouseholdScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [membersLimit, setMembersLimit] = useState(String(MEMBERS_LIMIT_DEFAULT));

  const fieldsConfig = useMemo(
    () => ({
      name: { value: name, validate: validateHouseholdName },
      membersLimit: { value: membersLimit, validate: validateMembersLimit },
    }),
    [name, membersLimit],
  );

  const form = useFormValidation<CreateHouseholdField>(fieldsConfig);

  return (
    <ModalScreen title="Create new household">
      <View style={styles.container}>
        <FormTextField
          value={name}
          onChangeText={setName}
          onBlur={() => form.touch("name")}
          placeholder="Household name"
          error={form.getError("name")}
          showError={form.showError("name")}
        />

        <Text style={styles.label}>Members limit</Text>
        <FormTextField
          value={membersLimit}
          onChangeText={(text) => setMembersLimit(text.replace(/[^0-9]/g, ""))}
          onBlur={() => form.touch("membersLimit")}
          placeholder="Max members"
          keyboardType="number-pad"
          error={form.getError("membersLimit")}
          showError={form.showError("membersLimit")}
        />

        <FormSubmitButton
          label="Continue"
          disabled={!form.isValid}
          onPress={() => {
            form.touchAll();
            if (!form.isValid) return;
            router.push({
              pathname: routes.onboarding.createProfile,
              params: { householdName: name.trim(), membersLimit: membersLimit.trim() },
            });
          }}
        />
      </View>
    </ModalScreen>
  );
}

const styles = StyleSheet.create({
  ...modalScreenStyles,
  label: { fontSize: 14, fontWeight: "600", marginTop: 6 },
});
