import { useState, useRef, useEffect, useCallback } from 'react';
import { Audio, AVPlaybackStatus } from 'expo-av';

export type RecordingState = 'idle' | 'recording' | 'recorded' | 'playing';

interface UseAudioRecorderReturn {
  state: RecordingState;
  duration: number;
  recordingUri: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  playRecording: () => Promise<void>;
  stopPlayback: () => Promise<void>;
  discardRecording: () => Promise<void>;
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [state, setState] = useState<RecordingState>('idle');
  const [duration, setDuration] = useState(0);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  // Check permission on mount
  useEffect(() => {
    checkPermission();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync();
      }
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const checkPermission = async () => {
    try {
      const { status } = await Audio.getPermissionsAsync();
      setHasPermission(status === 'granted');
    } catch (e) {
      console.error('Error checking permission:', e);
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      const granted = status === 'granted';
      setHasPermission(granted);
      return granted;
    } catch (e) {
      console.error('Error requesting permission:', e);
      return false;
    }
  };

  const startRecording = useCallback(async () => {
    try {
      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) {
          console.log('Permission not granted');
          return;
        }
      }

      // Stop and unload any current sound
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      // Stop any existing recording
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = null;
      }

      console.log('Setting audio mode for recording...');
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      console.log('Creating recording...');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      setDuration(0);
      setRecordingUri(null);
      setState('recording');

      startTimeRef.current = Date.now();
      durationIntervalRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 100);

      console.log('Recording started');
    } catch (error) {
      console.error('Failed to start recording:', error);
      setState('idle');
    }
  }, [hasPermission]);

  const stopRecording = useCallback(async () => {
    // Stop duration timer
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    if (!recordingRef.current) {
      console.warn('No recording to stop');
      setState('idle');
      return;
    }

    console.log('Stopping recording...');

    try {
      await recordingRef.current.stopAndUnloadAsync();

      // Disable recording mode to allow playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      const uri = recordingRef.current.getURI();
      console.log('Recording stopped. URI:', uri);

      if (uri) {
        setRecordingUri(uri);
        setState('recorded');
      } else {
        console.warn('No URI available after stopping recording');
        setState('idle');
      }

      recordingRef.current = null;
    } catch (error) {
      console.error('Error stopping recording:', error);
      setState('idle');
    }
  }, []);

  const playRecording = useCallback(async () => {
    if (!recordingUri) {
      console.warn('No recording to play');
      return;
    }

    console.log('Playing recording:', recordingUri);

    try {
      // Unload previous sound if exists
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      // Configure audio mode for playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      console.log('Creating sound...');

      // Create and load the sound
      const { sound, status } = await Audio.Sound.createAsync(
        { uri: recordingUri },
        { shouldPlay: true },
        (playbackStatus: AVPlaybackStatus) => {
          if (!playbackStatus.isLoaded) {
            if (playbackStatus.error) {
              console.error('Playback error:', playbackStatus.error);
            }
            return;
          }
          if (playbackStatus.didJustFinish) {
            console.log('Playback finished');
            setState('recorded');
          }
        }
      );

      console.log('Sound created, status:', JSON.stringify(status));

      soundRef.current = sound;
      setState('playing');
      console.log('Playing!');

    } catch (error) {
      console.error('Error playing recording:', error);
      setState('recorded');
    }
  }, [recordingUri]);

  const stopPlayback = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
    }
    setState('recorded');
  }, []);

  const discardRecording = useCallback(async () => {
    console.log('Discarding recording');
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    if (recordingRef.current) {
      await recordingRef.current.stopAndUnloadAsync();
      recordingRef.current = null;
    }
    setRecordingUri(null);
    setDuration(0);
    setState('idle');
  }, []);

  return {
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
  };
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
