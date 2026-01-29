/**
 * Superwall Service
 *
 * Handles paywall initialization, presentation, and subscription management.
 * Note: Superwall requires native modules and won't work in Expo Go.
 * You need to use a development build or run `expo prebuild`.
 */

import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { PLACEMENTS, type PlanType } from '@/config/superwall';

// Dynamically import Superwall to handle cases where native module isn't linked
let Superwall: any = null;
let SubscriptionStatus: any = null;
let SuperwallDelegate: any = null;

// Track if Superwall is available
let isSuperwallAvailable = false;

// Try to import Superwall - will fail in Expo Go
try {
  const superwallModule = require('@superwall/react-native-superwall');
  Superwall = superwallModule.default;
  SubscriptionStatus = superwallModule.SubscriptionStatus;
  SuperwallDelegate = superwallModule.SuperwallDelegate;
  isSuperwallAvailable = true;
} catch (error) {
  console.warn('Superwall not available - native module not linked. This is expected in Expo Go.');
  isSuperwallAvailable = false;
}

// Get API keys from environment
const SUPERWALL_API_KEY_IOS = Constants.expoConfig?.extra?.superwallApiKeyIos || '';
const SUPERWALL_API_KEY_ANDROID = Constants.expoConfig?.extra?.superwallApiKeyAndroid || '';

// Subscription status listener type
type SubscriptionStatusListener = (status: {
  isSubscribed: boolean;
  plan: PlanType;
}) => void;

// Store for subscription listeners
const subscriptionListeners: Set<SubscriptionStatusListener> = new Set();

// Custom delegate to handle Superwall events (created dynamically if Superwall is available)
let delegate: any = null;

function createDelegate() {
  if (!isSuperwallAvailable || !SuperwallDelegate) return null;

  class RiseAlarmSuperwallDelegate extends SuperwallDelegate {
    subscriptionStatusDidChange(from: any, to: any): void {
      console.log('Subscription status changed:', { from, to });
      const isSubscribed = to?.status === 'ACTIVE';
      notifySubscriptionListeners({
        isSubscribed,
        plan: isSubscribed ? 'full' : 'none',
      });
    }

    willRedeemLink(): void {
      console.log('Will redeem link');
    }

    didRedeemLink(result: any): void {
      console.log('Did redeem link:', result);
    }

    handleSuperwallEvent(eventInfo: any): void {
      console.log('Superwall event:', eventInfo.event?.type);
    }

    handleCustomPaywallAction(name: string): void {
      console.log('Custom paywall action:', name);
    }

    willDismissPaywall(paywallInfo: any): void {
      console.log('Will dismiss paywall:', paywallInfo.identifier);
    }

    willPresentPaywall(paywallInfo: any): void {
      console.log('Will present paywall:', paywallInfo.identifier);
    }

    didDismissPaywall(paywallInfo: any): void {
      console.log('Did dismiss paywall:', paywallInfo.identifier);
    }

    didPresentPaywall(paywallInfo: any): void {
      console.log('Did present paywall:', paywallInfo.identifier);
    }

    paywallWillOpenURL(url: URL): void {
      console.log('Paywall will open URL:', url);
    }

    paywallWillOpenDeepLink(url: URL): void {
      console.log('Paywall will open deep link:', url);
    }

    handleLog(level: string, scope: string, message?: string, info?: Map<string, any>, error?: string): void {
      if (__DEV__ && (level === 'error' || level === 'warn')) {
        console.log(`[Superwall ${level}] ${scope}: ${message}`, error);
      }
    }
  }

  return new RiseAlarmSuperwallDelegate();
}

/**
 * Check if Superwall is available (native module linked)
 */
export function isSuperwallLinked(): boolean {
  return isSuperwallAvailable;
}

/**
 * Initialize Superwall SDK
 * Should be called once at app startup
 */
export async function initializeSuperwall(): Promise<void> {
  if (!isSuperwallAvailable) {
    console.warn('Superwall not available - skipping initialization');
    return;
  }

  const apiKey = Platform.OS === 'ios' ? SUPERWALL_API_KEY_IOS : SUPERWALL_API_KEY_ANDROID;

  if (!apiKey) {
    console.warn('Superwall API key not configured. Paywalls will not work.');
    return;
  }

  try {
    await Superwall.configure({
      apiKey,
      completion: () => {
        console.log('Superwall configured successfully');
      },
    });

    // Create and set the delegate for event handling
    delegate = createDelegate();
    if (delegate) {
      await Superwall.shared.setDelegate(delegate);
    }

    console.log('Superwall initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Superwall:', error);
  }
}

/**
 * Set user attributes for better targeting
 */
export async function setUserAttributes(attributes: Record<string, any>): Promise<void> {
  if (!isSuperwallAvailable) return;

  try {
    await Superwall.shared.setUserAttributes(attributes);
  } catch (error) {
    console.error('Failed to set user attributes:', error);
  }
}

/**
 * Set user ID for subscription tracking across devices
 */
export async function setUserId(userId: string): Promise<void> {
  if (!isSuperwallAvailable) return;

  try {
    await Superwall.shared.identify({ userId });
  } catch (error) {
    console.error('Failed to set user ID:', error);
  }
}

/**
 * Reset user identity (on sign out)
 */
export async function resetUserIdentity(): Promise<void> {
  if (!isSuperwallAvailable) return;

  try {
    await Superwall.shared.reset();
  } catch (error) {
    console.error('Failed to reset user identity:', error);
  }
}

/**
 * Register a placement to potentially show a paywall
 * Returns a promise that resolves when the user completes the action or dismisses
 */
export async function registerPlacement(
  placement: string,
  params?: Record<string, any>
): Promise<void> {
  if (!isSuperwallAvailable) {
    console.log(`[Mock] Would show paywall for placement: ${placement}`);
    return;
  }

  try {
    await Superwall.shared.register({
      placement,
      params,
    });
    console.log(`Placement ${placement} registered`);
  } catch (error) {
    console.error('Failed to register placement:', error);
  }
}

/**
 * Show paywall after onboarding
 */
export async function showOnboardingPaywall(): Promise<void> {
  await registerPlacement(PLACEMENTS.ONBOARDING_COMPLETE);
}

/**
 * Show paywall when attempting to use AI Voice
 * Returns a promise that resolves when paywall is dismissed
 */
export async function showAIVoicePaywall(): Promise<void> {
  await registerPlacement(PLACEMENTS.AI_VOICE_ATTEMPT);
}

/**
 * Show paywall from settings
 */
export async function showSettingsPaywall(): Promise<void> {
  await registerPlacement(PLACEMENTS.SETTINGS_UPGRADE);
}

/**
 * Check current subscription status
 */
export async function checkSubscriptionStatus(): Promise<{
  isSubscribed: boolean;
  plan: PlanType;
}> {
  if (!isSuperwallAvailable) {
    return { isSubscribed: false, plan: 'none' };
  }

  try {
    const status = await Superwall.shared.getSubscriptionStatus();
    const isSubscribed = status?.status === 'ACTIVE';

    return {
      isSubscribed,
      plan: isSubscribed ? 'full' : 'none',
    };
  } catch (error) {
    console.error('Failed to check subscription status:', error);
    return {
      isSubscribed: false,
      plan: 'none',
    };
  }
}

/**
 * Manually set subscription status (useful when using external purchase controller)
 */
export async function setSubscriptionStatus(isSubscribed: boolean, entitlements: string[] = []): Promise<void> {
  if (!isSuperwallAvailable || !SubscriptionStatus) return;

  try {
    const status = isSubscribed
      ? SubscriptionStatus.Active(entitlements)
      : SubscriptionStatus.Inactive();
    await Superwall.shared.setSubscriptionStatus(status);
  } catch (error) {
    console.error('Failed to set subscription status:', error);
  }
}

/**
 * Add subscription status listener
 */
export function addSubscriptionListener(listener: SubscriptionStatusListener): () => void {
  subscriptionListeners.add(listener);

  // Return unsubscribe function
  return () => {
    subscriptionListeners.delete(listener);
  };
}

/**
 * Notify all subscription listeners
 */
function notifySubscriptionListeners(status: {
  isSubscribed: boolean;
  plan: PlanType;
}): void {
  subscriptionListeners.forEach((listener) => {
    try {
      listener(status);
    } catch (error) {
      console.error('Error in subscription listener:', error);
    }
  });
}

/**
 * Get presentation result without showing paywall
 * Useful for checking if a paywall would be shown
 */
export async function getPresentationResult(
  placement: string,
  params?: Map<string, any>
): Promise<'paywall' | 'holdout' | 'noMatch' | 'subscribed' | 'notFound'> {
  if (!isSuperwallAvailable) {
    return 'notFound';
  }

  try {
    const result = await Superwall.shared.getPresentationResult({ placement, params });

    // Check result type
    if (result.constructor.name === 'PresentationResultPaywall') {
      return 'paywall';
    } else if (result.constructor.name === 'PresentationResultHoldout') {
      return 'holdout';
    } else if (result.constructor.name === 'PresentationResultNoAudienceMatch') {
      return 'noMatch';
    } else if (result.constructor.name === 'PresentationResultUserIsSubscribed') {
      return 'subscribed';
    } else {
      return 'notFound';
    }
  } catch (error) {
    console.error('Failed to get presentation result:', error);
    return 'notFound';
  }
}

/**
 * Dismiss any currently presented paywall
 */
export async function dismissPaywall(): Promise<void> {
  if (!isSuperwallAvailable) return;

  try {
    await Superwall.shared.dismiss();
  } catch (error) {
    console.error('Failed to dismiss paywall:', error);
  }
}

/**
 * Get user's current entitlements
 */
export async function getEntitlements(): Promise<string[]> {
  if (!isSuperwallAvailable) {
    return [];
  }

  try {
    const entitlementsInfo = await Superwall.shared.getEntitlements();
    return entitlementsInfo.active.map((e: any) => e.id);
  } catch (error) {
    console.error('Failed to get entitlements:', error);
    return [];
  }
}

/**
 * Restore purchases result type
 */
export type RestoreResult = {
  success: boolean;
  restored: boolean;
  plan: PlanType;
  error?: string;
};

/**
 * Restore previous purchases
 * Returns success/failure and the restored plan if any
 */
export async function restorePurchases(): Promise<RestoreResult> {
  if (!isSuperwallAvailable) {
    // Mock for development
    console.log('[Mock] Would restore purchases via Superwall');
    return {
      success: true,
      restored: false,
      plan: 'none',
    };
  }

  try {
    // Superwall's restore will check with the app store
    await Superwall.shared.restorePurchases();

    // Check the subscription status after restore
    const status = await checkSubscriptionStatus();

    return {
      success: true,
      restored: status.isSubscribed,
      plan: status.plan,
    };
  } catch (error) {
    console.error('Failed to restore purchases:', error);
    return {
      success: false,
      restored: false,
      plan: 'none',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Show upgrade paywall for Basic → Full plan upgrade
 */
export async function showUpgradePaywall(): Promise<void> {
  await registerPlacement(PLACEMENTS.SETTINGS_UPGRADE, { upgradeFrom: 'basic' });
}
