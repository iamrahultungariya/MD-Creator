import { useState, useEffect, useCallback } from 'react';

export type CommandPaletteTrigger = 'keyboard' | 'click';

export interface CommandPaletteOriginRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [triggerType, setTriggerType] = useState<CommandPaletteTrigger>('keyboard');
  const [originRect, setOriginRect] = useState<CommandPaletteOriginRect | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Trigger with Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        // Prevent default browser search behavior
        e.preventDefault();
        setTriggerType('keyboard');
        setOriginRect(null);
        setIsOpen((prev) => !prev);
      }
    };

    const handleCustomOpen = (e: Event) => {
      const ce = e as CustomEvent<{
        trigger?: CommandPaletteTrigger;
        originRect?: CommandPaletteOriginRect;
      }>;
      setTriggerType(ce.detail?.trigger || 'click');
      setOriginRect(ce.detail?.originRect || null);
      setIsOpen(true);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-command-palette', handleCustomOpen);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-command-palette', handleCustomOpen);
    };
  }, []);

  const openPalette = useCallback(
    (trigger: CommandPaletteTrigger = 'click', rect?: CommandPaletteOriginRect) => {
      setTriggerType(trigger);
      setOriginRect(rect || null);
      setIsOpen(true);
    },
    []
  );

  const closePalette = useCallback(() => {
    setIsOpen(false);
  }, []);

  const togglePalette = useCallback(
    (trigger: CommandPaletteTrigger = 'keyboard', rect?: CommandPaletteOriginRect) => {
      setIsOpen((prev) => {
        if (!prev) {
          setTriggerType(trigger);
          setOriginRect(rect || null);
          return true;
        }
        return false;
      });
    },
    []
  );

  return {
    isOpen,
    triggerType,
    originRect,
    openPalette,
    closePalette,
    togglePalette,
  };
}
