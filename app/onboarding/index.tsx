import { Audio } from 'expo-av';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { markOnboardingComplete } from '@/hooks/useFirstLaunch';
import { VOICES } from '@/services/elevenLabsService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const WAKE_UP_STYLE_KEY = '@rise_alarm/wake_up_style';

// Voice sample audio files
const VOICE_SAMPLES: Record<string, any> = {
  'jen': require('../../assets/audio/voices/jen-sample.mp3'),
  'jessica': require('../../assets/audio/voices/jessica-sample.mp3'),
  'milo': require('../../assets/audio/voices/milo-sample.mp3'),
  'nathaniel': require('../../assets/audio/voices/nathaniel-sample.mp3'),
};

type WakeUpStyle = 'gentle' | 'motivated' | 'mindful' | 'playful' | null;

const TOTAL_PAGES = 5;

export default function OnboardingScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [wakeUpStyle, setWakeUpStyle] = useState<WakeUpStyle>(null);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / SCREEN_WIDTH);
    if (page !== currentPage && page >= 0 && page < TOTAL_PAGES) {
      setCurrentPage(page);
    }
  }, [currentPage]);

  const goToPage = useCallback((page: number) => {
    scrollViewRef.current?.scrollTo({ x: page * SCREEN_WIDTH, animated: true });
    setCurrentPage(page);
  }, []);

  const handleNext = useCallback(() => {
    if (currentPage < TOTAL_PAGES - 1) {
      goToPage(currentPage + 1);
    }
  }, [currentPage, goToPage]);

  const handleBack = useCallback(() => {
    if (currentPage > 0) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, goToPage]);

  const handleSkip = useCallback(() => {
    goToPage(TOTAL_PAGES - 1);
  }, [goToPage]);

  const stopAudio = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch (e) {}
      soundRef.current = null;
    }
    setPlayingVoiceId(null);
  };

  const handlePlayVoice = async (voiceId: string) => {
    if (playingVoiceId === voiceId) {
      await stopAudio();
      return;
    }

    await stopAudio();

    const sampleFile = VOICE_SAMPLES[voiceId];
    if (!sampleFile) return;

    try {
      const { sound } = await Audio.Sound.createAsync(
        sampleFile,
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded && status.didJustFinish) {
            setPlayingVoiceId(null);
          }
        }
      );
      soundRef.current = sound;
      setPlayingVoiceId(voiceId);
    } catch (error) {
      console.error('Failed to play voice sample:', error);
    }
  };

  const handleComplete = async () => {
    await stopAudio();

    // Save preferences
    if (wakeUpStyle) {
      await AsyncStorage.setItem(WAKE_UP_STYLE_KEY, wakeUpStyle);
    }

    // Mark onboarding complete
    await markOnboardingComplete();

    // Navigate to main app
    router.replace('/(tabs)');
  };

  const getButtonText = () => {
    if (currentPage === TOTAL_PAGES - 1) return "Let's Go!";
    return 'Continue';
  };

  const handlePrimaryPress = () => {
    if (currentPage === TOTAL_PAGES - 1) {
      handleComplete();
    } else {
      handleNext();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        {currentPage > 0 ? (
          <Pressable style={styles.headerButton} onPress={handleBack}>
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        ) : (
          <View style={styles.headerSpacer} />
        )}

        {currentPage < TOTAL_PAGES - 1 && currentPage > 0 ? (
          <Pressable style={styles.headerButton} onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      {/* Progress Dots */}
      <View style={styles.dotsContainer}>
        {Array.from({ length: TOTAL_PAGES }).map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                width: index === currentPage ? 24 : 8,
                backgroundColor: index === currentPage ? Colors.primary : Colors.border,
              },
            ]}
          />
        ))}
      </View>

      {/* Swipeable Content */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Page 1: Welcome */}
        <View style={styles.page}>
          <WelcomePage />
        </View>

        {/* Page 2: Features */}
        <View style={styles.page}>
          <FeaturesPage />
        </View>

        {/* Page 3: Voices */}
        <View style={styles.page}>
          <VoicesPage
            playingVoiceId={playingVoiceId}
            onPlayVoice={handlePlayVoice}
          />
        </View>

        {/* Page 4: Styles */}
        <View style={styles.page}>
          <StylesPage
            wakeUpStyle={wakeUpStyle}
            onSelectStyle={setWakeUpStyle}
          />
        </View>

        {/* Page 5: Complete */}
        <View style={styles.page}>
          <CompletePage />
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Pressable style={styles.primaryButton} onPress={handlePrimaryPress}>
          <Text style={styles.primaryButtonText}>{getButtonText()}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// ============================================
// Page Components
// ============================================

function WelcomePage() {
  return (
    <View style={styles.pageContent}>
      <View style={styles.iconCircle}>
        <IconSymbol name="sun.max.fill" size={64} color={Colors.primary} />
      </View>

      <Text style={styles.headline}>Wake Up Inspired</Text>
      <Text style={styles.subheadline}>
        Start every morning with purpose, motivation, and calm
      </Text>

      <View style={styles.featureList}>
        <FeatureItem icon="mic.fill" text="Personalized wake-up messages" />
        <FeatureItem icon="waveform" text="AI-generated motivational voices" />
        <FeatureItem icon="moon.fill" text="Gentle, stress-free mornings" />
        {/* <FeatureItem icon="heart.fill" text="Custom recordings from loved ones" /> */}
      </View>
    </View>
  );
}

function FeaturesPage() {44444
  return (
    <View style={styles.pageContent}>
      <Text style={styles.title}>Create Your Perfect Wake-Up</Text>
      <Text style={styles.subtitle}>
        Three ways to personalize your morning alarm
      </Text>

      <View style={styles.featureCards}>
        <FeatureCard
          icon="mic.fill"
          color={Colors.primary}
          title="Record Your Voice"
          description="Create personal messages or have loved ones record for you"
        />
        <FeatureCard
          icon="rectangle.stack.fill"
          color={Colors.secondary}
          title="Read a Script"
          description="Choose from motivational scripts and record yourself reading"
        />
        <FeatureCard
          icon="waveform"
          color="#9B59B6"
          title="AI Voice"
          description="Let AI generate a soothing voice with your custom message"
        />
      </View>
    </View>
  );
}

function VoicesPage({
  playingVoiceId,
  onPlayVoice,
}: {
  playingVoiceId: string | null;
  onPlayVoice: (id: string) => void;
}) {
  return (
    <View style={styles.pageContent}>
      <Text style={styles.title}>Meet Your AI Voices</Text>
      <Text style={styles.subtitle}>
        Premium voices that will gently wake you up
      </Text>

      <View style={styles.badge}>
        <IconSymbol name="star.fill" size={14} color="#9B59B6" />
        <Text style={styles.badgeText}>Full Plan Feature</Text>
      </View>

      <View style={styles.voiceList}>
        {VOICES.map((voice) => (
          <Pressable
            key={voice.id}
            style={styles.voiceCard}
            onPress={() => onPlayVoice(voice.id)}
          >
            <View style={styles.voiceInfo}>
              <Text style={styles.voiceName}>{voice.name}</Text>
              <Text style={styles.voiceDescription} numberOfLines={2}>
                {voice.description}
              </Text>
            </View>
            <View style={[
              styles.playButton,
              playingVoiceId === voice.id && styles.playButtonActive,
            ]}>
              <IconSymbol
                name={playingVoiceId === voice.id ? 'stop.fill' : 'play.fill'}
                size={20}
                color={playingVoiceId === voice.id ? Colors.card : '#9B59B6'}
              />
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function StylesPage({
  wakeUpStyle,
  onSelectStyle,
}: {
  wakeUpStyle: WakeUpStyle;
  onSelectStyle: (style: WakeUpStyle) => void;
}) {
  const styleOptions = [
    { id: 'gentle' as const, title: 'Gentle & Calm', description: 'Ease into your day peacefully', icon: 'moon.fill', color: Colors.secondary },
    { id: 'motivated' as const, title: 'Motivated & Energized', description: 'Start with purpose and drive', icon: 'bolt.fill', color: Colors.primary },
    { id: 'mindful' as const, title: 'Mindful & Centered', description: 'Begin with clarity and focus', icon: 'leaf.fill', color: '#27AE60' },
    { id: 'playful' as const, title: 'Fun & Playful', description: 'Wake up with a smile', icon: 'sun.max.fill', color: '#F39C12' },
  ];

  return (
    <View style={styles.pageContent}>
      <Text style={styles.title}>How Do You Like to Wake Up?</Text>
      <Text style={styles.subtitle}>
        This helps us suggest the best sounds for you
      </Text>

      <View style={styles.styleGrid}>
        {styleOptions.map((option) => (
          <Pressable
            key={option.id}
            style={[
              styles.styleCard,
              wakeUpStyle === option.id && { borderColor: option.color, borderWidth: 2 },
            ]}
            onPress={() => onSelectStyle(option.id)}
          >
            <View style={[styles.styleIconContainer, { backgroundColor: option.color + '20' }]}>
              <IconSymbol name={option.icon as any} size={28} color={option.color} />
            </View>
            <Text style={styles.styleCardTitle}>{option.title}</Text>
            <Text style={styles.styleCardDescription}>{option.description}</Text>
            {wakeUpStyle === option.id && (
              <View style={[styles.checkmark, { backgroundColor: option.color }]}>
                <IconSymbol name="checkmark" size={12} color={Colors.card} />
              </View>
            )}
          </Pressable>
        ))}
      </View>

      {!wakeUpStyle && (
        <Text style={styles.hint}>Tap to select (you can change this later)</Text>
      )}
    </View>
  );
}

function CompletePage() {
  return (
    <View style={styles.pageContent}>
      <View style={styles.completeIconCircle}>
        <IconSymbol name="checkmark" size={48} color={Colors.card} />
      </View>

      <Text style={styles.headline}>You're All Set!</Text>
      <Text style={styles.subheadline}>
        Get ready to transform your mornings
      </Text>

      <View style={styles.featureList}>
        <FeatureItem icon="alarm" text="Create your first alarm" />
        <FeatureItem icon="mic.fill" text="Record a personal message" />
        <FeatureItem icon="rectangle.stack.fill" text="Explore audio templates" />
        <FeatureItem icon="waveform" text="Try AI-generated voices" />
      </View>
    </View>
  );
}

// ============================================
// Shared Components
// ============================================

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>
        <IconSymbol name={icon as any} size={20} color={Colors.primary} />
      </View>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

function FeatureCard({
  icon,
  color,
  title,
  description,
}: {
  icon: string;
  color: string;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.featureCard}>
      <View style={[styles.featureCardIcon, { backgroundColor: color + '20' }]}>
        <IconSymbol name={icon as any} size={28} color={color} />
      </View>
      <View style={styles.featureCardContent}>
        <Text style={styles.featureCardTitle}>{title}</Text>
        <Text style={styles.featureCardDescription}>{description}</Text>
      </View>
    </View>
  );
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  headerButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  backText: {
    fontFamily: 'Quicksand-Medium',
    fontSize: Typography.body.fontSize,
    color: Colors.primary,
  },
  skipText: {
    fontFamily: 'Quicksand-Medium',
    fontSize: Typography.body.fontSize,
    color: Colors.textLight,
  },
  headerSpacer: {
    width: 60,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  page: {
    width: SCREEN_WIDTH,
    paddingHorizontal: Spacing.lg,
  },
  pageContent: {
    flex: 1,
    alignItems: 'center',
    paddingTop: Spacing.lg,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: Typography.body.fontSize,
    color: Colors.card,
  },

  // Welcome page
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  headline: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 32,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subheadline: {
    fontFamily: 'Quicksand-Regular',
    fontSize: Typography.body.fontSize,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
    paddingHorizontal: Spacing.md,
  },
  featureList: {
    width: '100%',
    gap: Spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: Spacing.md,
    borderRadius: 12,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  featureText: {
    fontFamily: 'Quicksand-Medium',
    fontSize: Typography.body.fontSize,
    color: Colors.text,
    flex: 1,
  },

  // Features page
  title: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 26,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontFamily: 'Quicksand-Regular',
    fontSize: Typography.body.fontSize,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  featureCards: {
    width: '100%',
    gap: Spacing.md,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    padding: Spacing.lg,
    borderRadius: 16,
    alignItems: 'center',
  },
  featureCardIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  featureCardContent: {
    flex: 1,
  },
  featureCardTitle: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: Typography.body.fontSize,
    color: Colors.text,
    marginBottom: 4,
  },
  featureCardDescription: {
    fontFamily: 'Quicksand-Regular',
    fontSize: Typography.caption.fontSize,
    color: Colors.textLight,
    lineHeight: 18,
  },

  // Voices page
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: '#9B59B620',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.lg,
  },
  badgeText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: Typography.caption.fontSize,
    color: '#9B59B6',
  },
  voiceList: {
    width: '100%',
    gap: Spacing.sm,
  },
  voiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  voiceInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  voiceName: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: Typography.body.fontSize,
    color: Colors.text,
    marginBottom: 4,
  },
  voiceDescription: {
    fontFamily: 'Quicksand-Regular',
    fontSize: Typography.caption.fontSize,
    color: Colors.textLight,
    lineHeight: 18,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#9B59B620',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonActive: {
    backgroundColor: '#9B59B6',
  },

  // Styles page
  styleGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  styleCard: {
    width: '48%',
    backgroundColor: Colors.card,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  styleIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  styleCardTitle: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 14,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  styleCardDescription: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 16,
  },
  checkmark: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hint: {
    fontFamily: 'Quicksand-Regular',
    fontSize: Typography.caption.fontSize,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },

  // Complete page
  completeIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
});
