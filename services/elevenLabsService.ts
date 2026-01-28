import Constants from 'expo-constants';
import { Paths, File, Directory } from 'expo-file-system/next';

// Voice configuration
export interface Voice {
  id: string;
  voiceId: string;
  name: string;
  description: string;
  sampleFile: string;
  speed: number;
}

export const VOICES: Voice[] = [
  {
    id: 'nathaniel',
    voiceId: 'AeRdCCKzvd23BpJoofzx',
    name: 'Nathaniel',
    description: 'A deep, mysterious, yet comforting British accent for a reflective and calm awakening.',
    sampleFile: 'nathaniel-sample.mp3',
    speed: 1.0
  },
  {
    id: 'jessica',
    voiceId: 'Y4SxZRpAUjgjFSmjHhym',
    name: 'Jessica',
    description: 'Very calm and easy to listen to. A quiet, "garden-soft" voice for a low-stress wake-up.',
    sampleFile: 'jessica-sample.mp3',
    speed: 0.80
  },
  {
    id: 'milo',
    voiceId: 'GUDYcgRAONiI1nXDcNQQ',
    name: 'Milo',
    description: 'A relaxed American male voice designed for mindfulness and a steady, grounding morning.',
    sampleFile: 'milo-sample.mp3',
    speed: 1.0
  },
  {
    id: 'jen',
    voiceId: 'HzVnxqtdk9eqrcwfxD57',
    name: 'Jen',
    description: 'A soothing British voice, perfect for a gentle and peaceful start to your day.',
    sampleFile: 'jen-sample.mp3',
    speed: 1.0
  },
];

// TTS generation settings
const TTS_MODEL = 'eleven_turbo_v2_5';
const OUTPUT_FORMAT = 'mp3_44100_128';

// Get API key from config
function getApiKey(): string {
  const apiKey = Constants.expoConfig?.extra?.elevenlabsApiKey;
  if (!apiKey) {
    throw new Error('ElevenLabs API key not configured. Add EXPO_PUBLIC_ELEVENLABS_API_KEY to your .env file.');
  }
  return apiKey;
}

// Generate TTS audio
export interface TTSGenerationResult {
  uri: string;
  voiceId: string;
  voiceName: string;
  text: string;
  createdAt: number;
}

export async function generateTTS(
  voiceId: string,
  text: string
): Promise<TTSGenerationResult> {
  const apiKey = getApiKey();
  const voice = VOICES.find(v => v.voiceId === voiceId);

  if (!voice) {
    throw new Error('Invalid voice ID');
  }

  // ElevenLabs API endpoint for text-to-speech
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
    },
    body: JSON.stringify({
      text,
      model_id: TTS_MODEL,
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true,
        speed: voice.speed
      },
      output_format: OUTPUT_FORMAT
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('ElevenLabs API error:', errorText);
    throw new Error(`TTS generation failed: ${response.status}`);
  }

  // Get audio data as blob
  const audioBlob = await response.blob();

  // Convert blob to base64
  const reader = new FileReader();
  const base64Data = await new Promise<string>((resolve, reject) => {
    reader.onloadend = () => {
      const base64 = reader.result as string;
      // Remove the data URL prefix
      const base64Content = base64.split(',')[1];
      resolve(base64Content);
    };
    reader.onerror = reject;
    reader.readAsDataURL(audioBlob);
  });

  // Create directory if it doesn't exist
  const ttsDir = new Directory(Paths.document, 'tts');
  if (!ttsDir.exists) {
    ttsDir.create();
  }

  // Save to file
  const timestamp = Date.now();
  const filename = `tts_${voice.id}_${timestamp}.mp3`;
  const file = new File(ttsDir, filename);

  // Write base64 data to file
  file.write(base64Data, { encoding: 'base64' });

  const fileUri = file.uri;
  console.log('TTS audio saved to:', fileUri);

  return {
    uri: fileUri,
    voiceId: voice.voiceId,
    voiceName: voice.name,
    text,
    createdAt: timestamp,
  };
}

// Get voice by ID
export function getVoiceById(voiceId: string): Voice | undefined {
  return VOICES.find(v => v.voiceId === voiceId);
}

// Get voice by internal ID
export function getVoiceByInternalId(id: string): Voice | undefined {
  return VOICES.find(v => v.id === id);
}
