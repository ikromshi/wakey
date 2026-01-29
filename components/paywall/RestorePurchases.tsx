import React, { useState } from 'react';
import { Pressable, Text, StyleSheet, View, ActivityIndicator } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { restorePurchases, type RestoreResult } from '@/services/superwall';
import { useSubscription } from '@/hooks/useSubscription';

type RestoreState = 'idle' | 'loading' | 'success' | 'no_purchases' | 'error';

interface RestorePurchasesProps {
  // Callback when restore is complete
  onRestoreComplete?: (result: RestoreResult) => void;
  // Custom text for the button
  buttonText?: string;
  // Show as a link-style button (no background)
  linkStyle?: boolean;
  // Custom color
  color?: string;
}

export function RestorePurchases({
  onRestoreComplete,
  buttonText = 'Restore Purchases',
  linkStyle = true,
  color = Colors.primary,
}: RestorePurchasesProps) {
  const [state, setState] = useState<RestoreState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { updateFromSuperwall } = useSubscription();

  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    if (state === 'loading') return;
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const showFeedback = (newState: RestoreState) => {
    setState(newState);
    // Auto-dismiss success/no_purchases after 2.5 seconds
    if (newState === 'success' || newState === 'no_purchases') {
      setTimeout(() => {
        setState('idle');
      }, 2500);
    }
  };

  const handleRestore = async () => {
    if (state === 'loading') return;

    setState('loading');
    setErrorMessage(null);

    try {
      const result = await restorePurchases();

      if (result.success) {
        if (result.restored) {
          // Update subscription context
          updateFromSuperwall({ isSubscribed: true, plan: result.plan });
          showFeedback('success');
        } else {
          showFeedback('no_purchases');
        }
      } else {
        setErrorMessage(result.error || 'Failed to restore purchases');
        showFeedback('error');
        // Auto-dismiss error after 3 seconds
        setTimeout(() => {
          setState('idle');
          setErrorMessage(null);
        }, 3000);
      }

      onRestoreComplete?.(result);
    } catch (error) {
      console.error('Restore error:', error);
      setErrorMessage('An unexpected error occurred');
      showFeedback('error');
      setTimeout(() => {
        setState('idle');
        setErrorMessage(null);
      }, 3000);
    }
  };

  const renderContent = () => {
    switch (state) {
      case 'loading':
        return (
          <View style={styles.contentRow}>
            <ActivityIndicator size="small" color={linkStyle ? color : Colors.card} />
            <Text style={[styles.buttonText, linkStyle && { color }]}>
              Restoring...
            </Text>
          </View>
        );

      case 'success':
        return (
          <View style={styles.contentRow}>
            <IconSymbol
              name="checkmark.circle.fill"
              size={18}
              color={Colors.success}
            />
            <Text style={[styles.buttonText, { color: Colors.success }]}>
              Purchases Restored!
            </Text>
          </View>
        );

      case 'no_purchases':
        return (
          <View style={styles.contentRow}>
            <IconSymbol
              name="info.circle.fill"
              size={18}
              color={Colors.textLight}
            />
            <Text style={[styles.buttonText, { color: Colors.textLight }]}>
              No purchases found
            </Text>
          </View>
        );

      case 'error':
        return (
          <View style={styles.contentRow}>
            <IconSymbol
              name="exclamationmark.circle.fill"
              size={18}
              color={Colors.error}
            />
            <Text style={[styles.buttonText, { color: Colors.error }]}>
              {errorMessage || 'Restore failed'}
            </Text>
          </View>
        );

      default:
        return (
          <Text style={[styles.buttonText, linkStyle && { color }]}>
            {buttonText}
          </Text>
        );
    }
  };

  if (linkStyle) {
    return (
      <Animated.View style={animatedStyle}>
        <Pressable
          onPress={handleRestore}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={state === 'loading'}
          style={styles.linkButton}
        >
          {renderContent()}
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={handleRestore}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={state === 'loading'}
        style={[styles.button, { backgroundColor: color }]}
      >
        {renderContent()}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  linkButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  buttonText: {
    fontFamily: 'Quicksand-Medium',
    fontSize: Typography.body.fontSize,
    color: Colors.card,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
});
