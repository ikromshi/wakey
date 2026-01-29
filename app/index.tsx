import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';

import { Colors } from '@/constants/theme';
import { useFirstLaunch } from '@/hooks/useFirstLaunch';
import { useSubscription } from '@/hooks/useSubscription';

export default function Index() {
  const { isFirstLaunch, isLoading: isFirstLaunchLoading } = useFirstLaunch();
  const { isSubscribed, isLoading: isSubscriptionLoading } = useSubscription();

  // Show loading while checking status
  if (isFirstLaunchLoading || isSubscriptionLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // First launch - show onboarding (which leads to paywall)
  if (isFirstLaunch) {
    return <Redirect href="/onboarding" />;
  }

  // Not subscribed - show paywall (hard paywall)
  if (!isSubscribed) {
    return <Redirect href="/paywall" />;
  }

  // Subscribed - go to main app
  return <Redirect href="/(tabs)" />;
}
