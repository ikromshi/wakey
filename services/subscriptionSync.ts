/**
 * Subscription Sync Service
 *
 * Syncs local subscription state with Supabase database.
 * Handles fetching and updating subscription data for authenticated users.
 */

import { supabase, isSupabaseConfigured, getCurrentUser } from './supabase';
import type { Subscription, SubscriptionUpdate } from '@/types/database';
import type { PlanType } from '@/types/subscription';

/**
 * Fetch user's subscription from database
 */
export async function fetchUserSubscription(): Promise<Subscription | null> {
  if (!isSupabaseConfigured()) {
    console.log('[SubscriptionSync] Supabase not configured, skipping fetch');
    return null;
  }

  const user = await getCurrentUser();
  if (!user) {
    console.log('[SubscriptionSync] No authenticated user');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      // PGRST116 = no rows found, which is ok for new users
      if (error.code !== 'PGRST116') {
        console.error('[SubscriptionSync] Error fetching subscription:', error.message);
      }
      return null;
    }

    return data;
  } catch (error) {
    console.error('[SubscriptionSync] Failed to fetch subscription:', error);
    return null;
  }
}

/**
 * Update user's subscription in database
 */
export async function updateUserSubscription(
  updates: SubscriptionUpdate
): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    console.log('[SubscriptionSync] Supabase not configured, skipping update');
    return false;
  }

  const user = await getCurrentUser();
  if (!user) {
    console.log('[SubscriptionSync] No authenticated user');
    return false;
  }

  try {
    const { error } = await supabase
      .from('subscriptions')
      .update(updates)
      .eq('user_id', user.id);

    if (error) {
      console.error('[SubscriptionSync] Error updating subscription:', error.message);
      return false;
    }

    console.log('[SubscriptionSync] Subscription updated successfully');
    return true;
  } catch (error) {
    console.error('[SubscriptionSync] Failed to update subscription:', error);
    return false;
  }
}

/**
 * Sync local subscription state to database
 * Called after purchase/restore through Superwall
 */
export async function syncSubscriptionToDatabase(
  plan: PlanType,
  provider: 'apple' | 'google' | null = null,
  providerSubscriptionId: string | null = null
): Promise<boolean> {
  const updates: SubscriptionUpdate = {
    plan,
    status: plan === 'none' ? 'expired' : 'active',
    provider,
    provider_subscription_id: providerSubscriptionId,
    current_period_start: plan !== 'none' ? new Date().toISOString() : null,
  };

  return updateUserSubscription(updates);
}

/**
 * Mark subscription as canceled (will expire at period end)
 */
export async function markSubscriptionCanceled(): Promise<boolean> {
  return updateUserSubscription({
    cancel_at_period_end: true,
  });
}

/**
 * Mark subscription as expired
 */
export async function markSubscriptionExpired(): Promise<boolean> {
  return updateUserSubscription({
    plan: 'none',
    status: 'expired',
    cancel_at_period_end: false,
  });
}

/**
 * Convert database subscription to local plan type
 */
export function subscriptionToPlanType(subscription: Subscription | null): PlanType {
  if (!subscription) return 'none';

  // Check if subscription is active
  if (subscription.status !== 'active' && subscription.status !== 'trial') {
    return 'none';
  }

  // Check if past expiration date
  if (subscription.current_period_end) {
    const endDate = new Date(subscription.current_period_end);
    if (endDate < new Date()) {
      return 'none';
    }
  }

  return subscription.plan;
}

/**
 * Listen for subscription changes from Superwall and sync to database
 */
export function createSubscriptionSyncListener() {
  return async (status: { isSubscribed: boolean; plan: PlanType }) => {
    console.log('[SubscriptionSync] Syncing subscription change:', status);
    await syncSubscriptionToDatabase(
      status.plan,
      null, // Provider will be determined by Superwall webhook
      null
    );
  };
}
