import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FeatureList, RestorePurchases, type Feature } from '@/components/paywall';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { PLACEMENTS, PRICING, type BillingPeriod } from '@/config/superwall';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/theme';
import { useSubscription } from '@/hooks/useSubscription';
import {
  isSuperwallLinked,
  registerPlacement,
  type RestoreResult,
} from '@/services/superwall';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Number of taps required to activate admin mode
const ADMIN_TAP_COUNT = 4;
const ADMIN_TAP_TIMEOUT = 3000; // Reset tap count after 3 seconds

// All features included in premium plan
const PREMIUM_FEATURES: Feature[] = [
  { text: 'Unlimited alarms', included: true },
  { text: 'Voice recording', included: true },
  { text: 'Script reading with prompts', included: true },
  { text: 'Audio templates library', included: true },
  { text: 'AI-generated voices', included: true, highlight: true },
  { text: 'Unlimited AI generations', included: true },
  { text: 'Priority support', included: true },
];

export default function PaywallScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<BillingPeriod>('yearly');
  const { updateFromSuperwall } = useSubscription();
  const scale = useSharedValue(1);

  // Admin bypass state
  const tapCountRef = useRef(0);
  const lastTapTimeRef = useRef(0);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  // Secret admin bypass - tap the icon 7 times within 3 seconds
  const handleIconTap = () => {
    const now = Date.now();

    // Reset tap count if too much time has passed
    if (now - lastTapTimeRef.current > ADMIN_TAP_TIMEOUT) {
      tapCountRef.current = 0;
    }

    lastTapTimeRef.current = now;
    tapCountRef.current += 1;

    if (tapCountRef.current >= ADMIN_TAP_COUNT) {
      tapCountRef.current = 0;
      activateAdminMode();
    }
  };

  const activateAdminMode = () => {
    Alert.alert(
      'Admin Mode',
      'Activate admin/review mode? This grants full access without payment.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Activate',
          onPress: () => {
            // Grant premium access
            updateFromSuperwall({ isSubscribed: true, plan: 'premium' });
            router.replace('/(tabs)');
          },
        },
      ]
    );
  };

  // Handle restore completion - navigate to app if restored
  const handleRestoreComplete = (result: RestoreResult) => {
    if (result.restored) {
      router.replace('/(tabs)');
    }
  };

  const handleSubscribe = async () => {
    setIsLoading(true);

    try {
      if (isSuperwallLinked()) {
        // Use Superwall to handle the purchase
        await registerPlacement(PLACEMENTS.ONBOARDING_COMPLETE);
        // Superwall will handle navigation after successful purchase
      } else {
        // Mock purchase flow for development/Expo Go
        await new Promise((resolve) => setTimeout(resolve, 1500));
        Alert.alert(
          'Development Mode',
          'In production, this would start your Premium subscription via the App Store.',
          [
            {
              text: 'Continue to App',
              onPress: () => {
                // Mock successful subscription
                updateFromSuperwall({ isSubscribed: true, plan: 'premium' });
                router.replace('/(tabs)');
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Subscription error:', error);
      Alert.alert('Error', 'Failed to process subscription. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTerms = () => {
    router.push('/legal/terms');
  };

  const handlePrivacy = () => {
    router.push('/legal/privacy');
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
          {/* Tappable icon for admin bypass - tap 7 times */}
          <Pressable onPress={handleIconTap} style={styles.iconContainer}>
            <IconSymbol name="star.fill" size={36} color={Colors.primary} />
          </Pressable>
          <Text style={styles.title}>Unlock RiseAlarm</Text>
          <Text style={styles.subtitle}>
            Get full access to all features and wake up inspired every day
          </Text>
        </Animated.View>

        {/* Plan Selection */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.planSelection}>
          {/* Yearly Plan Option */}
          <Pressable
            style={[
              styles.planOption,
              selectedPlan === 'yearly' && styles.planOptionSelected,
            ]}
            onPress={() => setSelectedPlan('yearly')}
          >
            <View style={styles.planOptionHeader}>
              <View style={styles.planOptionLeft}>
                <View style={[
                  styles.radioButton,
                  selectedPlan === 'yearly' && styles.radioButtonSelected,
                ]}>
                  {selectedPlan === 'yearly' && <View style={styles.radioButtonInner} />}
                </View>
                <View>
                  <Text style={styles.planOptionName}>Yearly</Text>
                  <Text style={styles.planOptionEquivalent}>
                    ${PRICING.yearly.monthlyEquivalent.toFixed(2)}/month
                  </Text>
                </View>
              </View>
              <View style={styles.planOptionRight}>
                <Text style={styles.planOptionPrice}>${PRICING.yearly.price}</Text>
                <Text style={styles.planOptionPeriod}>/{PRICING.yearly.period}</Text>
              </View>
            </View>
            <View style={styles.savingsBadge}>
              <Text style={styles.savingsBadgeText}>SAVE {PRICING.yearly.savings}%</Text>
            </View>
          </Pressable>

          {/* Monthly Plan Option */}
          <Pressable
            style={[
              styles.planOption,
              selectedPlan === 'monthly' && styles.planOptionSelected,
            ]}
            onPress={() => setSelectedPlan('monthly')}
          >
            <View style={styles.planOptionHeader}>
              <View style={styles.planOptionLeft}>
                <View style={[
                  styles.radioButton,
                  selectedPlan === 'monthly' && styles.radioButtonSelected,
                ]}>
                  {selectedPlan === 'monthly' && <View style={styles.radioButtonInner} />}
                </View>
                <View>
                  <Text style={styles.planOptionName}>Monthly</Text>
                </View>
              </View>
              <View style={styles.planOptionRight}>
                <Text style={styles.planOptionPrice}>${PRICING.monthly.price}</Text>
                <Text style={styles.planOptionPeriod}>/{PRICING.monthly.period}</Text>
              </View>
            </View>
          </Pressable>
        </Animated.View>

        {/* Features Card */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>Everything included:</Text>
          <FeatureList features={PREMIUM_FEATURES} />
        </Animated.View>

        {/* Subscribe Button */}
        <Animated.View entering={FadeInDown.delay(400)}>
          <AnimatedPressable
            style={[styles.subscribeButton, buttonAnimatedStyle]}
            onPress={handleSubscribe}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={isLoading}
          >
            <Text style={styles.subscribeButtonText}>
              {isLoading
                ? 'Processing...'
                : `Subscribe for $${selectedPlan === 'yearly' ? PRICING.yearly.price : PRICING.monthly.price}/${selectedPlan === 'yearly' ? 'year' : 'month'}`}
            </Text>
          </AnimatedPressable>
        </Animated.View>

        {/* Trust Badges */}
        <Animated.View entering={FadeInDown.delay(500)} style={styles.trustSection}>
          <View style={styles.trustItem}>
            <IconSymbol name="lock.fill" size={16} color={Colors.success} />
            <Text style={styles.trustText}>Secure payment</Text>
          </View>
          <View style={styles.trustDivider} />
          <View style={styles.trustItem}>
            <IconSymbol name="arrow.counterclockwise" size={16} color={Colors.success} />
            <Text style={styles.trustText}>Cancel anytime</Text>
          </View>
          <View style={styles.trustDivider} />
          <View style={styles.trustItem}>
            <IconSymbol name="shield.fill" size={16} color={Colors.success} />
            <Text style={styles.trustText}>Auto-renews</Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <RestorePurchases
          onRestoreComplete={handleRestoreComplete}
          linkStyle
          color={Colors.primary}
        />

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
    paddingBottom: Spacing.lg,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 28,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontFamily: 'Quicksand-Regular',
    fontSize: Typography.body.fontSize,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing.md,
  },
  planSelection: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  planOption: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  planOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '08',
  },
  planOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  planOptionRight: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: Colors.primary,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  planOptionName: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: Typography.body.fontSize,
    color: Colors.text,
  },
  planOptionEquivalent: {
    fontFamily: 'Quicksand-Regular',
    fontSize: Typography.caption.fontSize,
    color: Colors.textLight,
    marginTop: 2,
  },
  planOptionPrice: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 20,
    color: Colors.text,
  },
  planOptionPeriod: {
    fontFamily: 'Quicksand-Regular',
    fontSize: Typography.caption.fontSize,
    color: Colors.textLight,
  },
  savingsBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: Spacing.sm,
  },
  savingsBadgeText: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 11,
    color: Colors.card,
    letterSpacing: 0.5,
  },
  featuresCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  featuresTitle: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: Typography.body.fontSize,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  subscribeButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.button,
  },
  subscribeButtonText: {
    fontFamily: 'Quicksand-Bold',
    fontSize: Typography.body.fontSize,
    color: Colors.card,
  },
  trustSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trustText: {
    fontFamily: 'Quicksand-Medium',
    fontSize: Typography.caption.fontSize,
    color: Colors.text,
  },
  trustDivider: {
    width: 1,
    height: 14,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.sm,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
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
