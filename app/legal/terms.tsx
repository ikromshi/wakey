import { router } from 'expo-router';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, Typography } from '@/constants/theme';

export default function TermsOfServiceScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={Colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lastUpdated}>Last Updated: January 2025</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Agreement to Terms</Text>
          <Text style={styles.paragraph}>
            By downloading, installing, or using RiseAlarm ("the App"), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the App.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Description of Service</Text>
          <Text style={styles.paragraph}>
            RiseAlarm is a mobile alarm clock application that allows users to create custom wake-up experiences using personal voice recordings, AI-generated voices, and audio templates.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Subscription and Payments</Text>

          <Text style={styles.subTitle}>Subscription Plans</Text>
          <Text style={styles.paragraph}>
            RiseAlarm offers a Premium subscription at $7.99/month that provides access to all features including AI voice generation.
          </Text>

          <Text style={styles.subTitle}>Billing</Text>
          <Text style={styles.paragraph}>
            • Subscriptions are billed monthly through Apple App Store or Google Play{'\n'}
            • Payment is charged to your account upon confirmation of purchase{'\n'}
            • Subscriptions automatically renew unless canceled at least 24 hours before the end of the current period
          </Text>

          <Text style={styles.subTitle}>Cancellation</Text>
          <Text style={styles.paragraph}>
            • You may cancel your subscription at any time through your device's subscription settings{'\n'}
            • Cancellation takes effect at the end of the current billing period{'\n'}
            • No refunds are provided for partial subscription periods
          </Text>

          <Text style={styles.subTitle}>Price Changes</Text>
          <Text style={styles.paragraph}>
            We reserve the right to change subscription prices. You will be notified of any price changes in advance, and changes will apply to the next billing cycle after notification.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. User Conduct</Text>
          <Text style={styles.paragraph}>
            You agree not to:{'\n'}
            • Use the App for any unlawful purpose{'\n'}
            • Create content that is offensive, harmful, or violates others' rights{'\n'}
            • Attempt to reverse engineer or modify the App{'\n'}
            • Share your account credentials with others{'\n'}
            • Use the AI voice features to impersonate others without consent{'\n'}
            • Circumvent any security measures or access restrictions
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Intellectual Property</Text>
          <Text style={styles.paragraph}>
            • The App, including its design, features, and content, is owned by RiseAlarm{'\n'}
            • Audio templates provided in the App are licensed for personal use only{'\n'}
            • You retain ownership of voice recordings you create{'\n'}
            • AI-generated content is licensed for personal use within the App
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. AI Voice Generation</Text>
          <Text style={styles.paragraph}>
            • AI voices are generated using third-party services{'\n'}
            • Generated audio is for personal, non-commercial use{'\n'}
            • You may not use AI features to create misleading or harmful content{'\n'}
            • We reserve the right to limit or suspend AI features for misuse
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Disclaimer of Warranties</Text>
          <Text style={styles.paragraph}>
            THE APP IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT GUARANTEE THAT:{'\n'}
            • The App will always be available or error-free{'\n'}
            • Alarms will always trigger at the exact scheduled time{'\n'}
            • AI-generated content will meet your expectations{'\n'}{'\n'}
            Use of the App as your sole alarm system is at your own risk.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, RISEALARM SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES, INCLUDING BUT NOT LIMITED TO DAMAGES FOR MISSED ALARMS, LOST DATA, OR LOST PROFITS.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Account Termination</Text>
          <Text style={styles.paragraph}>
            • You may delete your account at any time through the App{'\n'}
            • We may suspend or terminate accounts that violate these terms{'\n'}
            • Upon termination, your right to use the App ends immediately{'\n'}
            • Data deletion follows our Privacy Policy
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Changes to Terms</Text>
          <Text style={styles.paragraph}>
            We may modify these Terms at any time. Continued use of the App after changes constitutes acceptance of the new terms. Material changes will be communicated through the App.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. Governing Law</Text>
          <Text style={styles.paragraph}>
            These Terms are governed by the laws of the United States. Any disputes shall be resolved in the courts of [Your Jurisdiction].
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>12. Contact</Text>
          <Text style={styles.paragraph}>
            For questions about these Terms, contact us at:{'\n'}{'\n'}
            Email: legal@risealarm.app
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
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: Typography.heading.fontSize,
    color: Colors.text,
  },
  headerSpacer: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  lastUpdated: {
    fontFamily: 'Quicksand-Regular',
    fontSize: Typography.caption.fontSize,
    color: Colors.textLight,
    marginBottom: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontFamily: 'Quicksand-Bold',
    fontSize: Typography.body.fontSize,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  subTitle: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: Typography.body.fontSize,
    color: Colors.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  paragraph: {
    fontFamily: 'Quicksand-Regular',
    fontSize: Typography.body.fontSize,
    color: Colors.text,
    lineHeight: 24,
  },
});
