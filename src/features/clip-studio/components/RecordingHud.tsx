import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Play, X, Mic, MicOff, Check } from 'lucide-react';
import { useRecorderStore } from '../stores/useRecorderStore';

export const RecordingHud: React.FC = () => {
  const isRecording = useRecorderStore((s) => s.isRecording);
  const isPaused = useRecorderStore((s) => s.isPaused);
  const recordingDurationSeconds = useRecorderStore((s) => s.recordingDurationSeconds);
  const includeMic = useRecorderStore((s) => s.includeMic);
  const pauseRecording = useRecorderStore((s) => s.pauseRecording);
  const resumeRecording = useRecorderStore((s) => s.resumeRecording);
  const stopRecording = useRecorderStore((s) => s.stopRecording);
  const cancelRecording = useRecorderStore((s) => s.cancelRecording);
  const toggleMic = useRecorderStore((s) => s.toggleMic);

  if (!isRecording) return null;

  const minutes = Math.floor(recordingDurationSeconds / 60);
  const seconds = recordingDurationSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <AnimatePresence>
      <div className="fixed bottom-6 right-6 md:right-10 z-[9999] pointer-events-none select-none">
        <motion.div
          initial={{ opacity: 0, y: 25, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="pointer-events-auto flex items-center gap-2 px-4 py-2.5 bg-neutral-950/90 dark:bg-neutral-900/95 backdrop-blur-xl border border-neutral-700/60 dark:border-neutral-800 rounded-full shadow-2xl shadow-black/60 text-white"
        >
          {/* Recording Status & Timer */}
          <div className="flex items-center gap-2.5 pr-2 border-r border-neutral-700/60 dark:border-neutral-800">
            <span className="relative flex h-3 w-3 items-center justify-center">
              {!isPaused && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isPaused ? 'bg-amber-400' : 'bg-red-500'
                }`}
              />
            </span>
            <div className="flex flex-col">
              <span className="font-mono text-xs font-semibold tracking-wider text-neutral-100">
                {formattedTime}
              </span>
              <span className="text-[9px] uppercase tracking-wider font-bold text-neutral-400">
                {isPaused ? 'Paused' : 'Recording'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 pl-1">
            {/* Pause / Resume */}
            <button
              type="button"
              onClick={isPaused ? resumeRecording : pauseRecording}
              title={isPaused ? 'Resume Recording' : 'Pause Recording'}
              className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800/80 active:scale-95 transition-all"
            >
              {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
            </button>

            {/* Mic Toggle */}
            <button
              type="button"
              onClick={toggleMic}
              title={includeMic ? 'Mute Mic' : 'Enable Mic'}
              className={`p-1.5 rounded-lg active:scale-95 transition-all ${
                includeMic
                  ? 'text-brand-400 bg-brand-500/20 hover:bg-brand-500/30'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/80'
              }`}
            >
              {includeMic ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>

            {/* Finish & Edit in Studio */}
            <button
              type="button"
              onClick={stopRecording}
              title="Finish & Edit in Studio"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white font-medium text-xs shadow-md shadow-brand-500/20 active:scale-95 transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Done</span>
            </button>

            {/* Cancel / Discard */}
            <button
              type="button"
              onClick={cancelRecording}
              title="Discard Recording"
              className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 active:scale-95 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
