import { useState, useRef, useEffect, useCallback } from 'react';
import {
  useAudioRecorder as useExpoAudioRecorder,
  AudioModule,
  RecordingPresets,
  useAudioPlayer,
} from 'expo-audio';

export type RecordingState = 'idle' | 'recording' | 'recorded' | 'playing';

interface UseAudioRecorderReturn {
  state: RecordingState;
  duration: number;
  recordingUri: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  playRecording: () => void;
  stopPlayback: () => void;
  discardRecording: () => void;
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [state, setState] = useState<RecordingState>('idle');
  const [duration, setDuration] = useState(0);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const checkUriIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Use expo-audio recorder hook
  const recorder = useExpoAudioRecorder(RecordingPresets.HIGH_QUALITY);

  // Create player only when we have a URI
  const player = useAudioPlayer(recordingUri ? { uri: recordingUri } : null);

  // Check permission on mount
  useEffect(() => {
    checkPermission();
  }, []);

  // Listen for player completion
  useEffect(() => {
    if (player && state === 'playing') {
      const interval = setInterval(() => {
        if (!player.playing && state === 'playing') {
          setState('recorded');
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, [player, state]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      if (checkUriIntervalRef.current) {
        clearInterval(checkUriIntervalRef.current);
      }
    };
  }, []);

  const checkPermission = async () => {
    try {
      const status = await AudioModule.getRecordingPermissionsAsync();
      setHasPermission(status.granted);
    } catch (e) {
      console.error('Error checking permission:', e);
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    try {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      setHasPermission(status.granted);
      return status.granted;
    } catch (e) {
      console.error('Error requesting permission:', e);
      return false;
    }
  };

  const startRecording = useCallback(async () => {
    try {
      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) return;
      }

      // Enable recording mode on iOS
      await AudioModule.setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      setDuration(0);
      setRecordingUri(null);

      recorder.record();
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
  }, [hasPermission, recorder]);

  const stopRecording = useCallback(async () => {
    // Stop duration timer
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    console.log('Stopping recording...');
    recorder.stop();

    // Disable recording mode to allow playback
    await AudioModule.setAudioModeAsync({
      allowsRecording: false,
    });

    // Poll for the URI to become available
    let attempts = 0;
    checkUriIntervalRef.current = setInterval(() => {
      attempts++;
      console.log(`Checking for URI (attempt ${attempts}):`, recorder.uri);

      if (recorder.uri) {
        console.log('Got URI:', recorder.uri);
        setRecordingUri(recorder.uri);
        setState('recorded');
        if (checkUriIntervalRef.current) {
          clearInterval(checkUriIntervalRef.current);
          checkUriIntervalRef.current = null;
        }
      } else if (attempts > 20) {
        // Give up after 2 seconds
        console.warn('Failed to get recording URI');
        setState('idle');
        if (checkUriIntervalRef.current) {
          clearInterval(checkUriIntervalRef.current);
          checkUriIntervalRef.current = null;
        }
      }
    }, 100);
  }, [recorder]);

  const playRecording = useCallback(() => {
    if (!recordingUri || !player) {
      console.warn('No recording to play', { recordingUri, hasPlayer: !!player });
      return;
    }

    console.log('Playing recording:', recordingUri);
    player.seekTo(0);
    player.play();
    setState('playing');
  }, [recordingUri, player]);

  const stopPlayback = useCallback(() => {
    if (player) {
      player.pause();
      setState('recorded');
    }
  }, [player]);

  const discardRecording = useCallback(() => {
    console.log('Discarding recording');
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
