import React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { Alarm } from '@/types/alarm';
import { AlarmCard } from './AlarmCard';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DELETE_THRESHOLD = -80;
const DELETE_WIDTH = 80;

interface SwipeableAlarmCardProps {
  alarm: Alarm;
  onToggle: (id: string) => void;
  onPress?: (alarm: Alarm) => void;
  onDelete: (id: string) => void;
}

export function SwipeableAlarmCard({
  alarm,
  onToggle,
  onPress,
  onDelete,
}: SwipeableAlarmCardProps) {
  const translateX = useSharedValue(0);
  const itemHeight = useSharedValue(100); // Will be measured
  const isDeleting = useSharedValue(false);

  const handleDelete = () => {
    onDelete(alarm.id);
  };

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-5, 5])
    .onUpdate((event) => {
      // Only allow swiping left (negative values)
      const clampedX = Math.min(0, Math.max(event.translationX, -DELETE_WIDTH - 20));
      translateX.value = clampedX;
    })
    .onEnd((event) => {
      if (translateX.value < DELETE_THRESHOLD) {
        // Snap to show delete button
        translateX.value = withSpring(-DELETE_WIDTH, { damping: 20, stiffness: 300 });
      } else {
        // Snap back
        translateX.value = withSpring(0, { damping: 20, stiffness: 300 });
      }
    });

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const animatedDeleteStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, DELETE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  const animatedContainerStyle = useAnimatedStyle(() => {
    if (isDeleting.value) {
      return {
        height: withTiming(0, { duration: 200 }),
        opacity: withTiming(0, { duration: 200 }),
        marginVertical: withTiming(0, { duration: 200 }),
      };
    }
    return {};
  });

  const handleDeletePress = () => {
    // Animate out then delete
    isDeleting.value = true;
    translateX.value = withTiming(-SCREEN_WIDTH, { duration: 200 }, (finished) => {
      if (finished) {
        runOnJS(handleDelete)();
      }
    });
  };

  const handleCardPress = (pressedAlarm: Alarm) => {
    // If swiped open, close it first
    if (translateX.value < -10) {
      translateX.value = withSpring(0, { damping: 20, stiffness: 300 });
    } else {
      onPress?.(pressedAlarm);
    }
  };

  return (
    <Animated.View style={[styles.container, animatedContainerStyle]}>
      {/* Delete button background */}
      <Animated.View style={[styles.deleteContainer, animatedDeleteStyle]}>
        <Pressable style={styles.deleteButton} onPress={handleDeletePress}>
          <IconSymbol name="trash.fill" size={24} color={Colors.card} />
          <Text style={styles.deleteText}>Delete</Text>
        </Pressable>
      </Animated.View>

      {/* Swipeable card */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={animatedCardStyle}>
          <AlarmCard
            alarm={alarm}
            onToggle={onToggle}
            onPress={handleCardPress}
          />
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  deleteContainer: {
    position: 'absolute',
    right: Spacing.lg,
    top: Spacing.sm,
    bottom: Spacing.sm,
    width: DELETE_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: Colors.danger,
    borderRadius: BorderRadius.lg,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  deleteText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 12,
    color: Colors.card,
  },
});
