import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useEffect, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { formatEventDateTimeFromDate } from "@/src/features/calendar/eventDateUtils";
import { FormTextField } from "@/src/shared/components/form/FormTextField";
import { formStyles } from "@/src/shared/components/form/formStyles";
import { authScreenStyles } from "@/src/shared/theme/authScreenStyles";
import { colors } from "@/src/shared/theme/colors";
import { spacing } from "@/src/shared/theme/spacing";

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
      <Text style={authScreenStyles.fieldLabel}>Name</Text>
      <FormTextField
        variant="pill"
        value={name}
        onChangeText={onNameChange}
        placeholder="Event name"
        error={nameError}
        showError={!!nameError}
      />

      <Text style={authScreenStyles.fieldLabel}>Description</Text>
      <View style={formStyles.pillFieldContainer}>
        <TextInput
          value={description}
          onChangeText={onDescriptionChange}
          placeholder="Optional"
          placeholderTextColor={colors.textSecondary}
          multiline
          style={styles.descriptionInput}
        />
      </View>

      <Text style={authScreenStyles.fieldLabel}>Starts</Text>
      <Pressable
        style={styles.dateButton}
        onPress={() => onPickerTargetChange("start")}
        accessibilityRole="button"
      >
        <Text style={styles.dateButtonText}>{formatEventDateTimeFromDate(startTime)}</Text>
      </Pressable>

      <Text style={authScreenStyles.fieldLabel}>Ends</Text>
      <Pressable
        style={styles.dateButton}
        onPress={() => onPickerTargetChange("end")}
        accessibilityRole="button"
      >
        <Text style={styles.dateButtonText}>{formatEventDateTimeFromDate(endTime)}</Text>
      </Pressable>

      {showPicker && (Platform.OS === "ios" || androidStep) ? (
        <View style={styles.pickerWrap}>
          <DateTimePicker
            value={activeDate}
            mode={pickerMode}
            display={Platform.OS === "ios" ? "spinner" : "default"}
            minimumDate={pickerTarget === "end" ? startTime : undefined}
            onChange={onPickerChange}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  descriptionInput: {
    ...formStyles.inputPill,
    borderRadius: spacing.inputRadius,
    minHeight: 88,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  dateButton: {
    ...formStyles.inputPill,
    justifyContent: "center",
  },
  dateButtonText: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  pickerWrap: {
    backgroundColor: colors.white,
    borderRadius: spacing.inputRadius,
    overflow: "hidden",
    marginTop: 4,
  },
});
