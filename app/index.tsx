import { Colors } from '@/constants/theme';
import { useFirstLaunch } from '@/hooks/useFirstLaunch';
import { useSubscription } from '@/hooks/useSubscription';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useEffect } from 'react';

// ============================================
// DEV HELPER: Clear onboarding flag for testing
// Uncomment and call this function to reset onboarding state
// ============================================
// async function clearOnboardingFlag() {
//   await AsyncStorage.removeItem('hasLaunchedBefore');
//   console.log('Onboarding flag cleared - restart the app to see onboarding');
// }
// To use: call clearOnboardingFlag() in useEffect or from a dev button!!!

export default function Index() {
  // useEffect(() => {
  //   clearOnboardingFlag();
  // }, []);
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
