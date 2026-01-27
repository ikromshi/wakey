import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';

import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  TEMPLATES,
  TEMPLATE_CATEGORIES,
  AudioTemplate,
  getTemplatesByCategory,
} from '@/data/templates';
import { useAudioSelection } from '@/context/AudioSelectionContext';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Icon mapping for template types
function getTemplateIcon(icon: AudioTemplate['icon']): 'sun.max.fill' | 'moon.fill' | 'leaf.fill' | 'drop.fill' | 'bell.fill' | 'music.note' | 'text.bubble.fill' {
  switch (icon) {
    case 'sun': return 'sun.max.fill';
    case 'moon': return 'moon.fill';
    case 'bird': return 'leaf.fill';
    case 'water': return 'drop.fill';
    case 'bell': return 'bell.fill';
    case 'music': return 'music.note';
    case 'speech': return 'text.bubble.fill';
    default: return 'music.note';
  }
}

function getIconColor(icon: AudioTemplate['icon']): string {
  switch (icon) {
    case 'sun': return '#FF9F43';
    case 'moon': return '#9B59B6';
    case 'bird': return '#27AE60';
    case 'water': return '#74B9FF';
    case 'bell': return '#F39C12';
    case 'music': return '#E74C3C';
    case 'speech': return '#3498DB';
    default: return Colors.primary;
  }
}

interface TemplateCardProps {
  template: AudioTemplate;
  isPlaying: boolean;
  onPlay: () => void;
  onStop: () => void;
  onSelect: () => void;
}

function TemplateCard({ template, isPlaying, onPlay, onStop, onSelect }: TemplateCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const iconName = getTemplateIcon(template.icon);
  const iconColor = getIconColor(template.icon);

  return (
    <AnimatedPressable
      style={[styles.templateCard, animatedStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onSelect}
    >
      <View style={[styles.templateIcon, { backgroundColor: iconColor + '20' }]}>
        <IconSymbol name={iconName} size={28} color={iconColor} />
      </View>

      <View style={styles.templateContent}>
        <Text style={styles.templateTitle}>{template.title}</Text>
        <Text style={styles.templateDescription} numberOfLines={1}>
          {template.description}
        </Text>
        <View style={styles.templateMeta}>
          <View style={[
            styles.categoryBadge,
            { backgroundColor: template.category === 'sounds' ? Colors.primary + '20' : Colors.secondary + '20' }
          ]}>
            <Text style={[
              styles.categoryBadgeText,
              { color: template.category === 'sounds' ? Colors.primary : Colors.secondary }
            ]}>
              {template.category === 'sounds' ? 'Sound' : 'Speech'}
            </Text>
          </View>
          <Text style={styles.templateDuration}>{template.duration}</Text>
        </View>
      </View>

      <Pressable
        style={[styles.playButton, isPlaying && styles.playButtonActive]}
        onPress={(e) => {
          e.stopPropagation();
          isPlaying ? onStop() : onPlay();
        }}
      >
        <IconSymbol
          name={isPlaying ? 'stop.fill' : 'play.fill'}
          size={20}
          color={Colors.card}
        />
      </Pressable>
    </AnimatedPressable>
  );
}

export default function TemplatesScreen() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const { setPendingSelection } = useAudioSelection();

  const filteredTemplates = getTemplatesByCategory(selectedCategory);

  const handlePlay = (template: AudioTemplate) => {
    // In production, this would actually play the audio
    console.log('Playing template:', template.id);
    setPlayingId(template.id);

    // Simulate playback ending after the duration
    const durationParts = template.duration.split(':');
    const seconds = parseInt(durationParts[0]) * 60 + parseInt(durationParts[1]);
    setTimeout(() => {
      setPlayingId(prev => prev === template.id ? null : prev);
    }, seconds * 1000);
  };

  const handleStop = () => {
    console.log('Stopping playback');
    setPlayingId(null);
  };

  const handleSelectTemplate = (template: AudioTemplate) => {
    Alert.alert(
      template.title,
      `Would you like to use "${template.title}" as your alarm sound?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Use This Sound',
          onPress: () => {
            // Stop any playing audio
            handleStop();
            // Set pending selection for New Alarm to pick up
            setPendingSelection({
              audioSource: { type: 'template', templateId: template.id },
              audioName: template.title,
            });
            // Dismiss all modals and open New Alarm fresh
            router.dismissAll();
            router.push('/new-alarm');
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Templates</Text>
        <Text style={styles.subtitle}>Browse sounds and speech for your alarms</Text>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContent}
      >
        {TEMPLATE_CATEGORIES.map(cat => (
          <Pressable
            key={cat.id}
            style={[
              styles.categoryChip,
              selectedCategory === cat.id && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(cat.id)}
          >
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === cat.id && styles.categoryChipTextActive,
              ]}
            >
              {cat.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Templates List */}
      <ScrollView
        style={styles.templateList}
        contentContainerStyle={styles.templateListContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredTemplates.map((template, index) => (
          <Animated.View
            key={template.id}
            entering={FadeIn.delay(index * 50).duration(200)}
          >
            <TemplateCard
              template={template}
              isPlaying={playingId === template.id}
              onPlay={() => handlePlay(template)}
              onStop={handleStop}
              onSelect={() => handleSelectTemplate(template)}
            />
          </Animated.View>
        ))}

        {filteredTemplates.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No templates found</Text>
          </View>
        )}
      </ScrollView>

      {/* Now Playing Bar */}
      {playingId && (
        <Animated.View
          entering={FadeIn.duration(200)}
          style={styles.nowPlayingBar}
        >
          <View style={styles.nowPlayingContent}>
            <IconSymbol name="play.fill" size={16} color={Colors.card} />
            <Text style={styles.nowPlayingText}>
              Now playing: {TEMPLATES.find(t => t.id === playingId)?.title}
            </Text>
          </View>
          <Pressable onPress={handleStop} style={styles.nowPlayingStop}>
            <IconSymbol name="stop.fill" size={18} color={Colors.card} />
          </Pressable>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  title: {
    fontFamily: 'Quicksand-Bold',
    fontSize: Typography.title.fontSize,
    color: Colors.text,
  },
  subtitle: {
    fontFamily: 'Quicksand-Regular',
    fontSize: Typography.body.fontSize,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },

  // Category filter
  categoryScroll: {
    maxHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  categoryContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    flexDirection: 'row',
  },
  categoryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryChipText: {
    fontFamily: 'Quicksand-Medium',
    fontSize: Typography.caption.fontSize,
    color: Colors.textLight,
  },
  categoryChipTextActive: {
    color: Colors.card,
  },

  // Template list
  templateList: {
    flex: 1,
  },
  templateListContent: {
    padding: Spacing.md,
    gap: Spacing.md,
    paddingBottom: Spacing.xxl * 2,
  },

  // Template card
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.card,
  },
  templateIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  templateContent: {
    flex: 1,
    marginLeft: Spacing.md,
    marginRight: Spacing.sm,
  },
  templateTitle: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: Typography.body.fontSize,
    color: Colors.text,
  },
  templateDescription: {
    fontFamily: 'Quicksand-Regular',
    fontSize: Typography.caption.fontSize,
    color: Colors.textLight,
    marginTop: 2,
  },
  templateMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    gap: Spacing.sm,
  },
  categoryBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  categoryBadgeText: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 10,
  },
  templateDuration: {
    fontFamily: 'Quicksand-Regular',
    fontSize: Typography.caption.fontSize,
    color: Colors.textLight,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.button,
  },
  playButtonActive: {
    backgroundColor: Colors.danger,
  },

  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    fontFamily: 'Quicksand-Medium',
    fontSize: Typography.body.fontSize,
    color: Colors.textLight,
  },

  // Now playing bar
  nowPlayingBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    ...Shadows.card,
  },
  nowPlayingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  nowPlayingText: {
    fontFamily: 'Quicksand-Medium',
    fontSize: Typography.body.fontSize,
    color: Colors.card,
  },
  nowPlayingStop: {
    padding: Spacing.xs,
  },
});
