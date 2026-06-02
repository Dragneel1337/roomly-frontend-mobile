import { StyleSheet, Text, View } from "react-native";
import type { EventProfile, HouseholdEvent } from "@/src/features/calendar/eventsApi";

type EventParticipantsDisplayProps = {
  creator?: EventProfile | null;
  attendees?: EventProfile[];
  activeProfileId?: string | null;
};

export function formatParticipantsSummary(event: HouseholdEvent): string {
  const parts: string[] = [];
  if (event.creator?.nickname) {
    parts.push(`Organizer: ${event.creator.nickname}`);
  }
  const names = (event.attendees ?? []).map((a) => a.nickname).filter(Boolean);
  if (names.length > 0) {
    parts.push(`Participants: ${names.join(", ")}`);
  }
  return parts.join(" · ");
}

export function EventParticipantsDisplay({
  creator,
  attendees,
  activeProfileId,
}: EventParticipantsDisplayProps) {
  const list = attendees ?? [];
  const isYouOrganizer = creator?.id === activeProfileId;

  return (
    <View style={styles.wrap}>
      <Text style={styles.sectionTitle}>People</Text>
      {creator ? (
        <View style={styles.row}>
          <Text style={styles.role}>Organizer</Text>
          <Text style={styles.name}>
            {creator.nickname}
            {isYouOrganizer ? " (you)" : ""}
          </Text>
        </View>
      ) : null}
      <View style={styles.row}>
        <Text style={styles.role}>Participants</Text>
        {list.length === 0 ? (
          <Text style={styles.muted}>None</Text>
        ) : (
          <View style={styles.attendeeList}>
            {list.map((a) => (
              <Text key={a.id} style={styles.name}>
                {a.nickname}
                {a.id === activeProfileId ? " (you)" : ""}
              </Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 16, gap: 10 },
  sectionTitle: { fontSize: 14, fontWeight: "600", color: "#374151" },
  row: { gap: 4 },
  role: { fontSize: 12, fontWeight: "600", color: "#6b7280", textTransform: "uppercase" },
  name: { fontSize: 16, color: "#111827" },
  muted: { fontSize: 15, color: "#6b7280" },
  attendeeList: { gap: 4 },
});
