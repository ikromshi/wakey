import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/context/SubscriptionContext';

interface MenuItemProps {
  icon: string;
  label: string;
  sublabel?: string;
  onPress: () => void;
  danger?: boolean;
  showChevron?: boolean;
}

function MenuItem({ icon, label, sublabel, onPress, danger = false, showChevron = true }: MenuItemProps) {
  return (
    <Pressable
      style={styles.menuItem}
      onPress={onPress}
    >
      <View style={[styles.menuIconContainer, danger && styles.menuIconDanger]}>
        <IconSymbol
          name={icon as any}
          size={20}
          color={danger ? Colors.error : Colors.primary}
        />
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
        {sublabel && <Text style={styles.menuSublabel}>{sublabel}</Text>}
      </View>
      {showChevron && (
        <IconSymbol name="chevron.right" size={16} color={Colors.textLight} />
      )}
    </Pressable>
  );
}

export default function AccountScreen() {
  const { user, signOut, isConfigured: isAuthConfigured } = useAuth();
  const { isSubscribed, plan, clearSubscription } = useSubscription();
  const [isLoading, setIsLoading] = useState(false);

  const handleManageSubscription = () => {
    // On iOS, this opens the subscription management page
    // On Android, opens Google Play subscriptions
    Alert.alert(
      'Manage Subscription',
      'You will be redirected to manage your subscription in your device settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            // iOS subscription management URL
            Linking.openURL('https://apps.apple.com/account/subscriptions');
          },
        },
      ]
    );
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription',
      'To cancel your subscription, you need to manage it through your App Store settings. Your access will continue until the end of your current billing period.',
      [
        { text: 'Not Now', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: () => {
            Linking.openURL('https://apps.apple.com/account/subscriptions');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone. Your subscription will also be canceled.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            Alert.alert(
              'Confirm Deletion',
              'Type DELETE to confirm account deletion.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'I Understand, Delete',
                  style: 'destructive',
                  onPress: async () => {
                    setIsLoading(true);
                    try {
                      // Clear local subscription data
                      await clearSubscription();
                      // Sign out if authenticated
                      if (user) {
                        await signOut();
                      }
                      // Navigate to paywall
                      router.replace('/paywall');
                    } catch (error) {
                      console.error('Delete account error:', error);
                      Alert.alert('Error', 'Failed to delete account. Please try again.');
                    } finally {
                      setIsLoading(false);
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          onPress: async () => {
            try {
              await signOut();
              await clearSubscription();
              router.replace('/paywall');
            } catch (error) {
              console.error('Sign out error:', error);
            }
          },
        },
      ]
    );
  };

  const handleSignIn = () => {
    router.push('/auth/sign-in');
  };

  const handleTerms = () => {
    router.push('/legal/terms');
  };

  const handlePrivacy = () => {
    router.push('/legal/privacy');
  };

  const handleSupport = () => {
    Linking.openURL('mailto:support@risealarm.app?subject=RiseAlarm Support');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Account</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View style={styles.section}>
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <IconSymbol name="person.fill" size={32} color={Colors.primary} />
            </View>
            <View style={styles.profileInfo}>
              {user ? (
                <>
                  <Text style={styles.profileName}>
                    {user.user_metadata?.full_name || 'RiseAlarm User'}
                  </Text>
                  <Text style={styles.profileEmail}>{user.email}</Text>
                </>
              ) : (
                <>
                  <Text style={styles.profileName}>RiseAlarm User</Text>
                  <Text style={styles.profileEmail}>Not signed in</Text>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Subscription Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription</Text>
          <View style={styles.subscriptionCard}>
            <View style={styles.subscriptionHeader}>
              <View style={styles.subscriptionBadge}>
                <IconSymbol name="star.fill" size={16} color={Colors.primary} />
                <Text style={styles.subscriptionPlan}>
                  {isSubscribed ? 'Premium' : 'No Plan'}
                </Text>
              </View>
              {isSubscribed && (
                <Text style={styles.subscriptionPrice}>$7.99/month</Text>
              )}
            </View>
            {isSubscribed ? (
              <Text style={styles.subscriptionStatus}>
                Your subscription renews automatically each month.
              </Text>
            ) : (
              <Text style={styles.subscriptionStatus}>
                Subscribe to access all features.
              </Text>
            )}
          </View>

          {isSubscribed && (
            <>
              <MenuItem
                icon="creditcard.fill"
                label="Manage Subscription"
                sublabel="View billing and payment details"
                onPress={handleManageSubscription}
              />
              <MenuItem
                icon="xmark.circle.fill"
                label="Cancel Subscription"
                sublabel="Cancel auto-renewal"
                onPress={handleCancelSubscription}
              />
            </>
          )}
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          {user ? (
            <MenuItem
              icon="rectangle.portrait.and.arrow.right"
              label="Sign Out"
              onPress={handleSignOut}
            />
          ) : (
            <MenuItem
              icon="person.badge.plus"
              label="Sign In"
              sublabel="Sync your data across devices"
              onPress={handleSignIn}
            />
          )}
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <MenuItem
            icon="envelope.fill"
            label="Contact Support"
            sublabel="Get help with your account"
            onPress={handleSupport}
          />
          <MenuItem
            icon="doc.text.fill"
            label="Terms of Service"
            onPress={handleTerms}
          />
          <MenuItem
            icon="lock.shield.fill"
            label="Privacy Policy"
            onPress={handlePrivacy}
          />
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.dangerTitle]}>Danger Zone</Text>
          <MenuItem
            icon="trash.fill"
            label="Delete Account"
            sublabel="Permanently delete your account and data"
            onPress={handleDeleteAccount}
            danger
          />
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>RiseAlarm v1.0.0</Text>
          <Text style={styles.appCopyright}>Made with care for better mornings</Text>
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  title: {
    fontFamily: 'Quicksand-Bold',
    fontSize: Typography.title.fontSize,
    color: Colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: Typography.caption.fontSize,
    color: Colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  dangerTitle: {
    color: Colors.error,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.card,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  profileName: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: Typography.body.fontSize,
    color: Colors.text,
  },
  profileEmail: {
    fontFamily: 'Quicksand-Regular',
    fontSize: Typography.caption.fontSize,
    color: Colors.textLight,
    marginTop: 2,
  },
  subscriptionCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
    ...Shadows.card,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  subscriptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  subscriptionPlan: {
    fontFamily: 'Quicksand-Bold',
    fontSize: Typography.body.fontSize,
    color: Colors.primary,
  },
  subscriptionPrice: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: Typography.body.fontSize,
    color: Colors.text,
  },
  subscriptionStatus: {
    fontFamily: 'Quicksand-Regular',
    fontSize: Typography.caption.fontSize,
    color: Colors.textLight,
    lineHeight: 18,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.card,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIconDanger: {
    backgroundColor: Colors.error + '15',
  },
  menuContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  menuLabel: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: Typography.body.fontSize,
    color: Colors.text,
  },
  menuLabelDanger: {
    color: Colors.error,
  },
  menuSublabel: {
    fontFamily: 'Quicksand-Regular',
    fontSize: Typography.caption.fontSize,
    color: Colors.textLight,
    marginTop: 2,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  appVersion: {
    fontFamily: 'Quicksand-Medium',
    fontSize: Typography.caption.fontSize,
    color: Colors.textLight,
  },
  appCopyright: {
    fontFamily: 'Quicksand-Regular',
    fontSize: Typography.caption.fontSize,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
});
