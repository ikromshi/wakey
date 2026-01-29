/**
 * Auth Context
 *
 * Manages authentication state and provides auth methods throughout the app.
 */

import { Session, User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

import {
  supabase,
  isSupabaseConfigured,
  signIn as supabaseSignIn,
  signUp as supabaseSignUp,
  signOut as supabaseSignOut,
  resetPassword as supabaseResetPassword,
} from '@/services/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isConfigured: boolean;
}

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isConfigured: isSupabaseConfigured(),
  });

  // Initialize auth state
  useEffect(() => {
    if (!state.isConfigured) {
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState((prev) => ({
        ...prev,
        session,
        user: session?.user ?? null,
        isLoading: false,
      }));
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState((prev) => ({
        ...prev,
        session,
        user: session?.user ?? null,
      }));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [state.isConfigured]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!state.isConfigured) {
      throw new Error('Supabase is not configured');
    }
    await supabaseSignIn(email, password);
  }, [state.isConfigured]);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    if (!state.isConfigured) {
      throw new Error('Supabase is not configured');
    }
    await supabaseSignUp(email, password, name);
  }, [state.isConfigured]);

  const signOut = useCallback(async () => {
    if (!state.isConfigured) {
      throw new Error('Supabase is not configured');
    }
    await supabaseSignOut();
  }, [state.isConfigured]);

  const resetPassword = useCallback(async (email: string) => {
    if (!state.isConfigured) {
      throw new Error('Supabase is not configured');
    }
    await supabaseResetPassword(email);
  }, [state.isConfigured]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signUp,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Hook to check if user is authenticated
 */
export function useIsAuthenticated() {
  const { user, isLoading } = useAuth();
  return { isAuthenticated: !!user, isLoading };
}
