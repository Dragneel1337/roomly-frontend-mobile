import { useMutation } from "@apollo/client/react";
import { Stack } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TabAppHeader } from "@/src/features/household/TabAppHeader";
import { useHousehold } from "@/src/features/household/HouseholdProvider";
import { HOUSEHOLD_RESOURCES } from "@/src/features/household/householdResourcesApi";
import { useHouseholdResources } from "@/src/features/household/useHouseholdResources";
import { ProfileSetupFields } from "@/src/features/profile/ProfileSetupFields";
import { buildTakenSetsForHouseholdEdit } from "@/src/features/profile/profileAvailability";
import { normalizeCatalogColor } from "@/src/features/profile/avatarColorCatalog";
import { UPDATE_PROFILE } from "@/src/features/profile/profileApi";
import { ProfileEditActions, ProfileViewCard } from "@/src/features/profile/ProfileViewCard";
import { useProfileSetup } from "@/src/features/profile/useProfileSetup";
import { apolloClient } from "@/src/shared/api/apolloClient";
import { getUserFacingErrorMessage } from "@/src/shared/api/getUserFacingErrorMessage";
import { Screen } from "@/src/shared/components/Screen";
import { formStyles } from "@/src/shared/components/form/formStyles";
import { authScreenStyles } from "@/src/shared/theme/authScreenStyles";
import { colors } from "@/src/shared/theme/colors";
import { spacing } from "@/src/shared/theme/spacing";

export default function ProfileModal() {
  const insets = useSafeAreaInsets();
  const { profile, activeProfileId, refreshActiveProfile } = useHousehold();
  const { resources, loading: resourcesLoading } = useHouseholdResources();
  const [editing, setEditing] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const householdTaken = useMemo(() => {
    if (!resources || !activeProfileId) return undefined;
    return buildTakenSetsForHouseholdEdit(resources.allMembers, activeProfileId);
  }, [resources, activeProfileId]);

  const setupOptions = useMemo(() => {
    if (!profile || !householdTaken) return undefined;
    return {
      householdTaken,
      initial: {
        nickname: profile.nickname,
        avatarName: profile.avatar.name,
        colorName: profile.avatar.colorName,
      },
    };
  }, [profile, householdTaken]);

  const setup = useProfileSetup(setupOptions);

  const [updateProfileMutation, { loading: saving }] = useMutation(UPDATE_PROFILE);

  async function onSave() {
    if (!profile || !activeProfileId) return;

    setup.touchAll();
    const payload = setup.getProfilePayload();
    if (!payload) {
      setSubmitError(
        setup.selectionTakenError ?? "Pick an avatar and color that are not taken.",
      );
      return;
    }

    setSubmitError(null);
    try {
      const variables: {
        profileId: string;
        nickname?: string;
        avatarName?: string;
        avatarColorName?: string;
      } = { profileId: activeProfileId };

      if (payload.nickname !== profile.nickname) {
        variables.nickname = payload.nickname;
      }
      if (payload.avatarName !== profile.avatar.name) {
        variables.avatarName = payload.avatarName;
      }
      const nextColorKey = normalizeCatalogColor({
        name: payload.avatarColorName,
        hex: payload.avatarColorName,
      }).name;
      const currentColorKey = normalizeCatalogColor({
        name: profile.avatar.colorName,
        hex: profile.avatar.colorHex,
      }).name;
      if (nextColorKey !== currentColorKey) {
        variables.avatarColorName = payload.avatarColorName;
      }

      await updateProfileMutation({ variables });
      await refreshActiveProfile();
      await apolloClient.refetchQueries({ include: [HOUSEHOLD_RESOURCES] });
      setEditing(false);
    } catch (err) {
      setSubmitError(getUserFacingErrorMessage(err, "Could not update profile"));
    }
  }

  function onCancelEdit() {
    setSubmitError(null);
    setEditing(false);
    if (profile && householdTaken) {
      setup.setNickname(profile.nickname);
      setup.applyPickerSelection(profile.avatar.name, {
        name: profile.avatar.colorName,
        hex: profile.avatar.colorHex,
      });
    }
  }

  function handleBack() {
    if (editing) {
      onCancelEdit();
      return;
    }
  }

  const waitingForEdit = editing && (!profile || !householdTaken || setup.optionsLoading);

  return (
    <>
      <Stack.Screen
        options={{
          header: () => (
            <TabAppHeader
              showBack
              showHouseholdSubheader={false}
              onBackPress={editing ? handleBack : undefined}
            />
          ),
        }}
      />
      <Screen withStackHeader>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            authScreenStyles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 16) + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {!profile ? (
              <Text style={styles.emptyText}>No profile loaded</Text>
            ) : editing ? (
              waitingForEdit ? (
                <ActivityIndicator color={colors.textPrimary} style={styles.loader} />
              ) : (
                <View style={authScreenStyles.profileCard}>
                  <ProfileSetupFields setup={setup} variant="edit" />
                  <ProfileEditActions
                    saving={saving}
                    canSave={setup.canSubmit}
                    onSave={() => void onSave()}
                    onCancel={onCancelEdit}
                  />
                  {!!submitError && <Text style={formStyles.submitError}>{submitError}</Text>}
                </View>
              )
            ) : resourcesLoading && !resources ? (
              <ActivityIndicator color={colors.textPrimary} style={styles.loader} />
            ) : (
              <ProfileViewCard profile={profile} onCustomize={() => setEditing(true)} />
            )}
          </View>
        </ScrollView>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingTop: spacing.sectionGap,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.screenPadding,
  },
  loader: { marginVertical: 40 },
  emptyText: {
    color: colors.inputText,
    textAlign: "center",
  },
});
