import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { FeatureList, type Feature } from './FeatureList';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface PlanCardProps {
  name: string;
  price: string;
  period: string;
  features: Feature[];
  recommended?: boolean;
  badge?: string;
  buttonText: string;
  onPress: () => void;
  isLoading?: boolean;
  accentColor?: string;
}

export function PlanCard({
  name,
  price,
  period,
  features,
  recommended = false,
  badge,
  buttonText,
  onPress,
  isLoading = false,
  accentColor = Colors.primary,
}: PlanCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={isLoading}
      style={[
        animatedStyle,
        styles.container,
        recommended && styles.containerRecommended,
        recommended && { borderColor: accentColor },
      ]}
    >
      {badge && (
        <View style={[styles.badge, { backgroundColor: accentColor }]}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.name}>{name}</Text>
        <View style={styles.priceContainer}>
          <Text style={[styles.price, recommended && { color: accentColor }]}>
            {price}
          </Text>
          <Text style={styles.period}>{period}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.featuresContainer}>
        <FeatureList features={features} compact />
      </View>

      <Pressable
        style={[
          styles.button,
          recommended
            ? { backgroundColor: accentColor }
            : styles.buttonOutline,
          recommended && { borderColor: accentColor },
        ]}
        onPress={onPress}
        disabled={isLoading}
      >
        <Text
          style={[
            styles.buttonText,
            !recommended && { color: accentColor },
          ]}
        >
          {isLoading ? 'Processing...' : buttonText}
        </Text>
      </Pressable>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  containerRecommended: {
    borderWidth: 2,
  },
  badge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 12,
    color: Colors.card,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.md,
    marginTop: Spacing.xs,
  },
  name: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 20,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 32,
    color: Colors.text,
  },
  period: {
    fontFamily: 'Quicksand-Regular',
    fontSize: Typography.caption.fontSize,
    color: Colors.textLight,
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  featuresContainer: {
    marginBottom: Spacing.lg,
  },
  button: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  buttonText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: Typography.body.fontSize,
    color: Colors.card,
  },
});

export default PlanCard;
