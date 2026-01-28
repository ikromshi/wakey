import AsyncStorage from '@react-native-async-storage/async-storage';
import { File } from 'expo-file-system/next';

const TTS_HISTORY_KEY = '@rise_alarm/tts_history';

export interface SavedTTSAudio {
  id: string;
  uri: string;
  voiceId: string;
  voiceName: string;
  text: string;
  createdAt: number;
}

// Get all saved TTS audio
export async function getSavedTTSAudio(): Promise<SavedTTSAudio[]> {
  try {
    const stored = await AsyncStorage.getItem(TTS_HISTORY_KEY);
    if (stored) {
      const items = JSON.parse(stored) as SavedTTSAudio[];
      // Verify files still exist
      const validItems: SavedTTSAudio[] = [];
      for (const item of items) {
        const file = new File(item.uri);
        if (file.exists) {
          validItems.push(item);
        }
      }
      // Update storage if some files were removed
      if (validItems.length !== items.length) {
        await AsyncStorage.setItem(TTS_HISTORY_KEY, JSON.stringify(validItems));
      }
      return validItems;
    }
    return [];
  } catch (error) {
    console.error('Failed to load TTS history:', error);
    return [];
  }
}

// Save a new TTS audio to history
export async function saveTTSAudio(audio: Omit<SavedTTSAudio, 'id'>): Promise<SavedTTSAudio> {
  const history = await getSavedTTSAudio();

  const newItem: SavedTTSAudio = {
    ...audio,
    id: `tts_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
  };

  const updatedHistory = [newItem, ...history];
  await AsyncStorage.setItem(TTS_HISTORY_KEY, JSON.stringify(updatedHistory));

  console.log('TTS audio saved to history:', newItem.id);
  return newItem;
}

// Delete a TTS audio from history
export async function deleteTTSAudio(id: string): Promise<void> {
  const history = await getSavedTTSAudio();
  const item = history.find(h => h.id === id);

  if (item) {
    // Delete the file
    try {
      const file = new File(item.uri);
      if (file.exists) {
        file.delete();
      }
    } catch (error) {
      console.error('Failed to delete TTS file:', error);
    }
  }

  const updatedHistory = history.filter(h => h.id !== id);
  await AsyncStorage.setItem(TTS_HISTORY_KEY, JSON.stringify(updatedHistory));
}

// Clear all TTS history
export async function clearTTSHistory(): Promise<void> {
  const history = await getSavedTTSAudio();

  // Delete all files
  for (const item of history) {
    try {
      const file = new File(item.uri);
      if (file.exists) {
        file.delete();
      }
    } catch (error) {
      console.error('Failed to delete TTS file:', error);
    }
  }

  await AsyncStorage.removeItem(TTS_HISTORY_KEY);
}
