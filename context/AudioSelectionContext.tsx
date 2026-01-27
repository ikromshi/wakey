import React, { createContext, useContext, useState, useCallback } from 'react';
import { AudioSource } from '@/types/alarm';

interface PendingAudioSelection {
  audioSource: AudioSource;
  audioName: string;
}

// Store draft alarm state when navigating to audio selection
interface DraftAlarmState {
  time: Date;
  label: string;
  repeatDays: string[];
}

interface AudioSelectionContextValue {
  // Pending audio selection
  pendingSelection: PendingAudioSelection | null;
  setPendingSelection: (selection: PendingAudioSelection | null) => void;
  clearPendingSelection: () => void;

  // Draft alarm state preservation
  draftAlarmState: DraftAlarmState | null;
  saveDraftAlarmState: (state: DraftAlarmState) => void;
  clearDraftAlarmState: () => void;
}

const AudioSelectionContext = createContext<AudioSelectionContextValue | null>(null);

export function AudioSelectionProvider({ children }: { children: React.ReactNode }) {
  const [pendingSelection, setPendingSelection] = useState<PendingAudioSelection | null>(null);
  const [draftAlarmState, setDraftAlarmState] = useState<DraftAlarmState | null>(null);

  const clearPendingSelection = useCallback(() => {
    setPendingSelection(null);
  }, []);

  const saveDraftAlarmState = useCallback((state: DraftAlarmState) => {
    setDraftAlarmState(state);
  }, []);

  const clearDraftAlarmState = useCallback(() => {
    setDraftAlarmState(null);
  }, []);

  return (
    <AudioSelectionContext.Provider value={{
      pendingSelection,
      setPendingSelection,
      clearPendingSelection,
      draftAlarmState,
      saveDraftAlarmState,
      clearDraftAlarmState,
    }}>
      {children}
    </AudioSelectionContext.Provider>
  );
}

export function useAudioSelection(): AudioSelectionContextValue {
  const context = useContext(AudioSelectionContext);
  if (!context) {
    throw new Error('useAudioSelection must be used within an AudioSelectionProvider');
  }
  return context;
}
