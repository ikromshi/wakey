import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_COMPLETE_KEY = '@rise_alarm/onboarding_complete';

interface FirstLaunchState {
  isFirstLaunch: boolean | null; // null = loading
  isLoading: boolean;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>; // For testing
}

export function useFirstLaunch(): FirstLaunchState {
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  const checkFirstLaunch = async () => {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
      // If value is null, it's the first launch (onboarding not completed)
      setIsFirstLaunch(value === null);
    } catch (error) {
      console.error('Error checking first launch:', error);
      // Default to not first launch on error to avoid blocking
      setIsFirstLaunch(false);
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
      setIsFirstLaunch(false);
      console.log('Onboarding marked as complete');
    } catch (error) {
      console.error('Error marking onboarding complete:', error);
    }
  };

  const resetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem(ONBOARDING_COMPLETE_KEY);
      setIsFirstLaunch(true);
      console.log('Onboarding reset for testing');
    } catch (error) {
      console.error('Error resetting onboarding:', error);
    }
  };

  return {
    isFirstLaunch,
    isLoading,
    completeOnboarding,
    resetOnboarding,
  };
}

// Standalone functions for use outside of React components
export async function isOnboardingComplete(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
    return value !== null;
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return true; // Default to complete on error
  }
}

export async function markOnboardingComplete(): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
  } catch (error) {
    console.error('Error marking onboarding complete:', error);
  }
}
