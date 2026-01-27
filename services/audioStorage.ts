/**
 * Audio file storage service
 * Handles saving, loading, and deleting audio files to persistent storage
 */

import { Paths, File, Directory } from 'expo-file-system';

// Supported audio types
export type AudioType = 'recording' | 'tts' | 'template';

interface AudioFileInfo {
  uri: string;
  filename: string;
  type: AudioType;
  createdAt: number;
  sizeBytes?: number;
}

// Get or create the audio directory
function getAudioDirectory(): Directory {
  const audioDir = new Directory(Paths.document, 'audio');
  if (!audioDir.exists) {
    audioDir.create();
    console.log('Created audio directory:', audioDir.uri);
  }
  return audioDir;
}

/**
 * Generate a unique filename for an audio file
 */
function generateFilename(type: AudioType, extension: string = 'm4a'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${type}_${timestamp}_${random}.${extension}`;
}

/**
 * Save an audio file from a temporary URI to persistent storage
 * @param tempUri - The temporary URI of the recorded audio
 * @param type - The type of audio (recording, tts, template)
 * @returns The permanent URI and file info
 */
export async function saveAudioFile(
  tempUri: string,
  type: AudioType
): Promise<AudioFileInfo> {
  const audioDir = getAudioDirectory();

  // Determine file extension from source URI
  const extension = tempUri.split('.').pop() || 'm4a';
  const filename = generateFilename(type, extension);

  // Create source and destination file references
  const sourceFile = new File(tempUri);
  const destFile = new File(audioDir, filename);

  console.log(`Saving audio file from ${tempUri} to ${destFile.uri}`);

  // Copy file to permanent location
  sourceFile.copy(destFile);

  const audioInfo: AudioFileInfo = {
    uri: destFile.uri,
    filename,
    type,
    createdAt: Date.now(),
    sizeBytes: destFile.exists && destFile.size ? destFile.size : undefined,
  };

  console.log('Audio file saved:', audioInfo);
  return audioInfo;
}

/**
 * Delete an audio file from storage
 * @param uri - The URI of the audio file to delete
 */
export async function deleteAudioFile(uri: string): Promise<void> {
  try {
    const file = new File(uri);
    if (file.exists) {
      file.delete();
      console.log('Deleted audio file:', uri);
    }
  } catch (error) {
    console.error('Error deleting audio file:', error);
  }
}

/**
 * List all saved audio files
 */
export async function listAudioFiles(): Promise<AudioFileInfo[]> {
  const audioDir = getAudioDirectory();
  const audioFiles: AudioFileInfo[] = [];

  if (!audioDir.exists) {
    return audioFiles;
  }

  const contents = audioDir.list();

  for (const item of contents) {
    if (item instanceof File) {
      const filename = item.name;
      // Parse type from filename (format: type_timestamp_random.ext)
      const parts = filename.split('_');
      const type = (parts[0] as AudioType) || 'recording';
      const timestamp = parseInt(parts[1]) || Date.now();

      audioFiles.push({
        uri: item.uri,
        filename,
        type,
        createdAt: timestamp,
        sizeBytes: item.size || undefined,
      });
    }
  }

  // Sort by creation time (newest first)
  return audioFiles.sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Get the total size of all stored audio files
 */
export async function getStorageUsage(): Promise<number> {
  const files = await listAudioFiles();
  return files.reduce((total, file) => total + (file.sizeBytes || 0), 0);
}

/**
 * Check if an audio file exists
 */
export async function audioFileExists(uri: string): Promise<boolean> {
  const file = new File(uri);
  return file.exists;
}

/**
 * Clean up orphaned audio files that are not referenced by any alarm
 * @param activeUris - Array of URIs that are still in use
 */
export async function cleanupOrphanedFiles(activeUris: string[]): Promise<number> {
  const allFiles = await listAudioFiles();
  let deletedCount = 0;

  for (const file of allFiles) {
    if (!activeUris.includes(file.uri)) {
      await deleteAudioFile(file.uri);
      deletedCount++;
    }
  }

  if (deletedCount > 0) {
    console.log(`Cleaned up ${deletedCount} orphaned audio files`);
  }

  return deletedCount;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
