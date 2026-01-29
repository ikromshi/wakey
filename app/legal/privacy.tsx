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
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={Colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lastUpdated}>Last Updated: January 2025</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Introduction</Text>
          <Text style={styles.paragraph}>
            RiseAlarm ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information We Collect</Text>

          <Text style={styles.subTitle}>Personal Information</Text>
          <Text style={styles.paragraph}>
            When you create an account, we may collect:{'\n'}
            • Email address{'\n'}
            • Name (optional){'\n'}
            • Profile information you choose to provide
          </Text>

          <Text style={styles.subTitle}>Usage Data</Text>
          <Text style={styles.paragraph}>
            We automatically collect:{'\n'}
            • Device information (model, OS version){'\n'}
            • App usage statistics{'\n'}
            • Alarm settings and preferences{'\n'}
            • Crash reports and performance data
          </Text>

          <Text style={styles.subTitle}>Audio Data</Text>
          <Text style={styles.paragraph}>
            • Voice recordings you create are stored locally on your device{'\n'}
            • AI-generated audio is processed through third-party services{'\n'}
            • We do not store your voice recordings on our servers
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How We Use Your Information</Text>
          <Text style={styles.paragraph}>
            We use collected information to:{'\n'}
            • Provide and maintain our service{'\n'}
            • Process your subscription payments{'\n'}
            • Send important notifications about your account{'\n'}
            • Improve and personalize your experience{'\n'}
            • Respond to your support requests{'\n'}
            • Comply with legal obligations
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Third-Party Services</Text>
          <Text style={styles.paragraph}>
            We use the following third-party services:{'\n'}
            • Apple App Store / Google Play for payments{'\n'}
            • ElevenLabs for AI voice generation{'\n'}
            • Supabase for authentication and data storage{'\n'}
            • Superwall for subscription management{'\n'}{'\n'}
            Each service has its own privacy policy governing the use of your information.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Storage and Security</Text>
          <Text style={styles.paragraph}>
            • Your data is encrypted in transit and at rest{'\n'}
            • Audio recordings are stored locally on your device{'\n'}
            • Account data is stored securely in our cloud infrastructure{'\n'}
            • We implement industry-standard security measures
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Rights</Text>
          <Text style={styles.paragraph}>
            You have the right to:{'\n'}
            • Access your personal data{'\n'}
            • Correct inaccurate data{'\n'}
            • Delete your account and data{'\n'}
            • Export your data{'\n'}
            • Opt-out of marketing communications{'\n'}{'\n'}
            To exercise these rights, contact us at privacy@risealarm.app
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Children's Privacy</Text>
          <Text style={styles.paragraph}>
            Our service is not directed to children under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us immediately.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Changes to This Policy</Text>
          <Text style={styles.paragraph}>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy in the app and updating the "Last Updated" date.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have questions about this Privacy Policy, please contact us at:{'\n'}{'\n'}
            Email: privacy@risealarm.app
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
