/**
 * Supabase Client Configuration
 *
 * Handles database connections and authentication.
 * Requires environment variables:
 * - EXPO_PUBLIC_SUPABASE_URL
 * - EXPO_PUBLIC_SUPABASE_ANON_KEY
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

import type { Database } from '@/types/database';

// Get configuration from environment
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || '';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || '';

// Track if Supabase is configured
const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Validate configuration
if (!isConfigured) {
  console.warn(
    'Supabase configuration missing. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env'
  );
}

// Create Supabase client with React Native storage adapter
// Use placeholder URL if not configured to prevent crash (client won't work but app will load)
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  return isConfigured;
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser() {
  if (!isConfigured) return null;

  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      // Don't log auth session missing errors - they're expected when not logged in
      if (!error.message.includes('Auth session missing')) {
        console.error('Error getting user:', error.message);
      }
      return null;
    }
    return user;
  } catch (error) {
    return null;
  }
}

/**
 * Get the current session
 */
export async function getSession() {
  if (!isConfigured) return null;

  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error getting session:', error.message);
      return null;
    }
    return session;
  } catch (error) {
    return null;
  }
}

/**
 * Sign up with email and password
 */
export async function signUp(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
      },
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) {
    throw error;
  }
}

/**
 * Update user password
 */
export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (error) {
    throw error;
  }
}

/**
 * Update user profile
 */
export async function updateProfile(updates: { full_name?: string; avatar_url?: string }) {
  const { error } = await supabase.auth.updateUser({
    data: updates,
  });
  if (error) {
    throw error;
  }
}
