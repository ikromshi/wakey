import DateTimePicker from '@react-native-community/datetimepicker';
import { Audio } from 'expo-av';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/theme';
import { useAlarms } from '@/context/AlarmContext';
import { useAudioSelection } from '@/context/AudioSelectionContext';
import { AudioSource, DEFAULT_ALARM, DayOfWeek } from '@/types/alarm';
import { TEMPLATES } from '@/data/templates';

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
  'motivational-start': require('../assets/audio/templates/motivational-start.mp3'),
  'calm-awakening': require('../assets/audio/templates/calm-awakening.mp3'),
  'positive-affirmations': require('../assets/audio/templates/positive-affirmations.mp3'),
  'mindful-morning': require('../assets/audio/templates/mindful-morning.mp3'),
  'energy-boost': require('../assets/audio/templates/energy-boost.mp3'),
  'rich-mindset': require('../assets/audio/templates/rich-mindset.mp3'),
};

export default function NewAlarmScreen() {
  const { alarmId } = useLocalSearchParams<{ alarmId?: string }>();
  const { alarms, addAlarm, updateAlarm } = useAlarms();
  const {
    pendingSelection,
    clearPendingSelection,
    draftAlarmState,
    saveDraftAlarmState,
    clearDraftAlarmState,
  } = useAudioSelection();

  const isEditing = !!alarmId;
  const existingAlarm = isEditing ? alarms.find(a => a.id === alarmId) : null;

  // Initialize with current time rounded to next 5 minutes
  const getDefaultTime = () => {
    const now = new Date();
    now.setMinutes(Math.ceil(now.getMinutes() / 5) * 5, 0, 0);
    return now;
  };

  // Helper to get audio name from source
  const getAudioNameFromSource = (source: AudioSource): string => {
    if (source.type === 'default') return 'Default Sound';
    if (source.type === 'recording') return 'Custom Recording';
    if (source.type === 'tts') return 'AI Generated';
    if (source.type === 'template' && source.templateId) {
      const template = TEMPLATES.find(t => t.id === source.templateId);
      return template?.title || 'Template';
    }
    return 'Default Sound';
  };

  const [time, setTime] = useState(() => {
    if (existingAlarm) {
      const t = new Date();
      t.setHours(existingAlarm.hour, existingAlarm.minute, 0, 0);
      return t;
    }
    return getDefaultTime();
  });
  const [label, setLabel] = useState(existingAlarm?.label || '');
  const [repeatDays, setRepeatDays] = useState<DayOfWeek[]>(existingAlarm?.repeatDays || []);
  const [audioSource, setAudioSource] = useState<AudioSource>(existingAlarm?.audioSource || { type: 'default' });
  const [audioName, setAudioName] = useState<string>(() => {
    if (existingAlarm?.audioSource) {
      return getAudioNameFromSource(existingAlarm.audioSource);
    }
    return 'Default Sound';
  });
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
      console.log('Applying pending selection:', JSON.stringify(pendingSelection));
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
    console.log('handlePlayPreview called');
    console.log('audioSource:', JSON.stringify(audioSource));
    console.log('audioSource.templateId:', audioSource.templateId);
    console.log('TEMPLATE_AUDIO_FILES keys:', Object.keys(TEMPLATE_AUDIO_FILES));

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
        console.log('Playing recording from URI:', audioSource.uri);
        audioToPlay = { uri: audioSource.uri };
      } else if (audioSource.templateId && TEMPLATE_AUDIO_FILES[audioSource.templateId]) {
        // For template audio (bundled assets via require())
        console.log('Playing template:', audioSource.templateId);
        audioToPlay = TEMPLATE_AUDIO_FILES[audioSource.templateId];
      }

      if (!audioToPlay) {
        console.log('No audio to preview (default sound or missing template file)');
        console.log('audioSource.templateId:', audioSource.templateId);
        console.log('Has template?:', !!TEMPLATE_AUDIO_FILES[audioSource.templateId || '']);
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
    // Stop any playing audio
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
    }

    if (isEditing && existingAlarm) {
      // Update existing alarm
      await updateAlarm({
        id: alarmId!,
        hour: time.getHours(),
        minute: time.getMinutes(),
        label: label.trim() || 'Alarm',
        repeatDays,
        audioSource,
      });
    } else {
      // Create new alarm
      await addAlarm({
        ...DEFAULT_ALARM,
        hour: time.getHours(),
        minute: time.getMinutes(),
        label: label.trim() || 'Alarm',
        repeatDays,
        audioSource,
      });
    }

    // Navigate to Alarms tab
    router.replace('/(tabs)');
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
        <Text style={styles.headerTitle}>{isEditing ? 'Edit Alarm' : 'New Alarm'}</Text>
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
