import { Pressable, StyleSheet, Text, View } from "react-native";
import type { ActiveProfile } from "@/src/features/profile/profileApi";
import { AvatarImagePreview } from "@/src/features/profile/AvatarImagePreview";
import {
  normalizeCatalogColor,
  resolveHexForDisplay,
} from "@/src/features/profile/avatarColorCatalog";
import { FormSubmitButton } from "@/src/shared/components/form/FormSubmitButton";
import { authScreenStyles } from "@/src/shared/theme/authScreenStyles";
import { colors } from "@/src/shared/theme/colors";

type ProfileViewCardProps = {
  profile: ActiveProfile;
  onCustomize: () => void;
};

export function ProfileViewCard({ profile, onCustomize }: ProfileViewCardProps) {
  const color = normalizeCatalogColor({
    name: profile.avatar.colorName,
    hex: profile.avatar.colorHex,
  });

  return (
    <View style={authScreenStyles.profileCard}>
      <View style={styles.hero}>
        <AvatarImagePreview avatarName={profile.avatar.name} color={color} />
      </View>

      <Text style={styles.nickname}>{profile.nickname}</Text>

      <View style={styles.colorRow}>
        <View
          style={[styles.colorDot, { backgroundColor: resolveHexForDisplay(color) }]}
        />
        <Text style={styles.colorLabel}>{profile.avatar.colorName}</Text>
      </View>

      <FormSubmitButton
        label="Customize appearance"
        onPress={onCustomize}
        style={authScreenStyles.submitButton}
      />
    </View>
  );
}

type ProfileEditActionsProps = {
  saving: boolean;
  canSave: boolean;
  onSave: () => void;
  onCancel: () => void;
};

export function ProfileEditActions({
  saving,
  canSave,
  onSave,
  onCancel,
}: ProfileEditActionsProps) {
  return (
    <View style={styles.editActions}>
      <FormSubmitButton
        label="Save changes"
        loadingLabel="Saving..."
        loading={saving}
        disabled={!canSave}
        onPress={onSave}
        style={authScreenStyles.submitButton}
      />
      <Pressable
        style={styles.cancelButton}
        disabled={saving}
        onPress={onCancel}
        accessibilityRole="button"
      >
        <Text style={styles.cancelText}>Cancel</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: "center",
    marginBottom: 4,
  },
  nickname: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
  },
  colorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 2,
  },
  colorDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.textPrimary,
  },
  colorLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  editActions: {
    gap: 10,
    marginTop: 4,
  },
  cancelButton: {
    alignItems: "center",
    paddingVertical: 10,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
  },
});
