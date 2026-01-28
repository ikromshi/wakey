import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { Colors, Spacing, Typography } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export interface Feature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

interface FeatureListProps {
  features: Feature[];
  compact?: boolean;
}

export function FeatureList({ features, compact = false }: FeatureListProps) {
  return (
    <View style={styles.container}>
      {features.map((feature, index) => (
        <View
          key={index}
          style={[
            styles.featureRow,
            compact && styles.featureRowCompact,
          ]}
        >
          <View
            style={[
              styles.iconContainer,
              feature.included ? styles.iconIncluded : styles.iconExcluded,
            ]}
          >
            <IconSymbol
              name={feature.included ? 'checkmark' : 'xmark'}
              size={compact ? 10 : 12}
              color={feature.included ? Colors.success : Colors.textLight}
            />
          </View>
          <Text
            style={[
              styles.featureText,
              compact && styles.featureTextCompact,
              !feature.included && styles.featureTextExcluded,
              feature.highlight && styles.featureTextHighlight,
            ]}
          >
            {feature.text}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  featureRowCompact: {
    gap: Spacing.xs,
  },
  iconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconIncluded: {
    backgroundColor: Colors.success + '20',
  },
  iconExcluded: {
    backgroundColor: Colors.textLight + '20',
  },
  featureText: {
    fontFamily: 'Quicksand-Medium',
    fontSize: Typography.body.fontSize,
    color: Colors.text,
    flex: 1,
  },
  featureTextCompact: {
    fontSize: Typography.caption.fontSize,
  },
  featureTextExcluded: {
    color: Colors.textLight,
  },
  featureTextHighlight: {
    fontFamily: 'Quicksand-SemiBold',
    color: Colors.primary,
  },
});

export default FeatureList;
