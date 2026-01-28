import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';

import { Colors } from '@/constants/theme';
import { useFirstLaunch } from '@/hooks/useFirstLaunch';

export default function Index() {
  const { isFirstLaunch, isLoading } = useFirstLaunch();

  // Show loading while checking first launch status
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Redirect based on first launch status
  if (isFirstLaunch) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}
