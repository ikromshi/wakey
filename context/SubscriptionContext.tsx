import React, { createContext, useContext, useEffect, useCallback, useReducer } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  type PlanType,
  type SubscriptionStatus,
  type Feature,
  type SubscriptionState,
  type SubscriptionContextType,
  type PersistedSubscriptionData,
  initialSubscriptionState,
  FEATURE_ACCESS,
} from '@/types/subscription';
import {
  checkSubscriptionStatus,
  addSubscriptionListener,
  isSuperwallLinked,
} from '@/services/superwall';
import {
  fetchUserSubscription,
  syncSubscriptionToDatabase,
  subscriptionToPlanType,
} from '@/services/subscriptionSync';
import { getCurrentUser } from '@/services/supabase';

// Storage key
const SUBSCRIPTION_STORAGE_KEY = '@rise_alarm/subscription';

// Grace period in milliseconds (3 days)
const GRACE_PERIOD_MS = 3 * 24 * 60 * 60 * 1000;

// Action types
type SubscriptionAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SUBSCRIPTION'; payload: Partial<SubscriptionState> }
  | { type: 'CLEAR_SUBSCRIPTION' }
  | { type: 'REFRESH_COMPLETE'; payload: SubscriptionState };

// Reducer
function subscriptionReducer(
  state: SubscriptionState,
  action: SubscriptionAction
): SubscriptionState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_SUBSCRIPTION':
      const newState = { ...state, ...action.payload };
      // Auto-compute canUseAIVoice based on plan
      newState.canUseAIVoice = newState.plan === 'full' && newState.isSubscribed;
      return newState;

    case 'CLEAR_SUBSCRIPTION':
      return {
        ...initialSubscriptionState,
        isLoading: false,
        lastSyncedAt: new Date(),
      };

    case 'REFRESH_COMPLETE':
      return action.payload;

    default:
      return state;
  }
}

// Create context
const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// Provider component
export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(subscriptionReducer, initialSubscriptionState);

  // Load persisted subscription on mount
  useEffect(() => {
    loadPersistedSubscription();
  }, []);

  // Set up Superwall listener
  useEffect(() => {
    if (!isSuperwallLinked()) return;

    const unsubscribe = addSubscriptionListener(({ isSubscribed, plan }) => {
      dispatch({
        type: 'SET_SUBSCRIPTION',
        payload: {
          plan,
          isSubscribed,
          status: isSubscribed ? 'active' : 'none',
          lastSyncedAt: new Date(),
        },
      });

      // Persist the new state
      persistSubscription({
        plan,
        status: isSubscribed ? 'active' : 'none',
        expirationDate: null,
        productId: null,
        lastSyncedAt: new Date().toISOString(),
      });
    });

    return unsubscribe;
  }, []);

  // Load subscription from AsyncStorage
  const loadPersistedSubscription = async () => {
    try {
      const data = await AsyncStorage.getItem(SUBSCRIPTION_STORAGE_KEY);

      if (data) {
        const parsed: PersistedSubscriptionData = JSON.parse(data);

        // Check if subscription has expired
        let status = parsed.status;
        let isSubscribed = status === 'active' || status === 'grace_period';

        if (parsed.expirationDate) {
          const expirationDate = new Date(parsed.expirationDate);
          const now = new Date();

          if (expirationDate < now) {
            // Check if within grace period
            const gracePeriodEnd = new Date(expirationDate.getTime() + GRACE_PERIOD_MS);

            if (now < gracePeriodEnd) {
              status = 'grace_period';
              isSubscribed = true;
            } else {
              status = 'expired';
              isSubscribed = false;
            }
          }
        }

        dispatch({
          type: 'SET_SUBSCRIPTION',
          payload: {
            plan: parsed.plan,
            status,
            isSubscribed,
            expirationDate: parsed.expirationDate ? new Date(parsed.expirationDate) : null,
            productId: parsed.productId,
            lastSyncedAt: parsed.lastSyncedAt ? new Date(parsed.lastSyncedAt) : null,
            isLoading: false,
          },
        });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }

      // Sync with Superwall after loading persisted data
      await refreshSubscription();
    } catch (error) {
      console.error('Failed to load subscription:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Persist subscription to AsyncStorage
  const persistSubscription = async (data: PersistedSubscriptionData) => {
    try {
      await AsyncStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to persist subscription:', error);
    }
  };

  // Refresh subscription from Superwall
  const refreshSubscription = useCallback(async () => {
    if (!isSuperwallLinked()) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const { isSubscribed, plan } = await checkSubscriptionStatus();

      const newState: SubscriptionState = {
        plan,
        isSubscribed,
        status: isSubscribed ? 'active' : 'none',
        canUseAIVoice: plan === 'full' && isSubscribed,
        expirationDate: null, // Superwall doesn't provide this directly
        productId: null,
        isLoading: false,
        lastSyncedAt: new Date(),
      };

      dispatch({ type: 'REFRESH_COMPLETE', payload: newState });

      // Persist the synced state
      await persistSubscription({
        plan: newState.plan,
        status: newState.status,
        expirationDate: newState.expirationDate?.toISOString() || null,
        productId: newState.productId,
        lastSyncedAt: newState.lastSyncedAt?.toISOString() || null,
      });
    } catch (error) {
      console.error('Failed to refresh subscription:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Handle purchase
  const handlePurchase = useCallback(async (plan: PlanType, productId: string) => {
    const newState: Partial<SubscriptionState> = {
      plan,
      isSubscribed: true,
      status: 'active',
      productId,
      lastSyncedAt: new Date(),
    };

    dispatch({ type: 'SET_SUBSCRIPTION', payload: newState });

    await persistSubscription({
      plan,
      status: 'active',
      expirationDate: null,
      productId,
      lastSyncedAt: new Date().toISOString(),
    });
  }, []);

  // Handle expiration
  const handleExpiration = useCallback(async () => {
    dispatch({
      type: 'SET_SUBSCRIPTION',
      payload: {
        isSubscribed: false,
        status: 'expired',
        lastSyncedAt: new Date(),
      },
    });

    await persistSubscription({
      plan: state.plan,
      status: 'expired',
      expirationDate: state.expirationDate?.toISOString() || null,
      productId: state.productId,
      lastSyncedAt: new Date().toISOString(),
    });
  }, [state.plan, state.expirationDate, state.productId]);

  // Check if feature is available
  const canUseFeature = useCallback(
    (feature: Feature): boolean => {
      if (!state.isSubscribed) return false;
      return FEATURE_ACCESS[state.plan].includes(feature);
    },
    [state.plan, state.isSubscribed]
  );

  // Clear subscription
  const clearSubscription = useCallback(async () => {
    dispatch({ type: 'CLEAR_SUBSCRIPTION' });
    await AsyncStorage.removeItem(SUBSCRIPTION_STORAGE_KEY);
  }, []);

  // Update from Superwall status (used by RestorePurchases and other components)
  const updateFromSuperwall = useCallback(
    async (status: { isSubscribed: boolean; plan: PlanType }) => {
      dispatch({
        type: 'SET_SUBSCRIPTION',
        payload: {
          plan: status.plan,
          isSubscribed: status.isSubscribed,
          status: status.isSubscribed ? 'active' : 'none',
          lastSyncedAt: new Date(),
        },
      });

      // Persist locally
      await persistSubscription({
        plan: status.plan,
        status: status.isSubscribed ? 'active' : 'none',
        expirationDate: null,
        productId: null,
        lastSyncedAt: new Date().toISOString(),
      });

      // Sync to database if user is authenticated
      const user = await getCurrentUser();
      if (user) {
        await syncSubscriptionToDatabase(status.plan);
      }
    },
    []
  );

  // Sync with database when user is authenticated
  useEffect(() => {
    const syncWithDatabase = async () => {
      const user = await getCurrentUser();
      if (!user) return;

      // Fetch subscription from database
      const dbSubscription = await fetchUserSubscription();
      if (dbSubscription) {
        const dbPlan = subscriptionToPlanType(dbSubscription);
        const isSubscribed = dbPlan !== 'none';

        dispatch({
          type: 'SET_SUBSCRIPTION',
          payload: {
            plan: dbPlan,
            isSubscribed,
            status: isSubscribed ? 'active' : 'none',
            lastSyncedAt: new Date(),
          },
        });
      }
    };

    // Run after initial load
    if (!state.isLoading) {
      syncWithDatabase();
    }
  }, [state.isLoading]);

  const contextValue: SubscriptionContextType = {
    ...state,
    refreshSubscription,
    handlePurchase,
    handleExpiration,
    canUseFeature,
    clearSubscription,
    updateFromSuperwall,
  };

  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  );
}

// Hook to use subscription context
export function useSubscription(): SubscriptionContextType {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}

// Convenience hook for checking feature access
export function useCanUseFeature(feature: Feature): boolean {
  const { canUseFeature } = useSubscription();
  return canUseFeature(feature);
}

// Convenience hook for checking AI voice access
export function useCanUseAIVoice(): boolean {
  const { canUseAIVoice } = useSubscription();
  return canUseAIVoice;
}
