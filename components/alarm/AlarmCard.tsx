import React from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/theme';
import { Alarm, DayOfWeek, formatAlarmTime } from '@/types/alarm';

interface AlarmCardProps {
  alarm: Alarm;
  onToggle: (id: string) => void;
  onPress?: (alarm: Alarm) => void;
  onDelete?: (id: string) => void;
}

const DAY_LABELS: Record<DayOfWeek, string> = {
  sun: 'Sun',
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
};

const DAY_ORDER: DayOfWeek[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

function formatRepeatDays(days: DayOfWeek[]): string {
  if (days.length === 0) return 'One time';
  if (days.length === 7) return 'Every day';

  const weekdays: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri'];
  const weekend: DayOfWeek[] = ['sat', 'sun'];

  if (days.length === 5 && weekdays.every(d => days.includes(d))) {
    return 'Weekdays';
  }
  if (days.length === 2 && weekend.every(d => days.includes(d))) {
    return 'Weekends';
  }

  // Sort days and return abbreviated names
  const sorted = [...days].sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b));
  return sorted.map(d => DAY_LABELS[d]).join(', ');
}

export function AlarmCard({ alarm, onToggle, onPress, onDelete }: AlarmCardProps) {
  const timeDisplay = formatAlarmTime(alarm.hour, alarm.minute);
  const repeatDisplay = formatRepeatDays(alarm.repeatDays);

  const handlePress = () => {
    onPress?.(alarm);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Alarm',
      `Are you sure you want to delete "${alarm.label}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete?.(alarm.id),
        },
      ]
    );
  };

  return (
    <Pressable
      style={[styles.container, !alarm.enabled && styles.containerDisabled]}
      onPress={handlePress}
    >
      <View style={styles.content}>
        <View style={styles.timeContainer}>
          <Text style={[styles.time, !alarm.enabled && styles.textDisabled]}>
            {timeDisplay}
          </Text>
          <Text style={[styles.label, !alarm.enabled && styles.textDisabled]}>
            {alarm.label}
          </Text>
          <Text style={[styles.repeat, !alarm.enabled && styles.textDisabled]}>
            {repeatDisplay}
          </Text>
        </View>

        {/* Updated Action Container */}
        <View style={styles.actions}>
          <Switch
            value={alarm.enabled}
            onValueChange={() => onToggle(alarm.id)}
            trackColor={{
              false: Colors.disabled,
              true: Colors.primary
            }}
            thumbColor={Colors.card}
            ios_backgroundColor={Colors.disabled}
          />
          {onDelete && (
            <Pressable style={styles.deleteButton} onPress={handleDelete}>
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.sm,
    ...Shadows.card,
  },
  containerDisabled: {
    opacity: 0.7,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
  },
  timeContainer: {
    flex: 1,
  },
  time: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: Typography.timeDisplay.fontSize,
    lineHeight: Typography.timeDisplay.lineHeight,
    color: Colors.text,
  },
  label: {
    fontFamily: 'Quicksand-Medium',
    fontSize: Typography.body.fontSize,
    color: Colors.text,
    marginTop: Spacing.xs,
  },
  repeat: {
    fontFamily: 'Quicksand-Regular',
    fontSize: Typography.caption.fontSize,
    color: Colors.textLight,
    marginTop: 2,
  },
  textDisabled: {
    color: Colors.textLight,
  },
  actions: {
    flexDirection: 'column',
    alignItems: 'center',
    // Increase this value to drop the button further down
    gap: Spacing.lg, 
  },
  deleteButton: {
    // You can also use marginTop for more precise control
    marginTop: 4, 
    paddingVertical: Spacing.xs,
  },
  deleteText: {
    color: Colors.danger,
    fontFamily: 'Quicksand-Medium',
    fontSize: 14,
  },
});