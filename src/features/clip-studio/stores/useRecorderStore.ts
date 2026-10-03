import { create } from 'zustand';
import { RecordedClip } from '../types';
import { screenCaptureService } from '../services/screenCaptureService';

interface RecorderState {
  isRecording: boolean;
  isPaused: boolean;
  recordingDurationSeconds: number;
  includeMic: boolean;
  recordedClip: RecordedClip | null;
  isStudioOpen: boolean;
  errorMessage: string | null;

  startRecording: () => Promise<void>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  stopRecording: () => Promise<void>;
  cancelRecording: () => void;
  toggleMic: () => void;
  openStudio: (clip?: RecordedClip) => void;
  closeStudio: () => void;
  incrementTimer: () => void;
  clearError: () => void;
}

export const useRecorderStore = create<RecorderState>((set, get) => {
  let timerInterval: ReturnType<typeof setInterval> | null = null;

  const startTimer = () => {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      const { isRecording, isPaused } = get();
      if (isRecording && !isPaused) {
        set((state) => ({ recordingDurationSeconds: state.recordingDurationSeconds + 1 }));
      }
    }, 1000);
  };

  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  };

  return {
    isRecording: false,
    isPaused: false,
    recordingDurationSeconds: 0,
    includeMic: false,
    recordedClip: null,
    isStudioOpen: false,
    errorMessage: null,

    startRecording: async () => {
      try {
        set({ errorMessage: null, recordingDurationSeconds: 0 });
        const includeMic = get().includeMic;

        await screenCaptureService.startCapture(includeMic, (clip) => {
          // Triggered if stopped via browser UI (e.g. Chrome's "Stop sharing" button)
          stopTimer();
          set({
            isRecording: false,
            isPaused: false,
            recordedClip: clip,
            isStudioOpen: true,
          });
        });

        set({ isRecording: true, isPaused: false });
        startTimer();
      } catch (err: unknown) {
        stopTimer();
        const msg = err instanceof Error ? err.message : String(err);
        if (!msg.includes('cancelled')) {
          set({ errorMessage: msg });
        }
      }
    },

    pauseRecording: () => {
      screenCaptureService.pause();
      set({ isPaused: true });
    },

    resumeRecording: () => {
      screenCaptureService.resume();
      set({ isPaused: false });
    },

    stopRecording: async () => {
      stopTimer();
      try {
        const clip = await screenCaptureService.stop();
        set({
          isRecording: false,
          isPaused: false,
          recordedClip: clip,
          isStudioOpen: true,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        set({ isRecording: false, isPaused: false, errorMessage: msg });
      }
    },

    cancelRecording: () => {
      stopTimer();
      screenCaptureService.cancel();
      set({
        isRecording: false,
        isPaused: false,
        recordingDurationSeconds: 0,
      });
    },

    toggleMic: () => {
      set((state) => ({ includeMic: !state.includeMic }));
    },

    openStudio: (clip) => {
      set({
        isStudioOpen: true,
        recordedClip: clip || get().recordedClip,
      });
    },

    closeStudio: () => {
      set({ isStudioOpen: false });
    },

    incrementTimer: () => {
      set((state) => ({ recordingDurationSeconds: state.recordingDurationSeconds + 1 }));
    },

    clearError: () => {
      set({ errorMessage: null });
    },
  };
});
