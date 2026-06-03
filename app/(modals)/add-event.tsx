import { Stack } from "expo-router";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EventAttendeePicker } from "@/src/features/calendar/EventAttendeePicker";
import { EventFormFields } from "@/src/features/calendar/EventFormFields";
import { createEvent } from "@/src/features/calendar/eventsApi";
import { toGraphQLDateTimeString } from "@/src/features/calendar/eventDateUtils";
import { useHouseholdMemberOptions } from "@/src/features/calendar/useHouseholdMemberOptions";
import { TabAppHeader } from "@/src/features/household/TabAppHeader";
import { useHousehold } from "@/src/features/household/HouseholdProvider";
import { getUserFacingErrorMessage } from "@/src/shared/api/getUserFacingErrorMessage";
import { FormSubmitButton } from "@/src/shared/components/form/FormSubmitButton";
import { formStyles } from "@/src/shared/components/form/formStyles";
import { Screen } from "@/src/shared/components/Screen";
import { authScreenStyles } from "@/src/shared/theme/authScreenStyles";

function defaultEnd(start: Date): Date {
  const end = new Date(start);
  end.setHours(end.getHours() + 1);
  return end;
}

export default function AddEventModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
    <>
      <Stack.Screen
        options={{
          header: () => <TabAppHeader showBack showHouseholdSubheader={false} />,
        }}
      />
      <Screen withStackHeader>
        <ScrollView
          contentContainerStyle={[
            authScreenStyles.scrollContent,
            styles.scroll,
            { paddingBottom: Math.max(insets.bottom, 16) + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={authScreenStyles.centerBlock}>
            <View style={authScreenStyles.profileCard}>
              <Text style={authScreenStyles.cardTitle}>Add event</Text>

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
                error={
                  membersError
                    ? getUserFacingErrorMessage(membersError, "Could not load members")
                    : null
                }
                organizerNickname={organizer?.nickname}
              />

              {!!submitError && <Text style={formStyles.submitError}>{submitError}</Text>}

              <FormSubmitButton
                label="Create event"
                loadingLabel="Creating..."
                onPress={() => void onSubmit()}
                loading={saving}
                disabled={saving}
                style={authScreenStyles.submitButton}
              />
            </View>
          </View>
        </ScrollView>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
  },
});
