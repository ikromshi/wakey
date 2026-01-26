/**
 * Alarm-related type definitions
 */

// Days of the week for repeat scheduling
export type DayOfWeek = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';

// Audio source types
export type AudioSourceType =
  | 'recording'    // User recorded audio
  | 'tts'          // AI-generated text-to-speech
  | 'template'     // Pre-made template from library
  | 'default';     // Default system sound

// TTS voice configuration
export interface TTSVoiceConfig {
  gender: 'male' | 'female';
  temperature: 'calm' | 'neutral' | 'motivating';
}

// Audio source information
export interface AudioSource {
  type: AudioSourceType;
  // Local file URI for recordings/downloaded TTS
  uri?: string;
  // Template ID if using a template
  templateId?: string;
  // Original text for TTS-generated audio
  ttsText?: string;
  // Voice config for TTS
  ttsVoiceConfig?: TTSVoiceConfig;
}

// Main Alarm type
export interface Alarm {
  id: string;
  // Time in 24h format (hours and minutes)
  hour: number;        // 0-23
  minute: number;      // 0-59
  // User-friendly label
  label: string;
  // Whether alarm is active
  enabled: boolean;
  // Days to repeat (empty = one-time alarm)
  repeatDays: DayOfWeek[];
  // Audio configuration
  audioSource: AudioSource;
  // Snooze settings
  snoozeEnabled: boolean;
  snoozeDurationMinutes: number;
  // Timestamps
  createdAt: number;
  updatedAt: number;
}

// For creating a new alarm (id and timestamps auto-generated)
export type CreateAlarmInput = Omit<Alarm, 'id' | 'createdAt' | 'updatedAt'>;

// For updating an alarm (all fields optional except id)
export type UpdateAlarmInput = Partial<Omit<Alarm, 'id' | 'createdAt' | 'updatedAt'>> & { id: string };

// Helper to format time for display
export function formatAlarmTime(hour: number, minute: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  const displayMinute = minute.toString().padStart(2, '0');
  return `${displayHour}:${displayMinute} ${period}`;
}

// Helper to get next alarm time as Date
export function getNextAlarmDate(alarm: Alarm): Date {
  const now = new Date();
  const alarmDate = new Date();
  alarmDate.setHours(alarm.hour, alarm.minute, 0, 0);

  // If alarm time has passed today, move to tomorrow
  if (alarmDate <= now) {
    alarmDate.setDate(alarmDate.getDate() + 1);
  }

  // If repeat days are set, find the next matching day
  if (alarm.repeatDays.length > 0) {
    const dayMap: Record<DayOfWeek, number> = {
      sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6
    };
    const repeatDayNumbers = alarm.repeatDays.map(d => dayMap[d]);

    while (!repeatDayNumbers.includes(alarmDate.getDay())) {
      alarmDate.setDate(alarmDate.getDate() + 1);
    }
  }

  return alarmDate;
}

// Default values for new alarms
export const DEFAULT_ALARM: Omit<Alarm, 'id' | 'createdAt' | 'updatedAt'> = {
  hour: 7,
  minute: 0,
  label: 'Alarm',
  enabled: true,
  repeatDays: [],
  audioSource: { type: 'default' },
  snoozeEnabled: true,
  snoozeDurationMinutes: 5,
};
