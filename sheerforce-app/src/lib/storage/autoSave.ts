/**
 * Auto-Save Functionality
 *
 * Automatic saving of beam state with debouncing.
 */

import type { Beam } from '../../types/beam';
import type { AutoSaveState } from './types';
import { saveToLocalStorage, loadFromLocalStorage, AUTO_SAVE_KEY } from './localStorage';

const AUTO_SAVE_DELAY = 2000; // 2 seconds

let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Auto-save beam state with debouncing
 */
export function autoSaveBeam(beam: Beam): void {
  // Clear any existing timer
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer);
  }

  // Set a new timer
  autoSaveTimer = setTimeout(() => {
    const state: AutoSaveState = {
      beam,
      timestamp: new Date(),
    };

    saveToLocalStorage(AUTO_SAVE_KEY, state);
    console.log('Auto-saved at', state.timestamp.toLocaleTimeString());
  }, AUTO_SAVE_DELAY);
}

/**
 * Load auto-saved beam state
 */
export function loadAutoSavedBeam(): AutoSaveState | null {
  try {
    const state = loadFromLocalStorage<AutoSaveState>(AUTO_SAVE_KEY);
    return state;
  } catch (error) {
    console.error('Error loading auto-saved beam:', error);
    return null;
  }
}

/**
 * Clear auto-save state
 */
export function clearAutoSave(): void {
  saveToLocalStorage(AUTO_SAVE_KEY, null);
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = null;
  }
}

/**
 * Check if there's a recent auto-save (within last hour)
 */
export function hasRecentAutoSave(): boolean {
  const state = loadAutoSavedBeam();
  if (!state) return false;

  const now = new Date().getTime();
  const saveTime = new Date(state.timestamp).getTime();
  const oneHour = 60 * 60 * 1000;

  return now - saveTime < oneHour;
}
