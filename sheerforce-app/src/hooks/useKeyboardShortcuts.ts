import { useEffect } from 'react';

export interface ShortcutHandlers {
  onSave?: () => void;
  onLoad?: () => void;
  onExport?: () => void;
  onNew?: () => void;
  onCalculate?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onShowShortcuts?: () => void;
}

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  description: string;
  action: string;
}

export const KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
  {
    key: 's',
    ctrlKey: true,
    description: 'Save current project',
    action: 'save'
  },
  {
    key: 'o',
    ctrlKey: true,
    description: 'Open/Load project',
    action: 'load'
  },
  {
    key: 'e',
    ctrlKey: true,
    description: 'Export PDF',
    action: 'export'
  },
  {
    key: 'n',
    ctrlKey: true,
    description: 'New beam (clear all)',
    action: 'new'
  },
  {
    key: 'Enter',
    ctrlKey: true,
    description: 'Calculate diagrams',
    action: 'calculate'
  },
  {
    key: 'z',
    ctrlKey: true,
    description: 'Undo last change',
    action: 'undo'
  },
  {
    key: 'z',
    ctrlKey: true,
    shiftKey: true,
    description: 'Redo last undone change',
    action: 'redo'
  },
  {
    key: '/',
    ctrlKey: true,
    description: 'Show keyboard shortcuts',
    action: 'showShortcuts'
  }
];

/**
 * Custom hook for handling keyboard shortcuts
 */
export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Detect Ctrl/Cmd key (cross-platform)
      const isMod = e.ctrlKey || e.metaKey;

      // Don't trigger shortcuts when typing in input fields
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Ctrl/Cmd + S: Save
      if (isMod && e.key === 's' && !e.shiftKey) {
        e.preventDefault();
        handlers.onSave?.();
        return;
      }

      // Ctrl/Cmd + O: Load
      if (isMod && e.key === 'o' && !e.shiftKey) {
        e.preventDefault();
        handlers.onLoad?.();
        return;
      }

      // Ctrl/Cmd + E: Export
      if (isMod && e.key === 'e' && !e.shiftKey) {
        e.preventDefault();
        handlers.onExport?.();
        return;
      }

      // Ctrl/Cmd + N: New
      if (isMod && e.key === 'n' && !e.shiftKey) {
        e.preventDefault();
        handlers.onNew?.();
        return;
      }

      // Ctrl/Cmd + Enter: Calculate
      if (isMod && e.key === 'Enter') {
        e.preventDefault();
        handlers.onCalculate?.();
        return;
      }

      // Ctrl/Cmd + Z: Undo (without Shift)
      if (isMod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handlers.onUndo?.();
        return;
      }

      // Ctrl/Cmd + Shift + Z: Redo
      if (isMod && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        handlers.onRedo?.();
        return;
      }

      // Ctrl/Cmd + /: Show shortcuts
      if (isMod && e.key === '/') {
        e.preventDefault();
        handlers.onShowShortcuts?.();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handlers]);
}
