import { Audio } from 'expo-av';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { UpgradeButton, FullPlanBadge } from '@/components/paywall';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/theme';
import { useAudioSelection } from '@/context/AudioSelectionContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { SCRIPT_CATEGORIES, Script, getScriptsByCategory } from '@/data/scripts';
import { formatDuration, useAudioRecorder } from '@/hooks/useAudioRecorder';
import { saveAudioFile } from '@/services/audioStorage';
import { VOICES, Voice, generateTTS } from '@/services/elevenLabsService';
import { SavedTTSAudio, deleteTTSAudio, getSavedTTSAudio, saveTTSAudio } from '@/services/ttsStorage';

type CreationPath = 'record' | 'script' | 'ai-tts' | null;

interface PathCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function PathCard({ title, description, icon, color, onPress }: PathCardProps) {
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
      style={[styles.pathCard, animatedStyle]}
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
      <IconSymbol name="chevron.right" size={20} color={Colors.textLight} />
    </AnimatedPressable>
  );
}

export default function CreateScreen() {
  const [selectedPath, setSelectedPath] = useState<CreationPath>(null);

  const handleBack = () => {
    setSelectedPath(null);
  };

  // Full-screen mode for selected path
  if (selectedPath) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {selectedPath === 'record' && <RecordScreen onBack={handleBack} />}
        {selectedPath === 'script' && <ScriptScreen onBack={handleBack} />}
        {selectedPath === 'ai-tts' && <AITTSScreen onBack={handleBack} />}
      </SafeAreaView>
    );
  }

  // Path selection view
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Create</Text>
        <Text style={styles.subtitle}>Choose how to create your alarm sound</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.selectionContent}
        showsVerticalScrollIndicator={false}
      >
        <PathCard
          title="Record Audio"
          description="Use your microphone to record a custom wake-up message"
          icon={<IconSymbol name="mic.fill" size={28} color={Colors.card} />}
          color={Colors.primary}
          onPress={() => setSelectedPath('record')}
        />

        <PathCard
          title="Read a Script"
          description="Choose from motivational scripts and record yourself reading"
          icon={<IconSymbol name="rectangle.stack.fill" size={28} color={Colors.card} />}
          color={Colors.secondary}
          onPress={() => setSelectedPath('script')}
        />

        <PathCard
          title="AI Voice"
          description="Type your message and let AI generate a voice for you"
          icon={<IconSymbol name="gear" size={28} color={Colors.card} />}
          color="#9B59B6"
          onPress={() => setSelectedPath('ai-tts')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================
// RECORD SCREEN - Full screen recording interface
// ============================================
function RecordScreen({ onBack }: { onBack: () => void }) {
  const [isSaving, setIsSaving] = useState(false);
  const { setPendingSelection } = useAudioSelection();
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

    if (state === 'idle') {
      await startRecording();
    } else if (state === 'recording') {
      await stopRecording();
    } else if (state === 'recorded' || state === 'playing') {
      // Start new recording (discard old one)
      discardRecording();
      await startRecording();
    }
  };

  const handlePlayPress = () => {
    if (state === 'playing') {
      stopPlayback();
    } else {
      playRecording();
    }
  };

  const handleSave = async () => {
    if (recordingUri) {
      setIsSaving(true);
      try {
        const savedFile = await saveAudioFile(recordingUri, 'recording');
        console.log('Recording saved to:', savedFile.uri);
        // Set pending selection for New Alarm to pick up
        setPendingSelection({
          audioSource: { type: 'recording', uri: savedFile.uri },
          audioName: 'Custom Recording',
        });
        // Open New Alarm modal
        router.push('/new-alarm');
      } catch (error) {
        console.error('Failed to save recording:', error);
        Alert.alert('Save Failed', 'Could not save the recording. Please try again.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleDiscard = () => {
    Alert.alert(
      'Discard Recording?',
      'Are you sure you want to discard this recording?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => {
          discardRecording();
        }},
      ]
    );
  };

  const getMainButtonConfig = (): { icon: 'stop.fill' | 'mic.fill'; color: string; label: string } => {
    switch (state) {
      case 'recording':
        return { icon: 'stop.fill', color: Colors.danger, label: 'Tap to stop' };
      case 'recorded':
      case 'playing':
        return { icon: 'mic.fill', color: Colors.primary, label: 'Record again' };
      default:
        return { icon: 'mic.fill', color: Colors.primary, label: 'Tap to record' };
    }
  };

  const buttonConfig = getMainButtonConfig();
  const showControls = state === 'recorded' || state === 'playing';

  return (
    <View style={styles.fullScreenContainer}>
      {/* Header */}
      <View style={styles.screenHeader}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <IconSymbol name="chevron.left.forwardslash.chevron.right" size={20} color={Colors.primary} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.screenTitle}>Record Audio</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Main content */}
      <View style={styles.recordContent}>
        {/* Duration display */}
        <Text style={styles.bigDuration}>{formatDuration(duration)}</Text>

        {/* Status text */}
        <Text style={styles.statusText}>
          {state === 'recording' ? 'Recording...' :
           state === 'recorded' ? 'Recording complete' :
           state === 'playing' ? 'Playing...' :
           'Ready to record'}
        </Text>

        {/* Main record button */}
        <View style={styles.mainButtonContainer}>
          <Pressable
            style={[styles.mainRecordButton, { backgroundColor: buttonConfig.color }]}
            onPress={handleRecordPress}
          >
            <IconSymbol name={buttonConfig.icon} size={48} color={Colors.card} />
          </Pressable>
          <Text style={styles.buttonLabel}>{buttonConfig.label}</Text>
        </View>

        {/* Playback controls - only show when recorded */}
        {showControls && (
          <Animated.View
            entering={FadeIn.duration(200)}
            style={styles.controlsRow}
          >
            <Pressable style={styles.controlBtn} onPress={handlePlayPress}>
              <IconSymbol
                name={state === 'playing' ? 'pause.fill' : 'play.fill'}
                size={28}
                color={Colors.card}
              />
              <Text style={styles.controlLabel}>
                {state === 'playing' ? 'Pause' : 'Play'}
              </Text>
            </Pressable>

            <Pressable style={[styles.controlBtn, styles.discardBtn]} onPress={handleDiscard}>
              <IconSymbol name="trash.fill" size={28} color={Colors.card} />
              <Text style={styles.controlLabel}>Discard</Text>
            </Pressable>

            <Pressable style={[styles.controlBtn, styles.saveBtn]} onPress={handleSave}>
              <IconSymbol name="checkmark" size={28} color={Colors.card} />
              <Text style={styles.controlLabel}>Save</Text>
            </Pressable>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

// ============================================
// SCRIPT SCREEN - Browse and record scripts
// ============================================
function ScriptScreen({ onBack }: { onBack: () => void }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);

  const filteredScripts = getScriptsByCategory(selectedCategory);

  // If a script is selected, show the recording view
  if (selectedScript) {
    return (
      <ScriptRecordView
        script={selectedScript}
        onBack={() => setSelectedScript(null)}
        onComplete={onBack}
      />
    );
  }

  // Script selection view
  return (
    <View style={styles.fullScreenContainer}>
      <View style={styles.screenHeader}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <IconSymbol name="chevron.left.forwardslash.chevron.right" size={20} color={Colors.primary} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.screenTitle}>Read a Script</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Category filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContent}
      >
        {SCRIPT_CATEGORIES.map(cat => (
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

      {/* Script list */}
      <ScrollView
        style={styles.scriptList}
        contentContainerStyle={styles.scriptListContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredScripts.map(script => (
          <Pressable
            key={script.id}
            style={styles.scriptCard}
            onPress={() => setSelectedScript(script)}
          >
            <View style={styles.scriptHeader}>
              <Text style={styles.scriptTitle}>{script.title}</Text>
              <Text style={styles.scriptDuration}>{script.duration}</Text>
            </View>
            <Text style={styles.scriptPreview} numberOfLines={2}>
              {script.text}
            </Text>
            <View style={styles.scriptFooter}>
              <View style={[styles.categoryBadge, getCategoryColor(script.category)]}>
                <Text style={styles.categoryBadgeText}>
                  {script.category.charAt(0).toUpperCase() + script.category.slice(1)}
                </Text>
              </View>
              <IconSymbol name="chevron.right" size={16} color={Colors.textLight} />
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

// Helper function for category colors
function getCategoryColor(category: string): { backgroundColor: string } {
  switch (category) {
    case 'motivation': return { backgroundColor: Colors.primary + '20' };
    case 'gentle': return { backgroundColor: Colors.secondary + '20' };
    case 'energetic': return { backgroundColor: '#FF6B6B20' };
    case 'mindful': return { backgroundColor: '#9B59B620' };
    default: return { backgroundColor: Colors.border };
  }
}

// ============================================
// SCRIPT RECORD VIEW - Record while reading script
// ============================================
function ScriptRecordView({
  script,
  onBack,
  onComplete,
}: {
  script: Script;
  onBack: () => void;
  onComplete: () => void;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const { setPendingSelection } = useAudioSelection();
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

  const handleRecordPress = async () => {
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Microphone access is needed to record audio.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    if (state === 'idle') {
      await startRecording();
    } else if (state === 'recording') {
      await stopRecording();
    } else if (state === 'recorded' || state === 'playing') {
      discardRecording();
      await startRecording();
    }
  };

  const handlePlayPress = () => {
    if (state === 'playing') {
      stopPlayback();
    } else {
      playRecording();
    }
  };

  const handleSave = async () => {
    if (recordingUri) {
      setIsSaving(true);
      try {
        const savedFile = await saveAudioFile(recordingUri, 'recording');
        console.log('Script recording saved to:', savedFile.uri);
        // Set pending selection for New Alarm to pick up
        setPendingSelection({
          audioSource: { type: 'recording', uri: savedFile.uri },
          audioName: script.title,
        });
        // Open New Alarm modal
        router.push('/new-alarm');
      } catch (error) {
        console.error('Failed to save recording:', error);
        Alert.alert('Save Failed', 'Could not save the recording. Please try again.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleDiscard = () => {
    Alert.alert(
      'Discard Recording?',
      'Are you sure you want to discard this recording?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: discardRecording },
      ]
    );
  };

  const showControls = state === 'recorded' || state === 'playing';

  return (
    <View style={styles.fullScreenContainer}>
      <View style={styles.screenHeader}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <IconSymbol name="chevron.left.forwardslash.chevron.right" size={20} color={Colors.primary} />
          <Text style={styles.backText}>Scripts</Text>
        </Pressable>
        <Text style={styles.screenTitle}>Record</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scriptRecordScroll}
        contentContainerStyle={styles.scriptRecordContent}
      >
        {/* Script to read */}
        <View style={styles.scriptReadCard}>
          <Text style={styles.scriptReadTitle}>{script.title}</Text>
          <Text style={styles.scriptReadText}>{script.text}</Text>
        </View>

        {/* Recording controls */}
        <View style={styles.scriptRecordControls}>
          <Text style={styles.recordDuration}>{formatDuration(duration)}</Text>

          <Text style={styles.recordStatus}>
            {state === 'recording' ? 'Recording... Read the script above!' :
             state === 'recorded' ? 'Recording complete' :
             state === 'playing' ? 'Playing...' :
             'Tap to start recording'}
          </Text>

          <Pressable
            style={[
              styles.scriptRecordBtn,
              state === 'recording' && styles.scriptRecordBtnActive,
            ]}
            onPress={handleRecordPress}
          >
            <IconSymbol
              name={state === 'recording' ? 'stop.fill' : 'mic.fill'}
              size={36}
              color={Colors.card}
            />
          </Pressable>

          {showControls && (
            <Animated.View
              entering={FadeIn.duration(200)}
              style={styles.scriptControlsRow}
            >
              <Pressable style={styles.scriptControlBtn} onPress={handlePlayPress}>
                <IconSymbol
                  name={state === 'playing' ? 'pause.fill' : 'play.fill'}
                  size={24}
                  color={Colors.card}
                />
                <Text style={styles.scriptControlLabel}>
                  {state === 'playing' ? 'Pause' : 'Play'}
                </Text>
              </Pressable>

              <Pressable
                style={[styles.scriptControlBtn, styles.discardBtn]}
                onPress={handleDiscard}
              >
                <IconSymbol name="trash.fill" size={24} color={Colors.card} />
                <Text style={styles.scriptControlLabel}>Discard</Text>
              </Pressable>

              <Pressable
                style={[styles.scriptControlBtn, styles.saveBtn]}
                onPress={handleSave}
              >
                <IconSymbol name="checkmark" size={24} color={Colors.card} />
                <Text style={styles.scriptControlLabel}>Save</Text>
              </Pressable>
            </Animated.View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ============================================
// AI TTS SCREEN - Text to speech interface
// ============================================

// Voice sample audio files mapping
// Place sample audio files in: assets/audio/voices/
// Naming convention: {voiceId}-sample.mp3 (e.g., jen-sample.mp3)
const VOICE_SAMPLES: Record<string, any> = {
  'jen': require('../../assets/audio/voices/jen-sample.mp3'),
  'jessica': require('../../assets/audio/voices/jessica-sample.mp3'),
  'milo': require('../../assets/audio/voices/milo-sample.mp3'),
  'nathaniel': require('../../assets/audio/voices/nathaniel-sample.mp3'),
};

interface GeneratedAudio {
  uri: string;
  voiceName: string;
  text: string;
}

function AITTSScreen({ onBack }: { onBack: () => void }) {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<Voice>(VOICES[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<GeneratedAudio | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [savedAudios, setSavedAudios] = useState<SavedTTSAudio[]>([]);
  const soundRef = useRef<Audio.Sound | null>(null);
  const { setPendingSelection } = useAudioSelection();

  // Check if user has premium subscription
  const { isSubscribed } = useSubscription();

  const maxCharacters = 500;
  const charactersRemaining = maxCharacters - text.length;
  const canGenerate = text.trim().length >= 10 && selectedVoice && isSubscribed;

  // Load saved TTS audios on mount
  useEffect(() => {
    loadSavedAudios();
  }, []);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const loadSavedAudios = async () => {
    const audios = await getSavedTTSAudio();
    setSavedAudios(audios);
  };

  const stopCurrentAudio = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch (e) {
        // Ignore errors
      }
      soundRef.current = null;
    }
    setPlayingId(null);
  };

  const handlePlaySample = async (voice: Voice) => {
    await stopCurrentAudio();

    const sampleFile = VOICE_SAMPLES[voice.id];
    if (!sampleFile) {
      Alert.alert('Sample Not Available', 'Voice sample audio is not available yet.');
      return;
    }

    try {
      const { sound } = await Audio.Sound.createAsync(
        sampleFile,
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded && status.didJustFinish) {
            setPlayingId(null);
          }
        }
      );
      soundRef.current = sound;
      setPlayingId(`sample-${voice.id}`);
    } catch (error) {
      console.error('Failed to play sample:', error);
      Alert.alert('Playback Error', 'Failed to play voice sample.');
    }
  };

  const handlePlayGenerated = async () => {
    if (!generatedAudio) return;

    if (playingId === 'generated') {
      await stopCurrentAudio();
      return;
    }

    await stopCurrentAudio();

    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: generatedAudio.uri },
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded && status.didJustFinish) {
            setPlayingId(null);
          }
        }
      );
      soundRef.current = sound;
      setPlayingId('generated');
    } catch (error) {
      console.error('Failed to play generated audio:', error);
      Alert.alert('Playback Error', 'Failed to play generated audio.');
    }
  };

  const handlePlaySaved = async (audio: SavedTTSAudio) => {
    if (playingId === audio.id) {
      await stopCurrentAudio();
      return;
    }

    await stopCurrentAudio();

    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: audio.uri },
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded && status.didJustFinish) {
            setPlayingId(null);
          }
        }
      );
      soundRef.current = sound;
      setPlayingId(audio.id);
    } catch (error) {
      console.error('Failed to play saved audio:', error);
      Alert.alert('Playback Error', 'Failed to play audio.');
    }
  };

  const handleGenerate = async () => {
    if (!canGenerate) {
      Alert.alert('Text Too Short', 'Please enter at least 10 characters for your wake-up message.');
      return;
    }

    await stopCurrentAudio();
    setIsGenerating(true);
    setGeneratedAudio(null);

    try {
      const result = await generateTTS(selectedVoice.voiceId, text.trim());

      setGeneratedAudio({
        uri: result.uri,
        voiceName: result.voiceName,
        text: result.text,
      });

      // Save to history
      await saveTTSAudio({
        uri: result.uri,
        voiceId: result.voiceId,
        voiceName: result.voiceName,
        text: result.text,
        createdAt: result.createdAt,
      });

      await loadSavedAudios();
    } catch (error) {
      console.error('TTS generation failed:', error);
      Alert.alert(
        'Generation Failed',
        error instanceof Error ? error.message : 'Failed to generate audio. Please try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseAudio = (uri: string, voiceName: string) => {
    setPendingSelection({
      audioSource: { type: 'tts', uri },
      audioName: `AI Voice · ${voiceName}`,
    });
    router.push('/new-alarm');
  };

  const handleDeleteSaved = async (audio: SavedTTSAudio) => {
    Alert.alert(
      'Delete Audio',
      'Are you sure you want to delete this generated audio?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (playingId === audio.id) {
              await stopCurrentAudio();
            }
            await deleteTTSAudio(audio.id);
            await loadSavedAudios();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.fullScreenContainer}>
      <View style={styles.screenHeader}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <IconSymbol name="chevron.left.forwardslash.chevron.right" size={20} color={Colors.primary} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.screenTitle}>AI Voice</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.ttsScrollView}
        contentContainerStyle={styles.ttsContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Voice Selection Section */}
        <View style={styles.ttsSection}>
          <View style={styles.ttsSectionHeader}>
            <Text style={styles.ttsSectionTitle}>Select a Voice</Text>
            {!isSubscribed && <FullPlanBadge />}
          </View>
          <Text style={styles.ttsSectionSubtitle}>
            Tap a voice to select it, or tap the play button to hear a sample
          </Text>

          {VOICES.map((voice) => (
            <Pressable
              key={voice.id}
              style={[
                styles.voiceCard,
                selectedVoice.id === voice.id && styles.voiceCardSelected,
              ]}
              onPress={() => setSelectedVoice(voice)}
            >
              <View style={styles.voiceInfo}>
                <Text style={[
                  styles.voiceName,
                  selectedVoice.id === voice.id && styles.voiceNameSelected,
                ]}>
                  {voice.name}
                </Text>
                <Text style={[
                  styles.voiceDescription,
                  selectedVoice.id === voice.id && styles.voiceDescriptionSelected,
                ]}>
                  {voice.description}
                </Text>
              </View>
              <Pressable
                style={[
                  styles.voiceSampleBtn,
                  playingId === `sample-${voice.id}` && styles.voiceSampleBtnPlaying,
                ]}
                onPress={() => handlePlaySample(voice)}
              >
                <IconSymbol
                  name={playingId === `sample-${voice.id}` ? 'stop.fill' : 'play.fill'}
                  size={18}
                  color={playingId === `sample-${voice.id}` ? Colors.card : '#9B59B6'}
                />
              </Pressable>
            </Pressable>
          ))}
        </View>

        {/* Text Input Section */}
        <View style={styles.ttsSection}>
          <Text style={styles.ttsSectionTitle}>Your Message</Text>
          <Text style={styles.ttsSectionSubtitle}>
            Write what you want {selectedVoice.name} to say to wake you up
          </Text>
          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              value={text}
              onChangeText={(newText) => {
                if (newText.length <= maxCharacters) {
                  setText(newText);
                }
              }}
              placeholder="Good morning! It's time to rise and shine. Today is going to be an amazing day full of possibilities..."
              placeholderTextColor={Colors.textLight}
              multiline
              textAlignVertical="top"
            />
            <Text style={[
              styles.characterCount,
              charactersRemaining < 50 && styles.characterCountWarning,
            ]}>
              {charactersRemaining} characters remaining
            </Text>
          </View>
        </View>

        {/* Generate Button or Upgrade Prompt */}
        <View style={styles.ttsSection}>
          {isSubscribed ? (
            <>
              <Pressable
                style={[
                  styles.generateButton,
                  !(text.trim().length >= 10 && selectedVoice) && styles.generateButtonDisabled,
                  isGenerating && styles.generateButtonLoading,
                ]}
                onPress={handleGenerate}
                disabled={!(text.trim().length >= 10 && selectedVoice) || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <IconSymbol name="gear" size={24} color={Colors.card} />
                    <Text style={styles.generateButtonText}>Generating...</Text>
                  </>
                ) : (
                  <>
                    <IconSymbol name="waveform" size={24} color={Colors.card} />
                    <Text style={styles.generateButtonText}>Generate with {selectedVoice.name}</Text>
                  </>
                )}
              </Pressable>
              {!(text.trim().length >= 10 && selectedVoice) && (
                <Text style={styles.generateHint}>
                  Enter at least 10 characters to generate
                </Text>
              )}
            </>
          ) : (
            <UpgradeButton
              buttonText="Subscribe to Generate"
              subtitle="AI voice generation requires a Premium subscription"
            />
          )}
        </View>

        {/* Generated Audio Controls */}
        {generatedAudio && (
          <Animated.View
            entering={FadeIn.duration(200)}
            style={styles.ttsSection}
          >
            <Text style={styles.ttsSectionTitle}>Just Generated</Text>
            <View style={styles.audioPreviewCard}>
              <View style={styles.audioPreviewInfo}>
                <IconSymbol name="waveform" size={32} color="#9B59B6" />
                <View style={styles.audioPreviewText}>
                  <Text style={styles.audioPreviewTitle}>
                    {generatedAudio.voiceName}
                  </Text>
                  <Text style={styles.audioPreviewDuration} numberOfLines={1}>
                    "{generatedAudio.text.substring(0, 40)}..."
                  </Text>
                </View>
              </View>

              <View style={styles.audioControlsRow}>
                <Pressable
                  style={[styles.audioControlBtn, styles.playBtn]}
                  onPress={handlePlayGenerated}
                >
                  <IconSymbol
                    name={playingId === 'generated' ? 'stop.fill' : 'play.fill'}
                    size={24}
                    color={Colors.card}
                  />
                  <Text style={styles.audioControlLabel}>
                    {playingId === 'generated' ? 'Stop' : 'Play'}
                  </Text>
                </Pressable>

                <Pressable
                  style={[styles.audioControlBtn, styles.saveBtn]}
                  onPress={() => handleUseAudio(generatedAudio.uri, generatedAudio.voiceName)}
                >
                  <IconSymbol name="checkmark" size={24} color={Colors.card} />
                  <Text style={styles.audioControlLabel}>Use</Text>
                </Pressable>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Saved Audio History */}
        {savedAudios.length > 0 && (
          <View style={styles.ttsSection}>
            <Text style={styles.ttsSectionTitle}>Your Generated Audio</Text>
            <Text style={styles.ttsSectionSubtitle}>
              Previously generated audio you can use
            </Text>

            {savedAudios.map((audio) => (
              <View key={audio.id} style={styles.savedAudioCard}>
                <Pressable
                  style={styles.savedAudioInfo}
                  onPress={() => handlePlaySaved(audio)}
                >
                  <View style={[
                    styles.savedAudioIcon,
                    playingId === audio.id && styles.savedAudioIconPlaying,
                  ]}>
                    <IconSymbol
                      name={playingId === audio.id ? 'stop.fill' : 'play.fill'}
                      size={16}
                      color={playingId === audio.id ? Colors.card : '#9B59B6'}
                    />
                  </View>
                  <View style={styles.savedAudioText}>
                    <Text style={styles.savedAudioTitle}>{audio.voiceName}</Text>
                    <Text style={styles.savedAudioPreview} numberOfLines={1}>
                      "{audio.text.substring(0, 30)}..."
                    </Text>
                  </View>
                </Pressable>
                <View style={styles.savedAudioActions}>
                  <Pressable
                    style={styles.savedAudioUseBtn}
                    onPress={() => handleUseAudio(audio.uri, audio.voiceName)}
                  >
                    <Text style={styles.savedAudioUseBtnText}>Use</Text>
                  </Pressable>
                  <Pressable
                    style={styles.savedAudioDeleteBtn}
                    onPress={() => handleDeleteSaved(audio)}
                  >
                    <IconSymbol name="trash.fill" size={16} color={Colors.danger} />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
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
  selectionContent: {
    padding: Spacing.lg,
    paddingTop: Spacing.sm,
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

  // Full screen styles
  fullScreenContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingRight: Spacing.md,
  },
  backText: {
    fontFamily: 'Quicksand-Medium',
    fontSize: Typography.body.fontSize,
    color: Colors.primary,
    marginLeft: 4,
  },
  screenTitle: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: Typography.heading.fontSize,
    color: Colors.text,
  },
  headerSpacer: {
    width: 60,
  },

  // Record screen styles
  recordContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  bigDuration: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 72,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  statusText: {
    fontFamily: 'Quicksand-Medium',
    fontSize: Typography.body.fontSize,
    color: Colors.textLight,
    marginBottom: Spacing.xxl,
  },
  mainButtonContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  mainRecordButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.card,
  },
  buttonLabel: {
    fontFamily: 'Quicksand-Regular',
    fontSize: Typography.caption.fontSize,
    color: Colors.textLight,
    marginTop: Spacing.md,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  controlBtn: {
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    width: 72,
    height: 72,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    ...Shadows.button,
  },
  discardBtn: {
    backgroundColor: Colors.danger,
  },
  saveBtn: {
    backgroundColor: Colors.success,
  },
  controlLabel: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 11,
    color: Colors.card,
    marginTop: 4,
  },

  // Placeholder styles
  placeholderContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  placeholderTitle: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: Typography.heading.fontSize,
    color: Colors.text,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  placeholderText: {
    fontFamily: 'Quicksand-Regular',
    fontSize: Typography.body.fontSize,
    color: Colors.textLight,
    textAlign: 'center',
  },

  // Script screen - Category filter styles
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

  // Script screen - Script list styles
  scriptList: {
    flex: 1,
  },
  scriptListContent: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  scriptCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.card,
  },
  scriptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  scriptTitle: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: Typography.body.fontSize,
    color: Colors.text,
    flex: 1,
  },
  scriptDuration: {
    fontFamily: 'Quicksand-Regular',
    fontSize: Typography.caption.fontSize,
    color: Colors.textLight,
    marginLeft: Spacing.sm,
  },
  scriptPreview: {
    fontFamily: 'Quicksand-Regular',
    fontSize: Typography.caption.fontSize,
    color: Colors.textLight,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  scriptFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  categoryBadgeText: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 11,
    color: Colors.text,
  },

  // Script Record View styles
  scriptRecordScroll: {
    flex: 1,
  },
  scriptRecordContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  scriptReadCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    ...Shadows.card,
  },
  scriptReadTitle: {
    fontFamily: 'Quicksand-Bold',
    fontSize: Typography.heading.fontSize,
    color: Colors.text,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  scriptReadText: {
    fontFamily: 'Quicksand-Regular',
    fontSize: Typography.body.fontSize,
    color: Colors.text,
    lineHeight: 26,
    textAlign: 'center',
  },
  scriptRecordControls: {
    alignItems: 'center',
    paddingTop: Spacing.md,
  },
  recordDuration: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 48,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  recordStatus: {
    fontFamily: 'Quicksand-Medium',
    fontSize: Typography.caption.fontSize,
    color: Colors.textLight,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  scriptRecordBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.card,
  },
  scriptRecordBtnActive: {
    backgroundColor: Colors.danger,
  },
  scriptControlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  scriptControlBtn: {
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    width: 64,
    height: 64,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    ...Shadows.button,
  },
  scriptControlLabel: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 10,
    color: Colors.card,
    marginTop: 2,
  },

  // AI TTS Screen styles
  ttsScrollView: {
    flex: 1,
  },
  ttsContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl * 2,
  },
  ttsSection: {
    marginBottom: Spacing.xl,
  },
  ttsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  ttsSectionTitle: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: Typography.heading.fontSize,
    color: Colors.text,
  },
  ttsSectionSubtitle: {
    fontFamily: 'Quicksand-Regular',
    fontSize: Typography.caption.fontSize,
    color: Colors.textLight,
    marginBottom: Spacing.md,
  },
  ttsSubsectionTitle: {
    fontFamily: 'Quicksand-Medium',
    fontSize: Typography.body.fontSize,
    color: Colors.text,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  textInputContainer: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    ...Shadows.card,
  },
  textInput: {
    fontFamily: 'Quicksand-Regular',
    fontSize: Typography.body.fontSize,
    color: Colors.text,
    padding: Spacing.md,
    lineHeight: 24,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontFamily: 'Quicksand-Regular',
    fontSize: Typography.caption.fontSize,
    color: Colors.textLight,
    textAlign: 'right',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  characterCountWarning: {
    color: Colors.danger,
  },
  genderRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  genderOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 2,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  genderOptionActive: {
    backgroundColor: '#9B59B6',
    borderColor: '#9B59B6',
  },
  genderLabel: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: Typography.body.fontSize,
    color: Colors.text,
  },
  genderLabelActive: {
    color: Colors.card,
  },
  styleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  styleOption: {
    width: '48%',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  styleOptionActive: {
    backgroundColor: '#9B59B620',
    borderColor: '#9B59B6',
  },
  styleLabel: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: Typography.body.fontSize,
    color: Colors.text,
    marginBottom: 2,
  },
  styleLabelActive: {
    color: '#9B59B6',
  },
  styleDescription: {
    fontFamily: 'Quicksand-Regular',
    fontSize: Typography.caption.fontSize,
    color: Colors.textLight,
  },
  styleDescriptionActive: {
    color: '#9B59B6',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9B59B6',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
    ...Shadows.button,
  },
  generateButtonDisabled: {
    backgroundColor: Colors.textLight,
    opacity: 0.6,
  },
  generateButtonLoading: {
    backgroundColor: '#7D3C98',
  },
  generateButtonText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: Typography.body.fontSize,
    color: Colors.card,
  },
  generateHint: {
    fontFamily: 'Quicksand-Regular',
    fontSize: Typography.caption.fontSize,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  audioPreviewCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.card,
  },
  audioPreviewInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  audioPreviewText: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  audioPreviewTitle: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: Typography.body.fontSize,
    color: Colors.text,
  },
  audioPreviewDuration: {
    fontFamily: 'Quicksand-Regular',
    fontSize: Typography.caption.fontSize,
    color: Colors.textLight,
    marginTop: 2,
  },
  audioControlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  audioControlBtn: {
    alignItems: 'center',
    width: 72,
    height: 72,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    ...Shadows.button,
  },
  playBtn: {
    backgroundColor: '#9B59B6',
  },
  audioControlLabel: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 11,
    color: Colors.card,
    marginTop: 4,
  },

  // Voice selection card styles
  voiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  voiceCardSelected: {
    borderColor: '#9B59B6',
    backgroundColor: '#9B59B610',
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
  voiceNameSelected: {
    color: '#9B59B6',
  },
  voiceDescription: {
    fontFamily: 'Quicksand-Regular',
    fontSize: Typography.caption.fontSize,
    color: Colors.textLight,
    lineHeight: 18,
  },
  voiceDescriptionSelected: {
    color: '#7D3C98',
  },
  voiceSampleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#9B59B620',
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceSampleBtnPlaying: {
    backgroundColor: '#9B59B6',
  },

  // Saved audio card styles
  savedAudioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.card,
  },
  savedAudioInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  savedAudioIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#9B59B620',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  savedAudioIconPlaying: {
    backgroundColor: '#9B59B6',
  },
  savedAudioText: {
    flex: 1,
  },
  savedAudioTitle: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: Typography.caption.fontSize,
    color: Colors.text,
  },
  savedAudioPreview: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 11,
    color: Colors.textLight,
    marginTop: 2,
  },
  savedAudioActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  savedAudioUseBtn: {
    backgroundColor: '#9B59B6',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  savedAudioUseBtnText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 12,
    color: Colors.card,
  },
  savedAudioDeleteBtn: {
    padding: Spacing.xs,
  },
});
