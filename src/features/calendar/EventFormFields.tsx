import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useEffect, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { formatEventDateTimeFromDate } from "@/src/features/calendar/eventDateUtils";
import { FormTextField } from "@/src/shared/components/form/FormTextField";

type PickerTarget = "start" | "end" | null;
type AndroidPickerStep = "date" | "time";

type EventFormFieldsProps = {
  name: string;
  onNameChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  startTime: Date;
  endTime: Date;
  onStartTimeChange: (date: Date) => void;
  onEndTimeChange: (date: Date) => void;
  pickerTarget: PickerTarget;
  onPickerTargetChange: (target: PickerTarget) => void;
  nameError?: string | null;
};

function mergeDatePart(base: Date, picked: Date): Date {
  const merged = new Date(base);
  merged.setFullYear(picked.getFullYear(), picked.getMonth(), picked.getDate());
  return merged;
}

function mergeTimePart(base: Date, picked: Date): Date {
  const merged = new Date(base);
  merged.setHours(picked.getHours(), picked.getMinutes(), 0, 0);
  return merged;
}

export function EventFormFields({
  name,
  onNameChange,
  description,
  onDescriptionChange,
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  pickerTarget,
  onPickerTargetChange,
  nameError,
}: EventFormFieldsProps) {
  const [androidStep, setAndroidStep] = useState<AndroidPickerStep | null>(null);
  const [androidDraft, setAndroidDraft] = useState<Date | null>(null);

  const activeDate =
    Platform.OS === "android" && androidDraft
      ? androidDraft
      : pickerTarget === "end"
        ? endTime
        : startTime;

  useEffect(() => {
    if (!pickerTarget) {
      setAndroidStep(null);
      setAndroidDraft(null);
      return;
    }
    if (Platform.OS === "android") {
      setAndroidStep("date");
      setAndroidDraft(pickerTarget === "end" ? endTime : startTime);
    }
  }, [pickerTarget, endTime, startTime]);

  function applyDate(date: Date) {
    if (pickerTarget === "start") onStartTimeChange(date);
    else onEndTimeChange(date);
  }

  function closePicker() {
    onPickerTargetChange(null);
    setAndroidStep(null);
    setAndroidDraft(null);
  }

  function onPickerChange(event: DateTimePickerEvent, date?: Date) {
    if (event.type === "dismissed") {
      closePicker();
      return;
    }
    if (!date || !pickerTarget) return;

    if (Platform.OS === "android" && androidStep) {
      if (androidStep === "date") {
        const merged = mergeDatePart(activeDate, date);
        setAndroidDraft(merged);
        setAndroidStep("time");
        return;
      }
      const merged = mergeTimePart(activeDate, date);
      applyDate(merged);
      closePicker();
      return;
    }

    applyDate(date);
  }

  const showPicker = pickerTarget != null;
  const pickerMode =
    Platform.OS === "ios" ? "datetime" : (androidStep ?? "date");

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Name</Text>
      <FormTextField
        value={name}
        onChangeText={onNameChange}
        placeholder="Event name"
        error={nameError}
        showError={!!nameError}
      />

      <Text style={styles.label}>Description</Text>
      <FormTextField
        value={description}
        onChangeText={onDescriptionChange}
        placeholder="Optional"
        multiline
      />

      <Text style={styles.label}>Starts</Text>
      <Pressable style={styles.dateButton} onPress={() => onPickerTargetChange("start")}>
        <Text>{formatEventDateTimeFromDate(startTime)}</Text>
      </Pressable>

      <Text style={styles.label}>Ends</Text>
      <Pressable style={styles.dateButton} onPress={() => onPickerTargetChange("end")}>
        <Text>{formatEventDateTimeFromDate(endTime)}</Text>
      </Pressable>

      {showPicker && (Platform.OS === "ios" || androidStep) ? (
        <DateTimePicker
          value={activeDate}
          mode={pickerMode}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          minimumDate={pickerTarget === "end" ? startTime : undefined}
          onChange={onPickerChange}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  label: { fontSize: 14, fontWeight: "600", color: "#374151", marginTop: 4 },
  dateButton: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
  },
});
