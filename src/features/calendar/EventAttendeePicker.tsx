import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import type { HouseholdMemberOption } from "@/src/features/calendar/useHouseholdMemberOptions";

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
      <Text style={styles.label}>Participants</Text>
      {organizerNickname ? (
        <Text style={styles.hint}>
          You ({organizerNickname}) are the organizer. Invited members receive a notification.
        </Text>
      ) : (
        <Text style={styles.hint}>Invited members receive a notification.</Text>
      )}

      {loading ? (
        <ActivityIndicator style={styles.loader} />
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
                style={styles.row}
                onPress={() => onToggle(member.profileId)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
              >
                <Text style={styles.checkbox}>{selected ? "☑" : "☐"}</Text>
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
  wrap: { marginTop: 12, gap: 6 },
  label: { fontSize: 14, fontWeight: "600", color: "#374151" },
  hint: { fontSize: 13, color: "#6b7280", lineHeight: 18 },
  loader: { marginVertical: 8 },
  errorText: { color: "#b91c1c", fontSize: 13 },
  emptyText: { color: "#6b7280", fontSize: 13 },
  list: { gap: 4, marginTop: 4 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
  },
  checkbox: { fontSize: 18, color: "#2563eb" },
  name: { fontSize: 16, color: "#111827" },
});
