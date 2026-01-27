import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Audio } from 'expo-av';

import { Colors, Spacing, BorderRadius, Typography, Shadows } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAlarms } from '@/context/AlarmContext';
import { useAudioSelection } from '@/context/AudioSelectionContext';
import { DEFAULT_ALARM, DayOfWeek, AudioSource } from '@/types/alarm';

const DAYS: { key: DayOfWeek; label: string }[] = [
  { key: 'sun', label: 'S' },
  { key: 'mon', label: 'M' },
  { key: 'tue', label: 'T' },
  { key: 'wed', label: 'W' },
  { key: 'thu', label: 'T' },
  { key: 'fri', label: 'F' },
  { key: 'sat', label: 'S' },
];

// Template audio files mapping
// Place audio files in: assets/audio/templates/
// Format: {templateId}.mp3 (e.g., gentle-sunrise.mp3, morning-birds.mp3)
// Note: require() calls must be static, so we map template IDs to assets
const TEMPLATE_AUDIO_FILES: Record<string, any> = {
  // These will be populated when audio files are added
  // Example: 'gentle-sunrise': require('../assets/audio/templates/gentle-sunrise.mp3'),
};

export default function NewAlarmScreen() {
  const { addAlarm } = useAlarms();
  const {
    pendingSelection,
    clearPendingSelection,
    draftAlarmState,
    saveDraftAlarmState,
    clearDraftAlarmState,
  } = useAudioSelection();

  // Initialize with current time rounded to next 5 minutes
  const getDefaultTime = () => {
    const now = new Date();
    now.setMinutes(Math.ceil(now.getMinutes() / 5) * 5, 0, 0);
    return now;
  };

  const [time, setTime] = useState(getDefaultTime);
  const [label, setLabel] = useState('');
  const [repeatDays, setRepeatDays] = useState<DayOfWeek[]>([]);
  const [audioSource, setAudioSource] = useState<AudioSource>({ type: 'default' });
  const [audioName, setAudioName] = useState<string>('Default Sound');
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const initializedRef = useRef(false);

  // Restore draft state and pending audio on mount
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Restore draft alarm state if returning from audio selection
    if (draftAlarmState) {
      setTime(new Date(draftAlarmState.time));
      setLabel(draftAlarmState.label);
      setRepeatDays(draftAlarmState.repeatDays as DayOfWeek[]);
      clearDraftAlarmState();
    }

    // Apply pending audio selection
    if (pendingSelection) {
      setAudioSource(pendingSelection.audioSource);
      setAudioName(pendingSelection.audioName);
      clearPendingSelection();
    }
  }, [draftAlarmState, pendingSelection, clearDraftAlarmState, clearPendingSelection]);

  // Cleanup sound on unmount
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const handleTimeChange = (_: any, selectedTime?: Date) => {
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  const toggleDay = (day: DayOfWeek) => {
    setRepeatDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handlePlayPreview = async () => {
    if (isPlaying && soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
      setIsPlaying(false);
      return;
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      let audioToPlay: { uri: string } | number | null = null;

      // Determine audio source
      if (audioSource.uri && audioSource.uri.startsWith('file://')) {
        // For recordings (file:// URIs)
        audioToPlay = { uri: audioSource.uri };
      } else if (audioSource.templateId && TEMPLATE_AUDIO_FILES[audioSource.templateId]) {
        // For template audio (bundled assets via require())
        audioToPlay = TEMPLATE_AUDIO_FILES[audioSource.templateId];
      }

      if (!audioToPlay) {
        console.log('No audio to preview (default sound or missing template file)');
        return;
      }

      const { sound } = await Audio.Sound.createAsync(
        audioToPlay,
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlaying(false);
          }
        }
      );
      soundRef.current = sound;
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing preview:', error);
      setIsPlaying(false);
    }
  };

  const handleChangeSound = () => {
    // Save current alarm state before navigating
    saveDraftAlarmState({
      time: time,
      label: label,
      repeatDays: repeatDays,
    });
    // Navigate to Create tab (modal will be dismissed)
    router.replace('/(tabs)/create');
  };

  const handleSave = async () => {
    await addAlarm({
      ...DEFAULT_ALARM,
      hour: time.getHours(),
      minute: time.getMinutes(),
      label: label.trim() || 'Alarm',
      repeatDays,
      audioSource,
    });

    // Stop any playing audio
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
    }

    router.back();
  };

  const handleCancel = async () => {
    // Stop any playing audio
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
    }
    router.back();
  };

  const getAudioIcon = (): 'mic.fill' | 'waveform' | 'rectangle.stack.fill' | 'bell.fill' => {
    switch (audioSource.type) {
      case 'recording': return 'mic.fill';
      case 'tts': return 'waveform';
      case 'template': return 'rectangle.stack.fill';
      default: return 'bell.fill';
    }
  };

  const getAudioColor = (): string => {
    switch (audioSource.type) {
      case 'recording': return Colors.primary;
      case 'tts': return '#9B59B6';
      case 'template': return Colors.secondary;
      default: return Colors.textLight;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={handleCancel} style={styles.headerButton}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
        <Text style={styles.headerTitle}>New Alarm</Text>
        <Pressable onPress={handleSave} style={styles.headerButton}>
          <Text style={styles.saveText}>Save</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Time Picker */}
        <View style={styles.timePickerContainer}>
          <DateTimePicker
            value={time}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleTimeChange}
            style={styles.timePicker}
            textColor={Colors.text}
          />
        </View>

        {/* Label Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Label</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={label}
              onChangeText={setLabel}
              placeholder="Alarm"
              placeholderTextColor={Colors.textLight}
              maxLength={30}
            />
          </View>
        </View>

        {/* Sound Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sound</Text>
          <View style={styles.soundCard}>
            <View style={styles.soundInfo}>
              <View style={[styles.soundIcon, { backgroundColor: getAudioColor() + '20' }]}>
                <IconSymbol name={getAudioIcon()} size={24} color={getAudioColor()} />
              </View>
              <View style={styles.soundDetails}>
                <Text style={styles.soundName}>{audioName}</Text>
                <Text style={styles.soundType}>
                  {audioSource.type === 'recording' ? 'Custom Recording' :
                   audioSource.type === 'tts' ? 'AI Generated' :
                   audioSource.type === 'template' ? 'Template' :
                   'System Default'}
                </Text>
              </View>
            </View>
            <View style={styles.soundActions}>
              {audioSource.type !== 'default' && (
                <Pressable
                  style={[styles.soundActionBtn, isPlaying && styles.soundActionBtnActive]}
                  onPress={handlePlayPreview}
                >
                  <IconSymbol
                    name={isPlaying ? 'stop.fill' : 'play.fill'}
                    size={18}
                    color={Colors.card}
                  />
                </Pressable>
              )}
              <Pressable style={styles.changeBtn} onPress={handleChangeSound}>
                <Text style={styles.changeBtnText}>Change</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Repeat Days */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Repeat</Text>
          <View style={styles.daysContainer}>
            {DAYS.map(({ key, label: dayLabel }) => (
              <Pressable
                key={key}
                style={[
                  styles.dayButton,
                  repeatDays.includes(key) && styles.dayButtonActive,
                ]}
                onPress={() => toggleDay(key)}
              >
                <Text
                  style={[
                    styles.dayText,
                    repeatDays.includes(key) && styles.dayTextActive,
                  ]}
                >
                  {dayLabel}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.repeatHint}>
            {repeatDays.length === 0
              ? 'One time alarm'
              : repeatDays.length === 7
              ? 'Every day'
              : `${repeatDays.length} days selected`}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  headerTitle: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: Typography.heading.fontSize,
    color: Colors.text,
  },
  cancelText: {
    fontFamily: 'Quicksand-Medium',
    fontSize: Typography.body.fontSize,
    color: Colors.textLight,
  },
  saveText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: Typography.body.fontSize,
    color: Colors.primary,
  },
  content: {
    flex: 1,
  },
  timePickerContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.card,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.card,
  },
  timePicker: {
    height: 180,
    width: '100%',
  },
  section: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: Typography.body.fontSize,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    ...Shadows.card,
  },
  input: {
    fontFamily: 'Quicksand-Regular',
    fontSize: Typography.body.fontSize,
    color: Colors.text,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  // Sound selection styles
  soundCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.card,
  },
  soundInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  soundIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  soundDetails: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  soundName: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: Typography.body.fontSize,
    color: Colors.text,
  },
  soundType: {
    fontFamily: 'Quicksand-Regular',
    fontSize: Typography.caption.fontSize,
    color: Colors.textLight,
    marginTop: 2,
  },
  soundActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  soundActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  soundActionBtnActive: {
    backgroundColor: Colors.danger,
  },
  changeBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
  },
  changeBtnText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: Typography.caption.fontSize,
    color: Colors.card,
  },
  // Days styles
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    ...Shadows.card,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  dayButtonActive: {
    backgroundColor: Colors.primary,
  },
  dayText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: Typography.body.fontSize,
    color: Colors.textLight,
  },
  dayTextActive: {
    color: Colors.card,
  },
  repeatHint: {
    fontFamily: 'Quicksand-Regular',
    fontSize: Typography.caption.fontSize,
    color: Colors.textLight,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
});
