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
import { PLACEMENTS } from '@/config/superwall';
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

        {/* Premium Plan Card */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.planCard}>
          <View style={styles.planHeader}>
            <Text style={styles.planName}>Premium</Text>
            <View style={styles.priceRow}>
              <Text style={styles.price}>$7.99</Text>
              <Text style={styles.period}>/month</Text>
            </View>
            <Text style={styles.billingNote}>Billed monthly. Cancel anytime.</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.featuresSection}>
            <Text style={styles.featuresTitle}>Everything included:</Text>
            <FeatureList features={PREMIUM_FEATURES} />
          </View>
        </Animated.View>

        {/* Subscribe Button */}
        <Animated.View entering={FadeInDown.delay(300)}>
          <AnimatedPressable
            style={[styles.subscribeButton, buttonAnimatedStyle]}
            onPress={handleSubscribe}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={isLoading}
          >
            <Text style={styles.subscribeButtonText}>
              {isLoading ? 'Processing...' : 'Subscribe Now'}
            </Text>
          </AnimatedPressable>
        </Animated.View>

        {/* Trust Badges */}
        <Animated.View entering={FadeInDown.delay(400)} style={styles.trustSection}>
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
  planCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.primary,
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  planName: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 20,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 36,
    color: Colors.text,
  },
  period: {
    fontFamily: 'Quicksand-Regular',
    fontSize: Typography.body.fontSize,
    color: Colors.textLight,
    marginLeft: 4,
  },
  billingNote: {
    fontFamily: 'Quicksand-Regular',
    fontSize: Typography.caption.fontSize,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  featuresSection: {
    gap: Spacing.sm,
  },
  featuresTitle: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: Typography.body.fontSize,
    color: Colors.text,
    marginBottom: Spacing.xs,
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
