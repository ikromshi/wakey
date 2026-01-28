import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Linking,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FeatureList, type Feature } from '@/components/paywall';
import {
  registerPlacement,
  isSuperwallLinked,
} from '@/services/superwall';
import { PLACEMENTS } from '@/config/superwall';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.sm) / 2;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Feature lists for each plan (compact for side-by-side)
const BASIC_FEATURES: Feature[] = [
  { text: 'Unlimited alarms', included: true },
  { text: 'Voice recording', included: true },
  { text: 'Script reading', included: true },
  { text: 'Audio templates', included: true },
  { text: 'AI voices', included: false },
];

const FULL_FEATURES: Feature[] = [
  { text: 'Everything in Basic', included: true },
  { text: 'AI voices', included: true, highlight: true },
  { text: '4 premium voices', included: true },
  { text: 'Unlimited AI', included: true },
  { text: 'Priority support', included: true },
];

interface CompactPlanCardProps {
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

function CompactPlanCard({
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
}: CompactPlanCardProps) {
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

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={isLoading}
      style={[
        animatedStyle,
        styles.card,
        recommended && styles.cardRecommended,
        recommended && { borderColor: accentColor },
      ]}
    >
      {badge && (
        <View style={[styles.badge, { backgroundColor: accentColor }]}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}

      <View style={styles.cardHeader}>
        <Text style={styles.cardName}>{name}</Text>
        <View style={styles.priceContainer}>
          <Text style={[styles.price, recommended && { color: accentColor }]}>
            {price}
          </Text>
          <Text style={styles.period}>{period}</Text>
        </View>
      </View>

      <View style={styles.cardDivider} />

      <View style={styles.featuresContainer}>
        <FeatureList features={features} compact />
      </View>

      <Pressable
        style={[
          styles.cardButton,
          recommended
            ? { backgroundColor: accentColor }
            : [styles.cardButtonOutline, { borderColor: accentColor }],
        ]}
        onPress={onPress}
        disabled={isLoading}
      >
        <Text
          style={[
            styles.cardButtonText,
            !recommended && { color: accentColor },
          ]}
        >
          {isLoading ? '...' : buttonText}
        </Text>
      </Pressable>
    </AnimatedPressable>
  );
}

export default function PaywallScreen() {
  const [isLoading, setIsLoading] = useState<'basic' | 'full' | null>(null);

  const handleSubscribe = async (plan: 'basic' | 'full') => {
    setIsLoading(plan);

    try {
      if (isSuperwallLinked()) {
        // Use Superwall to handle the purchase
        await registerPlacement(PLACEMENTS.ONBOARDING_COMPLETE, { selectedPlan: plan });
      } else {
        // Mock purchase flow for development/Expo Go
        await new Promise((resolve) => setTimeout(resolve, 1500));
        Alert.alert(
          'Development Mode',
          `In production, this would start the ${plan === 'full' ? 'Full' : 'Basic'} plan subscription via Superwall.`,
          [
            {
              text: 'Continue to App',
              onPress: () => router.replace('/(tabs)'),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Subscription error:', error);
      Alert.alert('Error', 'Failed to process subscription. Please try again.');
    } finally {
      setIsLoading(null);
    }
  };

  const handleRestorePurchases = async () => {
    setIsLoading('basic'); // Just to show loading state

    try {
      if (isSuperwallLinked()) {
        // Superwall handles restore through the SDK
        Alert.alert(
          'Restore Purchases',
          'Checking for previous purchases...',
          [{ text: 'OK' }]
        );
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        Alert.alert(
          'Development Mode',
          'In production, this would restore purchases via Superwall.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Restore error:', error);
      Alert.alert('Error', 'Failed to restore purchases. Please try again.');
    } finally {
      setIsLoading(null);
    }
  };

  const handleTerms = () => {
    Linking.openURL('https://example.com/terms');
  };

  const handlePrivacy = () => {
    Linking.openURL('https://example.com/privacy');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.titleSection}>
          <View style={styles.iconContainer}>
            <IconSymbol name="star.fill" size={32} color={Colors.primary} />
          </View>
          <Text style={styles.title}>Unlock Your Best Mornings</Text>
          <Text style={styles.subtitle}>
            Choose a plan that works for you
          </Text>
        </Animated.View>

        {/* Plan Cards - Side by Side */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.plansRow}>
          {/* Basic Plan */}
          <CompactPlanCard
            name="Basic"
            price="$4.99"
            period="/mo"
            features={BASIC_FEATURES}
            buttonText="Select"
            onPress={() => handleSubscribe('basic')}
            isLoading={isLoading === 'basic'}
            accentColor={Colors.primary}
          />

          {/* Full Plan - Recommended */}
          <CompactPlanCard
            name="Full"
            price="$9.99"
            period="/mo"
            features={FULL_FEATURES}
            recommended
            badge="Best"
            buttonText="Select"
            onPress={() => handleSubscribe('full')}
            isLoading={isLoading === 'full'}
            accentColor="#9B59B6"
          />
        </Animated.View>

        {/* Value Proposition */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.valueSection}>
          <View style={styles.valueItem}>
            <IconSymbol name="lock.fill" size={16} color={Colors.success} />
            <Text style={styles.valueText}>Cancel anytime</Text>
          </View>
          <View style={styles.valueDivider} />
          <View style={styles.valueItem}>
            <IconSymbol name="shield.fill" size={16} color={Colors.success} />
            <Text style={styles.valueText}>Secure payment</Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Pressable onPress={handleRestorePurchases}>
          <Text style={styles.restoreText}>Restore Purchases</Text>
        </Pressable>

        <View style={styles.legalLinks}>
          <Pressable onPress={handleTerms}>
            <Text style={styles.legalText}>Terms of Service</Text>
          </Pressable>
          <Text style={styles.legalDivider}>|</Text>
          <Pressable onPress={handlePrivacy}>
            <Text style={styles.legalText}>Privacy Policy</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 26,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontFamily: 'Quicksand-Regular',
    fontSize: Typography.body.fontSize,
    color: Colors.textLight,
    textAlign: 'center',
  },
  plansRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  cardRecommended: {
    borderWidth: 2,
  },
  badge: {
    position: 'absolute',
    top: -10,
    alignSelf: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 10,
    color: Colors.card,
    textTransform: 'uppercase',
  },
  cardHeader: {
    alignItems: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  cardName: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 16,
    color: Colors.text,
    marginBottom: 2,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 24,
    color: Colors.text,
  },
  period: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 2,
  },
  cardDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  featuresContainer: {
    marginBottom: Spacing.md,
  },
  cardButton: {
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardButtonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  cardButtonText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 14,
    color: Colors.card,
  },
  valueSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  valueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  valueText: {
    fontFamily: 'Quicksand-Medium',
    fontSize: Typography.caption.fontSize,
    color: Colors.text,
  },
  valueDivider: {
    width: 1,
    height: 16,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.md,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  restoreText: {
    fontFamily: 'Quicksand-Medium',
    fontSize: Typography.body.fontSize,
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  legalLinks: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legalText: {
    fontFamily: 'Quicksand-Regular',
    fontSize: Typography.caption.fontSize,
    color: Colors.textLight,
  },
  legalDivider: {
    fontFamily: 'Quicksand-Regular',
    fontSize: Typography.caption.fontSize,
    color: Colors.textLight,
    marginHorizontal: Spacing.sm,
  },
});
