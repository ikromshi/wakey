/**
 * Superwall Configuration
 *
 * Placement IDs and product identifiers for paywall management.
 * These IDs should match what's configured in the Superwall dashboard.
 */

// Placement IDs - triggers for showing paywalls
export const PLACEMENTS = {
  // Shown after completing onboarding
  ONBOARDING_COMPLETE: 'onboarding_complete',

  // Shown when user tries to use AI Voice without Full plan
  AI_VOICE_ATTEMPT: 'ai_voice_attempt',

  // Shown from settings or manual upgrade
  SETTINGS_UPGRADE: 'settings_upgrade',

  // Shown when trying to access premium templates (future)
  PREMIUM_TEMPLATE: 'premium_template',
} as const;

// Product identifiers - should match App Store Connect / Google Play Console
export const PRODUCTS = {
  BASIC_MONTHLY: 'com.risealarm.basic.monthly',
  FULL_MONTHLY: 'com.risealarm.full.monthly',
} as const;

// Plan types
export type PlanType = 'none' | 'basic' | 'full';

// Feature access by plan
export const PLAN_FEATURES: Record<PlanType, string[]> = {
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

// Check if a feature is available for a plan
export function canAccessFeature(plan: PlanType, feature: string): boolean {
  return PLAN_FEATURES[plan].includes(feature);
}

// Get product ID from plan type
export function getProductId(plan: Exclude<PlanType, 'none'>): string {
  switch (plan) {
    case 'basic':
      return PRODUCTS.BASIC_MONTHLY;
    case 'full':
      return PRODUCTS.FULL_MONTHLY;
    default:
      return PRODUCTS.BASIC_MONTHLY;
  }
}

// Get plan type from product ID
export function getPlanFromProduct(productId: string): PlanType {
  switch (productId) {
    case PRODUCTS.BASIC_MONTHLY:
      return 'basic';
    case PRODUCTS.FULL_MONTHLY:
      return 'full';
    default:
      return 'none';
  }
}
