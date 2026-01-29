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

  // Shown when user tries to use premium features without subscription
  PREMIUM_FEATURE_ATTEMPT: 'premium_feature_attempt',

  // Shown from settings or manual upgrade
  SETTINGS_UPGRADE: 'settings_upgrade',
} as const;

// Product identifiers - should match App Store Connect / Google Play Console
export const PRODUCTS = {
  PREMIUM_MONTHLY: 'com.risealarm.premium.monthly',
  PREMIUM_YEARLY: 'com.risealarm.premium.yearly',
} as const;

// Billing period type
export type BillingPeriod = 'monthly' | 'yearly';

// Pricing info for display
export const PRICING = {
  monthly: {
    price: 7.99,
    period: 'month',
    productId: PRODUCTS.PREMIUM_MONTHLY,
  },
  yearly: {
    price: 49.99,
    period: 'year',
    monthlyEquivalent: 4.17, // $49.99 / 12
    savings: 52, // percentage off vs monthly
    productId: PRODUCTS.PREMIUM_YEARLY,
  },
} as const;

// Plan types - simplified to single premium plan
export type PlanType = 'none' | 'premium';

// All features included in premium
export const PREMIUM_FEATURES = [
  'unlimited_alarms',
  'voice_recording',
  'script_reading',
  'audio_templates',
  'ai_voices',
  'unlimited_ai_generations',
  'priority_support',
] as const;

// Feature access by plan
export const PLAN_FEATURES: Record<PlanType, readonly string[]> = {
  none: [],
  premium: PREMIUM_FEATURES,
};

// Check if a feature is available for a plan
export function canAccessFeature(plan: PlanType, feature: string): boolean {
  return PLAN_FEATURES[plan].includes(feature);
}

// Get product ID for premium plan
export function getProductId(): string {
  return PRODUCTS.PREMIUM_MONTHLY;
}

// Get plan type from product ID
export function getPlanFromProduct(productId: string): PlanType {
  return productId === PRODUCTS.PREMIUM_MONTHLY ? 'premium' : 'none';
}
