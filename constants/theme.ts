/**
 * RiseAlarm Theme Configuration
 * Soft, rounded, approachable aesthetic with warm colors
 */

import { Platform } from 'react-native';

// Primary color palette from design specs
export const Colors = {
  // Main app colors (light mode only)
  background: '#FFF9F2',      // Soft cream/off-white
  primary: '#FF9F43',         // Muted orange (sun/waking up)
  secondary: '#74B9FF',       // Calm sky blue
  text: '#4A4A4A',            // Soft charcoal
  textLight: '#7A7A7A',       // Lighter text for secondary info
  card: '#FFFFFF',            // White cards
  cardShadow: 'rgba(0,0,0,0.08)', // Subtle shadow
  border: '#F0E6DA',          // Soft border color
  danger: '#FF6B6B',          // For delete actions
  success: '#4CAF50',         // For confirmations
  disabled: '#D0D0D0',        // Disabled state

  // For backward compatibility with existing components
  light: {
    text: '#4A4A4A',
    background: '#FFF9F2',
    tint: '#FF9F43',
    icon: '#7A7A7A',
    tabIconDefault: '#B0B0B0',
    tabIconSelected: '#FF9F43',
  },
  dark: {
    text: '#4A4A4A',
    background: '#FFF9F2',
    tint: '#FF9F43',
    icon: '#7A7A7A',
    tabIconDefault: '#B0B0B0',
    tabIconSelected: '#FF9F43',
  },
};

// Spacing scale for consistent layouts
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border radius for rounded aesthetic
export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// Shadow presets for cards (elevation: 2 as per design)
export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  button: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
};

// Font family configuration
// Will be updated to use Quicksand once loaded via expo-font
export const Fonts = {
  // Primary font family (Quicksand - to be loaded)
  regular: 'Quicksand-Regular',
  medium: 'Quicksand-Medium',
  semiBold: 'Quicksand-SemiBold',
  bold: 'Quicksand-Bold',

  // Fallback fonts per platform
  fallback: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
};

// Typography scale
export const Typography = {
  // Large time display (alarm cards)
  timeDisplay: {
    fontSize: 40,
    fontWeight: '600' as const,
    lineHeight: 48,
  },
  // Page titles
  title: {
    fontSize: 28,
    fontWeight: '600' as const,
    lineHeight: 34,
  },
  // Section headers
  heading: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 26,
  },
  // Body text
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  // Secondary/caption text
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  // Small labels
  small: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
};
