import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Alarm, CreateAlarmInput, UpdateAlarmInput } from '@/types/alarm';

// Generate unique ID
function generateId(): string {
  return `alarm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Context value type
interface AlarmContextValue {
  alarms: Alarm[];
  // CRUD operations
  addAlarm: (input: CreateAlarmInput) => Alarm;
  updateAlarm: (input: UpdateAlarmInput) => void;
  deleteAlarm: (id: string) => void;
  // Convenience methods
  toggleAlarm: (id: string) => void;
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

  // Add a new alarm
  const addAlarm = useCallback((input: CreateAlarmInput): Alarm => {
    const now = Date.now();
    const newAlarm: Alarm = {
      ...input,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };

    setAlarms(prev => [...prev, newAlarm]);
    return newAlarm;
  }, []);

  // Update an existing alarm
  const updateAlarm = useCallback((input: UpdateAlarmInput) => {
    setAlarms(prev =>
      prev.map(alarm =>
        alarm.id === input.id
          ? { ...alarm, ...input, updatedAt: Date.now() }
          : alarm
      )
    );
  }, []);

  // Delete an alarm
  const deleteAlarm = useCallback((id: string) => {
    setAlarms(prev => prev.filter(alarm => alarm.id !== id));
  }, []);

  // Toggle alarm enabled/disabled
  const toggleAlarm = useCallback((id: string) => {
    setAlarms(prev =>
      prev.map(alarm =>
        alarm.id === id
          ? { ...alarm, enabled: !alarm.enabled, updatedAt: Date.now() }
          : alarm
      )
    );
  }, []);

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
