import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alarm, CreateAlarmInput, UpdateAlarmInput } from '@/types/alarm';
import { scheduleAlarm, cancelAlarm, rescheduleAllAlarms } from '@/services/alarmScheduler';

const STORAGE_KEY = '@rise_alarm/alarms';

// Generate unique ID
function generateId(): string {
  return `alarm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Context value type
interface AlarmContextValue {
  alarms: Alarm[];
  isLoading: boolean;
  // CRUD operations
  addAlarm: (input: CreateAlarmInput) => Promise<Alarm>;
  updateAlarm: (input: UpdateAlarmInput) => Promise<void>;
  deleteAlarm: (id: string) => Promise<void>;
  // Convenience methods
  toggleAlarm: (id: string) => Promise<void>;
  getAlarm: (id: string) => Alarm | undefined;
  // Sorted alarms by time
  sortedAlarms: Alarm[];
  // Active alarms only
  activeAlarms: Alarm[];
}

const AlarmContext = createContext<AlarmContextValue | null>(null);

// Provider component
export function AlarmProvider({ children }: { children: React.ReactNode }) {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load alarms from storage on mount
  useEffect(() => {
    loadAlarms();
  }, []);

  // Load alarms from AsyncStorage and reschedule
  const loadAlarms = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Alarm[];
        setAlarms(parsed);
        console.log(`Loaded ${parsed.length} alarms from storage`);
        // Reschedule all enabled alarms
        await rescheduleAllAlarms(parsed);
      }
    } catch (error) {
      console.error('Failed to load alarms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save alarms to AsyncStorage
  const saveAlarms = async (newAlarms: Alarm[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newAlarms));
      console.log(`Saved ${newAlarms.length} alarms to storage`);
    } catch (error) {
      console.error('Failed to save alarms:', error);
    }
  };

  // Add a new alarm
  const addAlarm = useCallback(async (input: CreateAlarmInput): Promise<Alarm> => {
    const now = Date.now();
    const newAlarm: Alarm = {
      ...input,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };

    const newAlarms = [...alarms, newAlarm];
    setAlarms(newAlarms);
    await saveAlarms(newAlarms);

    // Schedule the alarm if enabled
    if (newAlarm.enabled) {
      await scheduleAlarm(newAlarm);
    }

    return newAlarm;
  }, [alarms]);

  // Update an existing alarm
  const updateAlarm = useCallback(async (input: UpdateAlarmInput) => {
    const newAlarms = alarms.map(alarm =>
      alarm.id === input.id
        ? { ...alarm, ...input, updatedAt: Date.now() }
        : alarm
    );
    setAlarms(newAlarms);
    await saveAlarms(newAlarms);

    // Reschedule the alarm
    const updatedAlarm = newAlarms.find(a => a.id === input.id);
    if (updatedAlarm) {
      if (updatedAlarm.enabled) {
        await scheduleAlarm(updatedAlarm);
      } else {
        await cancelAlarm(updatedAlarm.id);
      }
    }
  }, [alarms]);

  // Delete an alarm
  const deleteAlarm = useCallback(async (id: string) => {
    const newAlarms = alarms.filter(alarm => alarm.id !== id);
    setAlarms(newAlarms);
    await saveAlarms(newAlarms);

    // Cancel the scheduled notification
    await cancelAlarm(id);
  }, [alarms]);

  // Toggle alarm enabled/disabled
  const toggleAlarm = useCallback(async (id: string) => {
    const newAlarms = alarms.map(alarm =>
      alarm.id === id
        ? { ...alarm, enabled: !alarm.enabled, updatedAt: Date.now() }
        : alarm
    );
    setAlarms(newAlarms);
    await saveAlarms(newAlarms);

    // Schedule or cancel based on new state
    const toggledAlarm = newAlarms.find(a => a.id === id);
    if (toggledAlarm) {
      if (toggledAlarm.enabled) {
        await scheduleAlarm(toggledAlarm);
      } else {
        await cancelAlarm(id);
      }
    }
  }, [alarms]);

  // Get single alarm by ID
  const getAlarm = useCallback(
    (id: string) => alarms.find(alarm => alarm.id === id),
    [alarms]
  );

  // Memoized sorted alarms (by time)
  const sortedAlarms = useMemo(() => {
    return [...alarms].sort((a, b) => {
      const timeA = a.hour * 60 + a.minute;
      const timeB = b.hour * 60 + b.minute;
      return timeA - timeB;
    });
  }, [alarms]);

  // Memoized active alarms
  const activeAlarms = useMemo(() => {
    return alarms.filter(alarm => alarm.enabled);
  }, [alarms]);

  const value: AlarmContextValue = {
    alarms,
    isLoading,
    addAlarm,
    updateAlarm,
    deleteAlarm,
    toggleAlarm,
    getAlarm,
    sortedAlarms,
    activeAlarms,
  };

  return (
    <AlarmContext.Provider value={value}>
      {children}
    </AlarmContext.Provider>
  );
}

// Hook to use alarm context
export function useAlarms(): AlarmContextValue {
  const context = useContext(AlarmContext);
  if (!context) {
    throw new Error('useAlarms must be used within an AlarmProvider');
  }
  return context;
}
