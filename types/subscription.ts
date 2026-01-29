/**
 * Subscription Types
 */

// Plan types
export type PlanType = 'none' | 'basic' | 'full';

// Subscription status
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'grace_period' | 'none';

// Feature identifiers
export type Feature =
  | 'unlimited_alarms'
  | 'voice_recording'
  | 'script_reading'
  | 'audio_templates'
  | 'ai_voices'
  | 'unlimited_ai_generations'
  | 'priority_support';

// Subscription state
export interface SubscriptionState {
  // Current plan
  plan: PlanType;

  // Whether user has an active subscription
  isSubscribed: boolean;

  // Subscription status
  status: SubscriptionStatus;

  // Quick access for AI voice feature
  canUseAIVoice: boolean;

  // Expiration date (null if no subscription)
  expirationDate: Date | null;

  // Product ID from store
  productId: string | null;

  // Loading state
  isLoading: boolean;

  // Last sync timestamp
  lastSyncedAt: Date | null;
}

// Persisted subscription data (stored in AsyncStorage)
export interface PersistedSubscriptionData {
  plan: PlanType;
  status: SubscriptionStatus;
  expirationDate: string | null;
  productId: string | null;
  lastSyncedAt: string | null;
}

// Subscription context actions
export interface SubscriptionActions {
  // Refresh subscription status from Superwall
  refreshSubscription: () => Promise<void>;

  // Update subscription after purchase
  handlePurchase: (plan: PlanType, productId: string) => Promise<void>;

  // Handle subscription expiration
  handleExpiration: () => Promise<void>;

  // Check if a feature is available
  canUseFeature: (feature: Feature) => boolean;

  // Clear subscription (for testing/logout)
  clearSubscription: () => Promise<void>;

  // Update from Superwall status (used by RestorePurchases)
  updateFromSuperwall: (status: { isSubscribed: boolean; plan: PlanType }) => void;
}

// Full subscription context type
export interface SubscriptionContextType extends SubscriptionState, SubscriptionActions {}

// Initial subscription state
export const initialSubscriptionState: SubscriptionState = {
  plan: 'none',
  isSubscribed: false,
  status: 'none',
  canUseAIVoice: false,
  expirationDate: null,
  productId: null,
  isLoading: true,
  lastSyncedAt: null,
};

// Feature access by plan
export const FEATURE_ACCESS: Record<PlanType, Feature[]> = {
  none: [],
  basic: [
    'unlimited_alarms',
    'voice_recording',
    'script_reading',
    'audio_templates',
  ],
  full: [
    'unlimited_alarms',
    'voice_recording',
    'script_reading',
    'audio_templates',
    'ai_voices',
    'unlimited_ai_generations',
    'priority_support',
  ],
};
