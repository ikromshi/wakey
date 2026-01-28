import React, { createContext, useContext, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WAKE_UP_STYLE_KEY = '@rise_alarm/wake_up_style';

// Wake-up style preferences from onboarding
export type WakeUpStyle = 'gentle' | 'motivated' | 'mindful' | 'playful' | null;

// Onboarding screens in order
export const ONBOARDING_SCREENS = [
  'welcome',
  'features',
  'voices',
  'styles',
  'complete',
] as const;

export type OnboardingScreen = typeof ONBOARDING_SCREENS[number];

interface OnboardingContextValue {
  // Current progress
  currentScreenIndex: number;
  currentScreen: OnboardingScreen;
  totalScreens: number;

  // Navigation
  goToNext: () => void;
  goToPrevious: () => void;
  goToScreen: (index: number) => void;

  // Progress helpers
  isFirstScreen: boolean;
  isLastScreen: boolean;
  progress: number; // 0 to 1

  // User preferences collected during onboarding
  wakeUpStyle: WakeUpStyle;
  setWakeUpStyle: (style: WakeUpStyle) => void;

  // Persistence
  savePreferences: () => Promise<void>;
  loadPreferences: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
  const [wakeUpStyle, setWakeUpStyleState] = useState<WakeUpStyle>(null);

  const totalScreens = ONBOARDING_SCREENS.length;
  const currentScreen = ONBOARDING_SCREENS[currentScreenIndex];
  const isFirstScreen = currentScreenIndex === 0;
  const isLastScreen = currentScreenIndex === totalScreens - 1;
  const progress = (currentScreenIndex + 1) / totalScreens;

  const goToNext = useCallback(() => {
    if (currentScreenIndex < totalScreens - 1) {
      setCurrentScreenIndex(prev => prev + 1);
    }
  }, [currentScreenIndex, totalScreens]);

  const goToPrevious = useCallback(() => {
    if (currentScreenIndex > 0) {
      setCurrentScreenIndex(prev => prev - 1);
    }
  }, [currentScreenIndex]);

  const goToScreen = useCallback((index: number) => {
    if (index >= 0 && index < totalScreens) {
      setCurrentScreenIndex(index);
    }
  }, [totalScreens]);

  const setWakeUpStyle = useCallback((style: WakeUpStyle) => {
    setWakeUpStyleState(style);
  }, []);

  const savePreferences = useCallback(async () => {
    try {
      if (wakeUpStyle) {
        await AsyncStorage.setItem(WAKE_UP_STYLE_KEY, wakeUpStyle);
        console.log('Wake-up style saved:', wakeUpStyle);
      }
    } catch (error) {
      console.error('Error saving onboarding preferences:', error);
    }
  }, [wakeUpStyle]);

  const loadPreferences = useCallback(async () => {
    try {
      const savedStyle = await AsyncStorage.getItem(WAKE_UP_STYLE_KEY);
      if (savedStyle) {
        setWakeUpStyleState(savedStyle as WakeUpStyle);
      }
    } catch (error) {
      console.error('Error loading onboarding preferences:', error);
    }
  }, []);

  const value: OnboardingContextValue = {
    currentScreenIndex,
    currentScreen,
    totalScreens,
    goToNext,
    goToPrevious,
    goToScreen,
    isFirstScreen,
    isLastScreen,
    progress,
    wakeUpStyle,
    setWakeUpStyle,
    savePreferences,
    loadPreferences,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding(): OnboardingContextValue {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
