import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { validateHouseholdName } from "@/src/features/profile/validation";
import { FormSubmitButton } from "@/src/shared/components/form/FormSubmitButton";
import { FormTextField } from "@/src/shared/components/form/FormTextField";
import { routes } from "@/src/shared/routes";
import { Screen } from "@/src/shared/components/Screen";
import { useFormValidation } from "@/src/shared/validation/useFormValidation";

type CreateHouseholdField = "name";

export default function CreateHouseholdScreen() {
  const router = useRouter();
  const [name, setName] = useState("");

  const fieldsConfig = useMemo(
    () => ({
      name: { value: name, validate: validateHouseholdName },
    }),
    [name],
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
        <FormSubmitButton
          label="Create"
          disabled={!form.isValid}
          onPress={() => {
            form.touchAll();
            if (!form.isValid) return;
            router.replace(routes.onboarding.createProfile);
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 10 },
  title: { fontSize: 22, fontWeight: "700" },
});
