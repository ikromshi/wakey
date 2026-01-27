import { Audio } from 'expo-av';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/theme';
import { useAudioSelection } from '@/context/AudioSelectionContext';
import {
  AudioTemplate,
  TEMPLATES,
  TEMPLATE_CATEGORIES,
  getTemplatesByCategory,
} from '@/data/templates';

// Template audio files mapping (must match IDs in templates.ts)
const TEMPLATE_AUDIO_FILES: Record<string, any> = {
  'motivational-start': require('../../assets/audio/templates/motivational-start.mp3'),
  'calm-awakening': require('../../assets/audio/templates/calm-awakening.mp3'),
  'positive-affirmations': require('../../assets/audio/templates/positive-affirmations.mp3'),
  'mindful-morning': require('../../assets/audio/templates/mindful-morning.mp3'),
  'energy-boost': require('../../assets/audio/templates/energy-boost.mp3'),
  'rich-mindset': require('../../assets/audio/templates/rich-mindset.mp3'),
};

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
  const soundRef = useRef<Audio.Sound | null>(null);

  const filteredTemplates = getTemplatesByCategory(selectedCategory);

  // Cleanup sound on unmount
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const handlePlay = async (template: AudioTemplate) => {
    // Stop any currently playing audio first
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }

    // Check if we have audio for this template
    const audioFile = TEMPLATE_AUDIO_FILES[template.id];
    if (!audioFile) {
      console.log('No audio file for template:', template.id);
      Alert.alert('Audio Not Available', 'This template audio is not yet available.');
      return;
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      const { sound } = await Audio.Sound.createAsync(
        audioFile,
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded && status.didJustFinish) {
            setPlayingId(null);
          }
        }
      );

      soundRef.current = sound;
      setPlayingId(template.id);
      console.log('Playing template:', template.id);
    } catch (error) {
      console.error('Error playing template audio:', error);
      Alert.alert('Playback Error', 'Could not play this audio.');
    }
  };

  const handleStop = async () => {
    console.log('Stopping playback');
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
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
            {/* <IconSymbol name="play.fill" size={16} color={Colors.card} /> */}
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
