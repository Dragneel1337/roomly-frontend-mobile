import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import type { HouseholdMemberOption } from "@/src/features/calendar/useHouseholdMemberOptions";
import { authScreenStyles, authPillShadow } from "@/src/shared/theme/authScreenStyles";
import { colors } from "@/src/shared/theme/colors";
import { spacing } from "@/src/shared/theme/spacing";

type EventAttendeePickerProps = {
  members: HouseholdMemberOption[];
  selectedIds: Set<string>;
  onToggle: (profileId: string) => void;
  loading?: boolean;
  error?: string | null;
  organizerNickname?: string | null;
};

export function EventAttendeePicker({
  members,
  selectedIds,
  onToggle,
  loading,
  error,
  organizerNickname,
}: EventAttendeePickerProps) {
  return (
    <View style={styles.wrap}>
      <Text style={authScreenStyles.fieldLabel}>Participants</Text>
      {organizerNickname ? (
        <Text style={authScreenStyles.hintText}>
          You ({organizerNickname}) are the organizer. Invited members receive a notification.
        </Text>
      ) : (
        <Text style={authScreenStyles.hintText}>Invited members receive a notification.</Text>
      )}

      {loading ? (
        <ActivityIndicator style={styles.loader} color={colors.textPrimary} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : members.length === 0 ? (
        <Text style={styles.emptyText}>No other household members to invite.</Text>
      ) : (
        <View style={styles.list}>
          {members.map((member) => {
            const selected = selectedIds.has(member.profileId);
            return (
              <Pressable
                key={member.profileId}
                style={[styles.row, selected && styles.rowSelected]}
                onPress={() => onToggle(member.profileId)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
              >
                <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                  {selected ? <Text style={styles.checkmark}>✓</Text> : null}
                </View>
                <Text style={styles.name}>{member.nickname}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 8,
    gap: 8,
  },
  loader: {
    marginVertical: 8,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    textAlign: "center",
  },
  emptyText: {
    ...authScreenStyles.hintText,
  },
  list: {
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: spacing.inputRadius,
    ...authPillShadow,
  },
  rowSelected: {
    backgroundColor: colors.inputBackground,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.textPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    backgroundColor: colors.button,
    borderColor: colors.button,
  },
  checkmark: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 16,
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
    flex: 1,
  },
});
