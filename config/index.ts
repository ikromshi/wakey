/**
 * App configuration
 *
 * Environment variables are loaded from .env file
 * Prefix with EXPO_PUBLIC_ to make them available in the app
 */

// ElevenLabs API key from environment
export const ELEVENLABS_API_KEY = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY || '';

// Check if API key is configured
export function isElevenLabsConfigured(): boolean {
  return ELEVENLABS_API_KEY.length > 0;
}
