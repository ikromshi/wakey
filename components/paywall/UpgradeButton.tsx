import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { router } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { showAIVoicePaywall, isSuperwallLinked } from '@/services/superwall';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface UpgradeButtonProps {
  // Text shown on the button
  buttonText?: string;
  // Subtitle shown below the button
  subtitle?: string;
  // Callback after upgrade is triggered
  onUpgrade?: () => void;
  // Custom accent color
  accentColor?: string;
  // Compact mode for inline usage
  compact?: boolean;
}

export function UpgradeButton({
  buttonText = 'Subscribe to Premium',
  subtitle,
  onUpgrade,
  accentColor = Colors.primary,
  compact = false,
}: UpgradeButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handlePress = async () => {
    if (isSuperwallLinked()) {
      await showAIVoicePaywall();
    } else {
      // In development, navigate to paywall directly
      router.push('/paywall');
    }
    onUpgrade?.();
  };

  if (compact) {
    return (
      <AnimatedPressable
        style={[
          animatedStyle,
          styles.compactButton,
          { backgroundColor: accentColor },
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
      >
        <IconSymbol name="star.fill" size={16} color={Colors.card} />
        <Text style={styles.compactButtonText}>{buttonText}</Text>
      </AnimatedPressable>
    );
  }

  return (
    <View style={styles.container}>
      <AnimatedPressable
        style={[
          animatedStyle,
          styles.button,
          { backgroundColor: accentColor },
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
      >
        <IconSymbol name="star.fill" size={24} color={Colors.card} />
        <Text style={styles.buttonText}>{buttonText}</Text>
      </AnimatedPressable>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

interface PremiumBadgeProps {
  // Text shown in the badge
  text?: string;
}

export function FullPlanBadge({ text = 'Premium Feature' }: PremiumBadgeProps) {
  return (
    <View style={styles.badge}>
      <IconSymbol name="star.fill" size={14} color={Colors.primary} />
      <Text style={styles.badgeText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    width: '100%',
    ...Shadows.button,
  },
  buttonText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: Typography.body.fontSize,
    color: Colors.card,
  },
  subtitle: {
    fontFamily: 'Quicksand-Regular',
    fontSize: Typography.caption.fontSize,
    color: Colors.textLight,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  compactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  compactButtonText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: Typography.caption.fontSize,
    color: Colors.card,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primary + '20',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: Typography.caption.fontSize,
    color: Colors.primary,
  },
});
