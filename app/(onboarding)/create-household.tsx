import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import {
  MEMBERS_LIMIT_DEFAULT,
  validateMembersLimit,
} from "@/src/features/household/validation";
import { validateHouseholdName } from "@/src/features/profile/validation";
import { FormSubmitButton } from "@/src/shared/components/form/FormSubmitButton";
import { FormTextField } from "@/src/shared/components/form/FormTextField";
import { ModalScreen } from "@/src/shared/components/ModalScreen";
import { routes } from "@/src/shared/routes";
import { authScreenStyles } from "@/src/shared/theme/authScreenStyles";
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
    <ModalScreen title="#Roomly">
      <ScrollView
        contentContainerStyle={authScreenStyles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={authScreenStyles.centerBlock}>
          <View style={authScreenStyles.card}>
            <Text style={authScreenStyles.cardTitle}>Enter new household name</Text>

            <FormTextField
              variant="pill"
              value={name}
              onChangeText={setName}
              onBlur={() => form.touch("name")}
              placeholder="Name"
              error={form.getError("name")}
              showError={form.showError("name")}
            />

            <Text style={authScreenStyles.fieldLabel}>Number of members</Text>
            <FormTextField
              variant="pill"
              value={membersLimit}
              onChangeText={(text) => setMembersLimit(text.replace(/[^0-9]/g, ""))}
              onBlur={() => form.touch("membersLimit")}
              placeholder="Number of members"
              keyboardType="number-pad"
              error={form.getError("membersLimit")}
              showError={form.showError("membersLimit")}
            />

            <FormSubmitButton
              label="Confirm"
              disabled={!form.isValid}
              style={authScreenStyles.submitButton}
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
        </View>
      </ScrollView>
    </ModalScreen>
  );
}
