/**
 * Alarm scheduling service using Notifee
 * Handles scheduling, canceling, and managing alarm notifications
 *
 * Note: Notifee requires native modules. In Expo Go, scheduling is simulated.
 * For full functionality, build with `npx expo prebuild` or use EAS Build.
 */

import { Alarm, getNextAlarmDate, formatAlarmTime, DayOfWeek } from '@/types/alarm';

// Channel ID for alarm notifications
const ALARM_CHANNEL_ID = 'rise-alarm-channel';

// Check if Notifee is available (native build only)
let notifee: any = null;
let NotifeeTypes: any = {};

try {
  notifee = require('@notifee/react-native').default;
  NotifeeTypes = require('@notifee/react-native');
} catch (e) {
  console.log('Notifee not available - running in Expo Go mode');
}

const isNotifeeAvailable = (): boolean => notifee !== null;

/**
 * Initialize notification channel (required for Android)
 */
export async function initializeNotifications(): Promise<void> {
  if (!isNotifeeAvailable()) {
    console.log('[Expo Go] Notification initialization skipped');
    return;
  }

  const { AndroidImportance, AndroidVisibility } = NotifeeTypes;

  // Create a channel for alarm notifications (Android)
  await notifee.createChannel({
    id: ALARM_CHANNEL_ID,
    name: 'Alarms',
    description: 'Alarm notifications',
    importance: AndroidImportance.HIGH,
    visibility: AndroidVisibility.PUBLIC,
    sound: 'default',
    vibration: true,
    lights: true,
  });

  console.log('Notification channel initialized');
}

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (!isNotifeeAvailable()) {
    console.log('[Expo Go] Permission request skipped');
    return true; // Simulate success in Expo Go
  }

  const settings = await notifee.requestPermission();
  return settings.authorizationStatus >= 1; // 1 = authorized
}

/**
 * Schedule an alarm notification
 */
export async function scheduleAlarm(alarm: Alarm): Promise<void> {
  if (!alarm.enabled) {
    console.log(`Alarm ${alarm.id} is disabled, skipping schedule`);
    return;
  }

  const nextAlarmDate = getNextAlarmDate(alarm);
  const timeString = formatAlarmTime(alarm.hour, alarm.minute);

  if (!isNotifeeAvailable()) {
    console.log(`[Expo Go] Would schedule alarm ${alarm.id} for ${nextAlarmDate.toLocaleString()}`);
    return;
  }

  const { AndroidImportance, AndroidCategory, TriggerType } = NotifeeTypes;

  // Cancel any existing notification for this alarm
  await cancelAlarm(alarm.id);

  // Build the notification
  const notification = {
    id: alarm.id,
    title: alarm.label || 'Alarm',
    body: `It's ${timeString} - Time to wake up!`,
    android: {
      channelId: ALARM_CHANNEL_ID,
      importance: AndroidImportance.HIGH,
      category: AndroidCategory.ALARM,
      fullScreenAction: {
        id: 'default',
      },
      pressAction: {
        id: 'default',
      },
      actions: [
        {
          title: 'Dismiss',
          pressAction: {
            id: 'dismiss',
          },
        },
        ...(alarm.snoozeEnabled ? [{
          title: `Snooze (${alarm.snoozeDurationMinutes}m)`,
          pressAction: {
            id: 'snooze',
          },
        }] : []),
      ],
      sound: 'default',
      vibrationPattern: [500, 500, 500, 500],
      lights: ['#FF9F43', 500, 500],
    },
    ios: {
      sound: 'default',
      critical: true,
      interruptionLevel: 'timeSensitive',
    },
  };

  // Create the trigger
  const trigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: nextAlarmDate.getTime(),
    alarmManager: {
      allowWhileIdle: true,
    },
  };

  // Schedule the notification
  await notifee.createTriggerNotification(notification, trigger);

  console.log(`Scheduled alarm ${alarm.id} for ${nextAlarmDate.toLocaleString()}`);
}

/**
 * Cancel a scheduled alarm
 */
export async function cancelAlarm(alarmId: string): Promise<void> {
  if (!isNotifeeAvailable()) {
    console.log(`[Expo Go] Would cancel alarm ${alarmId}`);
    return;
  }

  await notifee.cancelTriggerNotification(alarmId);
  console.log(`Cancelled alarm ${alarmId}`);
}

/**
 * Cancel all scheduled alarms
 */
export async function cancelAllAlarms(): Promise<void> {
  if (!isNotifeeAvailable()) {
    console.log('[Expo Go] Would cancel all alarms');
    return;
  }

  await notifee.cancelAllNotifications();
  console.log('Cancelled all alarms');
}

/**
 * Reschedule all enabled alarms
 * Useful for when the app starts or after time zone changes
 */
export async function rescheduleAllAlarms(alarms: Alarm[]): Promise<void> {
  // Cancel all existing notifications first
  await cancelAllAlarms();

  // Schedule all enabled alarms
  for (const alarm of alarms) {
    if (alarm.enabled) {
      await scheduleAlarm(alarm);
    }
  }

  console.log(`Rescheduled ${alarms.filter(a => a.enabled).length} alarms`);
}

/**
 * Handle snooze action
 */
export async function snoozeAlarm(alarm: Alarm): Promise<void> {
  const snoozeTime = new Date(Date.now() + alarm.snoozeDurationMinutes * 60 * 1000);
  const timeString = formatAlarmTime(alarm.hour, alarm.minute);

  if (!isNotifeeAvailable()) {
    console.log(`[Expo Go] Would snooze alarm ${alarm.id} for ${alarm.snoozeDurationMinutes} minutes`);
    return;
  }

  const { AndroidImportance, AndroidCategory, TriggerType } = NotifeeTypes;

  const notification = {
    id: `${alarm.id}_snooze`,
    title: `Snoozed: ${alarm.label || 'Alarm'}`,
    body: `Originally ${timeString} - Wake up in ${alarm.snoozeDurationMinutes} minutes!`,
    android: {
      channelId: ALARM_CHANNEL_ID,
      importance: AndroidImportance.HIGH,
      category: AndroidCategory.ALARM,
      fullScreenAction: {
        id: 'default',
      },
      pressAction: {
        id: 'default',
      },
      actions: [
        {
          title: 'Dismiss',
          pressAction: {
            id: 'dismiss',
          },
        },
      ],
      sound: 'default',
      vibrationPattern: [500, 500, 500, 500],
    },
    ios: {
      sound: 'default',
      critical: true,
      interruptionLevel: 'timeSensitive',
    },
  };

  const trigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: snoozeTime.getTime(),
    alarmManager: {
      allowWhileIdle: true,
    },
  };

  await notifee.createTriggerNotification(notification, trigger);
  console.log(`Snoozed alarm ${alarm.id} for ${alarm.snoozeDurationMinutes} minutes`);
}

/**
 * Get all pending alarm triggers
 */
export async function getPendingAlarms(): Promise<string[]> {
  if (!isNotifeeAvailable()) {
    console.log('[Expo Go] No pending alarms in Expo Go mode');
    return [];
  }

  const triggers = await notifee.getTriggerNotificationIds();
  return triggers;
}

/**
 * Display an immediate test notification
 */
export async function displayTestNotification(): Promise<void> {
  if (!isNotifeeAvailable()) {
    console.log('[Expo Go] Test notification not available');
    return;
  }

  const { AndroidImportance } = NotifeeTypes;

  await notifee.displayNotification({
    title: 'RiseAlarm Test',
    body: 'Notifications are working correctly!',
    android: {
      channelId: ALARM_CHANNEL_ID,
      importance: AndroidImportance.HIGH,
    },
    ios: {
      sound: 'default',
    },
  });
}
