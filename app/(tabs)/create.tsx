import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';

import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAudioRecorder, formatDuration } from '@/hooks/useAudioRecorder';

type CreationPath = 'record' | 'script' | 'ai-tts' | null;

interface PathCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  selected: boolean;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function PathCard({ title, description, icon, color, selected, onPress }: PathCardProps) {
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

  return (
    <AnimatedPressable
      style={[styles.pathCard, animatedStyle, selected && styles.pathCardSelected]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        {icon}
      </View>
      <View style={styles.pathContent}>
        <Text style={styles.pathTitle}>{title}</Text>
        <Text style={styles.pathDescription}>{description}</Text>
      </View>
      {selected && (
        <View style={styles.checkmark}>
          <IconSymbol name="checkmark" size={16} color={Colors.card} />
        </View>
      )}
    </AnimatedPressable>
  );
}

export default function CreateScreen() {
  const [selectedPath, setSelectedPath] = useState<CreationPath>(null);

  const handleSelectPath = (path: CreationPath) => {
    setSelectedPath(path === selectedPath ? null : path);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Create</Text>
        <Text style={styles.subtitle}>Choose how to create your alarm sound</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <PathCard
          title="Record Audio"
          description="Use your microphone to record a custom wake-up message"
          icon={<IconSymbol name="mic.fill" size={28} color={Colors.card} />}
          color={Colors.primary}
          selected={selectedPath === 'record'}
          onPress={() => handleSelectPath('record')}
        />

        <PathCard
          title="Read a Script"
          description="Choose from motivational scripts and record yourself reading"
          icon={<IconSymbol name="rectangle.stack.fill" size={28} color={Colors.card} />}
          color={Colors.secondary}
          selected={selectedPath === 'script'}
          onPress={() => handleSelectPath('script')}
        />

        <PathCard
          title="AI Voice"
          description="Type your message and let AI generate a voice for you"
          icon={<IconSymbol name="gear" size={28} color={Colors.card} />}
          color="#9B59B6"
          selected={selectedPath === 'ai-tts'}
          onPress={() => handleSelectPath('ai-tts')}
        />

        {selectedPath && (
          <View style={styles.selectedContent}>
            <View style={styles.divider} />
            {selectedPath === 'record' && <RecordSection />}
            {selectedPath === 'script' && <ScriptSection />}
            {selectedPath === 'ai-tts' && <AITTSSection />}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function RecordSection() {
  const {
    state,
    duration,
    recordingUri,
    startRecording,
    stopRecording,
    playRecording,
    stopPlayback,
    discardRecording,
    hasPermission,
    requestPermission,
  } = useAudioRecorder();

  const pulseScale = useSharedValue(1);

  // Debug logging
  React.useEffect(() => {
    console.log('RecordSection state changed:', { state, recordingUri, duration });
  }, [state, recordingUri, duration]);

  // Pulse animation for recording state
  React.useEffect(() => {
    if (state === 'recording') {
      pulseScale.value = withRepeat(
        withTiming(1.1, { duration: 800 }),
        -1,
        true
      );
    } else {
      cancelAnimation(pulseScale);
      pulseScale.value = withSpring(1);
    }
  }, [state]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const handleRecordPress = async () => {
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Microphone access is needed to record audio. Please enable it in Settings.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    if (state === 'idle' || state === 'recorded') {
      if (state === 'recorded') {
        discardRecording();
      }
      await startRecording();
    } else if (state === 'recording') {
      await stopRecording();
    }
  };

  const handlePlayPress = async () => {
    if (state === 'playing') {
      await stopPlayback();
    } else {
      await playRecording();
    }
  };

  const handleSave = () => {
    if (recordingUri) {
      Alert.alert(
        'Recording Saved',
        'Your recording has been saved. You can now use it as an alarm sound.',
        [{ text: 'OK' }]
      );
      // TODO: In a future task, integrate with alarm creation
    }
  };

  const getHintText = () => {
    switch (state) {
      case 'idle':
        return 'Tap to start recording';
      case 'recording':
        return 'Recording... Tap to stop';
      case 'recorded':
        return 'Recording complete';
      case 'playing':
        return 'Playing...';
      default:
        return '';
    }
  };

  const getButtonIcon = () => {
    switch (state) {
      case 'recording':
        return 'stop.fill';
      default:
        return 'mic.fill';
    }
  };

  const getButtonColor = () => {
    return state === 'recording' ? Colors.danger : Colors.primary;
  };

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Record Your Voice</Text>

      {/* Duration display */}
      <Text style={styles.durationText}>{formatDuration(duration)}</Text>

      {/* Record button */}
      <View style={styles.recordButtonContainer}>
        <Animated.View style={[state === 'recording' && pulseStyle]}>
          <Pressable
            style={[styles.recordButton, { backgroundColor: getButtonColor() }]}
            onPress={handleRecordPress}
          >
            <IconSymbol name={getButtonIcon()} size={40} color={Colors.card} />
          </Pressable>
        </Animated.View>
        <Text style={styles.recordHint}>{getHintText()}</Text>
      </View>

      {/* Playback controls - only show when recorded */}
      {(state === 'recorded' || state === 'playing') && (
        <View style={styles.controlsContainer}>
          <Pressable style={styles.controlButton} onPress={handlePlayPress}>
            <IconSymbol
              name={state === 'playing' ? 'pause.fill' : 'play.fill'}
              size={24}
              color={Colors.card}
            />
          </Pressable>

          <Pressable style={styles.controlButton} onPress={discardRecording}>
            <IconSymbol name="trash.fill" size={24} color={Colors.card} />
          </Pressable>

          <Pressable
            style={[styles.controlButton, styles.saveButton]}
            onPress={handleSave}
          >
            <IconSymbol name="checkmark" size={24} color={Colors.card} />
          </Pressable>
        </View>
      )}

      {/* Debug: show current state */}
      <Text style={{ marginTop: 20, color: Colors.textLight, fontSize: 12 }}>
        Debug: state={state}, hasUri={recordingUri ? 'yes' : 'no'}
      </Text>
    </View>
  );
}

function ScriptSection() {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Choose a Script</Text>
      <Text style={styles.comingSoon}>Script library coming soon...</Text>
    </View>
  );
}

function AITTSSection() {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>AI Voice Generation</Text>
      <Text style={styles.comingSoon}>AI TTS interface coming soon...</Text>
    </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: 120, // Extra padding to ensure controls are visible above tab bar
  },
  pathCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  pathCardSelected: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pathContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  pathTitle: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: Typography.body.fontSize,
    color: Colors.text,
  },
  pathDescription: {
    fontFamily: 'Quicksand-Regular',
    fontSize: Typography.caption.fontSize,
    color: Colors.textLight,
    marginTop: 2,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedContent: {
    marginTop: Spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  sectionContainer: {
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: Typography.heading.fontSize,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  durationText: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 48,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  recordButtonContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  recordButton: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.card,
  },
  recordHint: {
    fontFamily: 'Quicksand-Regular',
    fontSize: Typography.caption.fontSize,
    color: Colors.textLight,
    marginTop: Spacing.md,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.button,
  },
  saveButton: {
    backgroundColor: Colors.success,
  },
  comingSoon: {
    fontFamily: 'Quicksand-Regular',
    fontSize: Typography.caption.fontSize,
    color: Colors.textLight,
    fontStyle: 'italic',
  },
});
