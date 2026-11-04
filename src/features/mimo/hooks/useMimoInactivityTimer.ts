import { useEffect } from 'react';
import { useMimoStore } from '../stores/useMimoStore';

const INACTIVITY_TIMEOUT_MS = 30000; // 30 seconds

/**
 * Hook to manage Mimo 30-second idle inactivity sleep timer.
 * If user does not interact with Mimo for 30 seconds, Mimo transitions
 * both the bottom-right floating mascot and drawer avatar to 'sleeping' state.
 */
export function useMimoInactivityTimer() {
  const lastActive = useMimoStore((s) => s.lastMimoInteractionTime);
  const mascotState = useMimoStore((s) => s.mascotState);
  const setMascotState = useMimoStore((s) => s.setMascotState);

  useEffect(() => {
    // If Mimo is currently busy (thinking or typing), don't put to sleep
    if (mascotState === 'thinking' || mascotState === 'typing') {
      return;
    }

    const checkInactivity = () => {
      const now = Date.now();
      const elapsed = now - (lastActive || now);
      if (elapsed >= INACTIVITY_TIMEOUT_MS) {
        if (mascotState !== 'sleeping') {
          setMascotState('sleeping');
        }
      }
    };

    const interval = setInterval(checkInactivity, 1000);
    return () => clearInterval(interval);
  }, [lastActive, mascotState, setMascotState]);
}
