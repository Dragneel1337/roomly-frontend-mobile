import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { EventAttendeePicker } from "@/src/features/calendar/EventAttendeePicker";
import { EventFormFields } from "@/src/features/calendar/EventFormFields";
import { createEvent } from "@/src/features/calendar/eventsApi";
import { toGraphQLDateTimeString } from "@/src/features/calendar/eventDateUtils";
import { useHouseholdMemberOptions } from "@/src/features/calendar/useHouseholdMemberOptions";
import { useHousehold } from "@/src/features/household/HouseholdProvider";
import { getUserFacingErrorMessage } from "@/src/shared/api/getUserFacingErrorMessage";
import { FormSubmitButton } from "@/src/shared/components/form/FormSubmitButton";
import { formStyles } from "@/src/shared/components/form/formStyles";
import { ModalScreen, modalScreenStyles } from "@/src/shared/components/ModalScreen";

function defaultEnd(start: Date): Date {
  const end = new Date(start);
  end.setHours(end.getHours() + 1);
  return end;
}

export default function AddEventModal() {
  const router = useRouter();
  const { activeHouseholdId } = useHousehold();
  const { inviteOptions, organizer, loading: membersLoading, error: membersError } =
    useHouseholdMemberOptions();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState(() => new Date());
  const [endTime, setEndTime] = useState(() => defaultEnd(new Date()));
  const [pickerTarget, setPickerTarget] = useState<"start" | "end" | null>(null);
  const [selectedAttendeeIds, setSelectedAttendeeIds] = useState<Set<string>>(() => new Set());
  const [nameError, setNameError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const toggleAttendee = useCallback((profileId: string) => {
    setSelectedAttendeeIds((prev) => {
      const next = new Set(prev);
      if (next.has(profileId)) next.delete(profileId);
      else next.add(profileId);
      return next;
    });
  }, []);

  async function onSubmit() {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError("Name is required");
      return;
    }
    if (endTime.getTime() <= startTime.getTime()) {
      setSubmitError("End time must be after start time");
      return;
    }
    if (!activeHouseholdId) {
      setSubmitError("No active household");
      return;
    }

    setSaving(true);
    setSubmitError(null);
    setNameError(null);
    try {
      await createEvent(activeHouseholdId, {
        name: trimmed,
        description: description.trim() || null,
        startTime: toGraphQLDateTimeString(startTime),
        endTime: toGraphQLDateTimeString(endTime),
        attendeeIds: [...selectedAttendeeIds],
      });
      router.back();
    } catch (e: unknown) {
      setSubmitError(getUserFacingErrorMessage(e, "Could not create event"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalScreen title="Add event">
      <ScrollView contentContainerStyle={modalScreenStyles.container}>
        <EventFormFields
          name={name}
          onNameChange={setName}
          description={description}
          onDescriptionChange={setDescription}
          startTime={startTime}
          endTime={endTime}
          onStartTimeChange={(d) => {
            setStartTime(d);
            if (endTime.getTime() <= d.getTime()) {
              setEndTime(defaultEnd(d));
            }
          }}
          onEndTimeChange={setEndTime}
          pickerTarget={pickerTarget}
          onPickerTargetChange={setPickerTarget}
          nameError={nameError}
        />

        <EventAttendeePicker
          members={inviteOptions}
          selectedIds={selectedAttendeeIds}
          onToggle={toggleAttendee}
          loading={membersLoading}
          error={membersError ? getUserFacingErrorMessage(membersError, "Could not load members") : null}
          organizerNickname={organizer?.nickname}
        />

        {!!submitError && <Text style={formStyles.submitError}>{submitError}</Text>}
        <View style={styles.submitWrap}>
          <FormSubmitButton label="Create event" onPress={() => void onSubmit()} loading={saving} />
        </View>
      </ScrollView>
    </ModalScreen>
  );
}

const styles = StyleSheet.create({
  submitWrap: { marginTop: 16 },
});
