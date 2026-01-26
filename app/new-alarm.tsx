import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

import { Colors, Spacing, BorderRadius, Typography, Shadows } from '@/constants/theme';
import { useAlarms } from '@/context/AlarmContext';
import { DEFAULT_ALARM, DayOfWeek } from '@/types/alarm';

const DAYS: { key: DayOfWeek; label: string }[] = [
  { key: 'sun', label: 'S' },
  { key: 'mon', label: 'M' },
  { key: 'tue', label: 'T' },
  { key: 'wed', label: 'W' },
  { key: 'thu', label: 'T' },
  { key: 'fri', label: 'F' },
  { key: 'sat', label: 'S' },
];

export default function NewAlarmScreen() {
  const { addAlarm } = useAlarms();

  // Initialize with current time rounded to next 5 minutes
  const now = new Date();
  now.setMinutes(Math.ceil(now.getMinutes() / 5) * 5, 0, 0);

  const [time, setTime] = useState(now);
  const [label, setLabel] = useState('');
  const [repeatDays, setRepeatDays] = useState<DayOfWeek[]>([]);

  const handleTimeChange = (_: any, selectedTime?: Date) => {
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  const toggleDay = (day: DayOfWeek) => {
    setRepeatDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleSave = () => {
    addAlarm({
      ...DEFAULT_ALARM,
      hour: time.getHours(),
      minute: time.getMinutes(),
      label: label.trim() || 'Alarm',
      repeatDays,
    });
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={handleCancel} style={styles.headerButton}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
        <Text style={styles.headerTitle}>New Alarm</Text>
        <Pressable onPress={handleSave} style={styles.headerButton}>
          <Text style={styles.saveText}>Save</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Time Picker */}
        <View style={styles.timePickerContainer}>
          <DateTimePicker
            value={time}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleTimeChange}
            style={styles.timePicker}
            textColor={Colors.text}
          />
        </View>

        {/* Label Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Label</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={label}
              onChangeText={setLabel}
              placeholder="Alarm"
              placeholderTextColor={Colors.textLight}
              maxLength={30}
            />
          </View>
        </View>

        {/* Repeat Days */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Repeat</Text>
          <View style={styles.daysContainer}>
            {DAYS.map(({ key, label: dayLabel }) => (
              <Pressable
                key={key}
                style={[
                  styles.dayButton,
                  repeatDays.includes(key) && styles.dayButtonActive,
                ]}
                onPress={() => toggleDay(key)}
              >
                <Text
                  style={[
                    styles.dayText,
                    repeatDays.includes(key) && styles.dayTextActive,
                  ]}
                >
                  {dayLabel}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.repeatHint}>
            {repeatDays.length === 0
              ? 'One time alarm'
              : repeatDays.length === 7
              ? 'Every day'
              : `${repeatDays.length} days selected`}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  headerTitle: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: Typography.heading.fontSize,
    color: Colors.text,
  },
  cancelText: {
    fontFamily: 'Quicksand-Medium',
    fontSize: Typography.body.fontSize,
    color: Colors.textLight,
  },
  saveText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: Typography.body.fontSize,
    color: Colors.primary,
  },
  content: {
    flex: 1,
  },
  timePickerContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.card,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.card,
  },
  timePicker: {
    height: 180,
    width: '100%',
  },
  section: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: Typography.body.fontSize,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    ...Shadows.card,
  },
  input: {
    fontFamily: 'Quicksand-Regular',
    fontSize: Typography.body.fontSize,
    color: Colors.text,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    ...Shadows.card,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  dayButtonActive: {
    backgroundColor: Colors.primary,
  },
  dayText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: Typography.body.fontSize,
    color: Colors.textLight,
  },
  dayTextActive: {
    color: Colors.card,
  },
  repeatHint: {
    fontFamily: 'Quicksand-Regular',
    fontSize: Typography.caption.fontSize,
    color: Colors.textLight,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
});
