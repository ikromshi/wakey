import React from 'react';
import { View, Text, StyleSheet, Switch, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Alarm, formatAlarmTime, DayOfWeek } from '@/types/alarm';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '@/constants/theme';

interface AlarmCardProps {
  alarm: Alarm;
  onToggle: (id: string) => void;
  onPress?: (alarm: Alarm) => void;
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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function AlarmCard({ alarm, onToggle, onPress }: AlarmCardProps) {
  const scale = useSharedValue(1);
  const timeDisplay = formatAlarmTime(alarm.hour, alarm.minute);
  const repeatDisplay = formatRepeatDays(alarm.repeatDays);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handlePress = () => {
    onPress?.(alarm);
  };

  return (
    <AnimatedPressable
      style={[styles.container, animatedStyle, !alarm.enabled && styles.containerDisabled]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
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
      </View>
    </AnimatedPressable>
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
});
