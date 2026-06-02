import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { EventAttendeePicker } from "@/src/features/calendar/EventAttendeePicker";
import { EventFormFields } from "@/src/features/calendar/EventFormFields";
import { EventParticipantsDisplay } from "@/src/features/calendar/EventParticipantsDisplay";
import {
  formatEventDateTime,
  parseLocalDateTime,
  toGraphQLDateTimeString,
} from "@/src/features/calendar/eventDateUtils";
import {
  deleteEvent,
  fetchEvent,
  updateEvent,
  type HouseholdEvent,
} from "@/src/features/calendar/eventsApi";
import { useHouseholdMemberOptions } from "@/src/features/calendar/useHouseholdMemberOptions";
import { useHousehold } from "@/src/features/household/HouseholdProvider";
import { getUserFacingErrorMessage } from "@/src/shared/api/getUserFacingErrorMessage";
import { FormSubmitButton } from "@/src/shared/components/form/FormSubmitButton";
import { formStyles } from "@/src/shared/components/form/formStyles";
import { ModalScreen, modalScreenStyles } from "@/src/shared/components/ModalScreen";

function attendeeIdsFromEvent(event: HouseholdEvent): Set<string> {
  return new Set((event.attendees ?? []).map((a) => a.id));
}

export default function EventDetailModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{ eventId?: string }>();
  const eventId = params.eventId ? Number(params.eventId) : NaN;
  const { activeProfileId } = useHousehold();
  const { inviteOptions, organizer, loading: membersLoading, error: membersError } =
    useHouseholdMemberOptions();

  const [event, setEvent] = useState<HouseholdEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [pickerTarget, setPickerTarget] = useState<"start" | "end" | null>(null);
  const [selectedAttendeeIds, setSelectedAttendeeIds] = useState<Set<string>>(() => new Set());
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!Number.isFinite(eventId)) {
      setError("Invalid event");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEvent(eventId);
      if (!data) {
        setError("Event not found");
        return;
      }
      setEvent(data);
      setName(data.name);
      setDescription(data.description ?? "");
      setStartTime(parseLocalDateTime(data.startTime));
      setEndTime(parseLocalDateTime(data.endTime));
      setSelectedAttendeeIds(attendeeIdsFromEvent(data));
    } catch (e: unknown) {
      setError(getUserFacingErrorMessage(e, "Could not load event"));
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    void load();
  }, [load]);

  const isCreator = event?.creator?.id === activeProfileId;

  const toggleAttendee = useCallback((profileId: string) => {
    setSelectedAttendeeIds((prev) => {
      const next = new Set(prev);
      if (next.has(profileId)) next.delete(profileId);
      else next.add(profileId);
      return next;
    });
  }, []);

  function startEditing() {
    if (event) {
      setSelectedAttendeeIds(attendeeIdsFromEvent(event));
    }
    setEditing(true);
  }

  function confirmDelete() {
    Alert.alert("Delete event?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => void runDelete(),
      },
    ]);
  }

  async function runDelete() {
    if (!Number.isFinite(eventId)) return;
    setSaving(true);
    try {
      await deleteEvent(eventId);
      router.back();
    } catch (e: unknown) {
      setSubmitError(getUserFacingErrorMessage(e, "Could not delete event"));
    } finally {
      setSaving(false);
    }
  }

  async function onSave() {
    if (!Number.isFinite(eventId)) return;
    const trimmed = name.trim();
    if (!trimmed) {
      setSubmitError("Name is required");
      return;
    }
    if (endTime.getTime() <= startTime.getTime()) {
      setSubmitError("End time must be after start time");
      return;
    }
    setSaving(true);
    setSubmitError(null);
    try {
      await updateEvent({
        eventId,
        name: trimmed,
        description: description.trim() || null,
        startTime: toGraphQLDateTimeString(startTime),
        endTime: toGraphQLDateTimeString(endTime),
        attendeeIds: [...selectedAttendeeIds],
      });
      setEditing(false);
      await load();
    } catch (e: unknown) {
      setSubmitError(getUserFacingErrorMessage(e, "Could not update event"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalScreen title={editing ? "Edit event" : "Event"}>
      <ScrollView contentContainerStyle={modalScreenStyles.container}>
        {loading ? (
          <ActivityIndicator size="large" />
        ) : error ? (
          <Text style={formStyles.submitError}>{error}</Text>
        ) : event && editing ? (
          <>
            <EventFormFields
              name={name}
              onNameChange={setName}
              description={description}
              onDescriptionChange={setDescription}
              startTime={startTime}
              endTime={endTime}
              onStartTimeChange={setStartTime}
              onEndTimeChange={setEndTime}
              pickerTarget={pickerTarget}
              onPickerTargetChange={setPickerTarget}
            />
            {isCreator ? (
              <EventAttendeePicker
                members={inviteOptions}
                selectedIds={selectedAttendeeIds}
                onToggle={toggleAttendee}
                loading={membersLoading}
                error={
                  membersError
                    ? getUserFacingErrorMessage(membersError, "Could not load members")
                    : null
                }
                organizerNickname={organizer?.nickname ?? event.creator?.nickname}
              />
            ) : null}
            {!!submitError && <Text style={formStyles.submitError}>{submitError}</Text>}
            <View style={styles.actions}>
              <FormSubmitButton label="Save" onPress={() => void onSave()} loading={saving} />
              <Pressable onPress={() => setEditing(false)} style={styles.secondaryButton}>
                <Text style={styles.secondaryText}>Cancel</Text>
              </Pressable>
            </View>
          </>
        ) : event ? (
          <>
            <Text style={styles.title}>{event.name}</Text>
            {event.description ? (
              <Text style={styles.body}>{event.description}</Text>
            ) : null}
            <Text style={styles.meta}>
              {formatEventDateTime(event.startTime)} – {formatEventDateTime(event.endTime)}
            </Text>
            <EventParticipantsDisplay
              creator={event.creator}
              attendees={event.attendees}
              activeProfileId={activeProfileId}
            />
            {!!submitError && <Text style={formStyles.submitError}>{submitError}</Text>}
            <View style={styles.actions}>
              {isCreator ? (
                <Pressable style={styles.primaryButton} onPress={startEditing}>
                  <Text style={styles.primaryText}>Edit</Text>
                </Pressable>
              ) : null}
              {isCreator ? (
                <Pressable
                  style={styles.destructiveButton}
                  onPress={confirmDelete}
                  disabled={saving}
                >
                  <Text style={styles.destructiveText}>Delete</Text>
                </Pressable>
              ) : null}
            </View>
          </>
        ) : null}
      </ScrollView>
    </ModalScreen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: "700" },
  body: { color: "#374151", marginTop: 8 },
  meta: { color: "#6b7280", marginTop: 6, fontSize: 14 },
  actions: { marginTop: 24, gap: 10 },
  primaryButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  primaryText: { color: "#fff", fontWeight: "600" },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryText: { color: "#2563eb", fontWeight: "600" },
  destructiveButton: {
    backgroundColor: "#b91c1c",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  destructiveText: { color: "#fff", fontWeight: "600" },
});
