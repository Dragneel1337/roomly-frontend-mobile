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
import { Screen } from "@/src/shared/components/Screen";
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
    <Screen withStackHeader>
      <View style={styles.container}>
        <Text style={styles.title}>Create new household</Text>
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 10 },
  title: { fontSize: 22, fontWeight: "700" },
  label: { fontSize: 14, fontWeight: "600", marginTop: 6 },
});
