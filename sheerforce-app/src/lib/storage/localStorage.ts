/**
 * LocalStorage Interface
 *
 * Utilities for browser localStorage operations with compression and error handling.
 */

const STORAGE_PREFIX = 'sheerforce_';
const AUTO_SAVE_KEY = `${STORAGE_PREFIX}autosave`;
const PROJECTS_KEY = `${STORAGE_PREFIX}projects`;

/**
 * Save data to localStorage with error handling
 */
export function saveToLocalStorage<T>(key: string, data: T): boolean {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, serialized);
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    // Handle quota exceeded error
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn('LocalStorage quota exceeded. Consider clearing old projects.');
    }
    return false;
  }
}

/**
 * Load data from localStorage with error handling
 */
export function loadFromLocalStorage<T>(key: string): T | null {
  try {
    const serialized = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (!serialized) return null;

    const parsed = JSON.parse(serialized);

    // Convert date strings back to Date objects
    return reviveDates(parsed);
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return null;
  }
}

/**
 * Remove data from localStorage
 */
export function removeFromLocalStorage(key: string): boolean {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
    return true;
  } catch (error) {
    console.error('Error removing from localStorage:', error);
    return false;
  }
}

/**
 * Clear all SheerForce data from localStorage
 */
export function clearAllStorage(): boolean {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
}

/**
 * Get storage statistics
 */
export function getStorageStats(): {
  used: number;
  total: number;
  percentage: number;
} {
  try {
    let used = 0;
    const keys = Object.keys(localStorage);

    keys.forEach((key) => {
      if (key.startsWith(STORAGE_PREFIX)) {
        const item = localStorage.getItem(key);
        if (item) {
          used += item.length;
        }
      }
    });

    // Most browsers have a 5MB limit for localStorage
    const total = 5 * 1024 * 1024;
    const percentage = (used / total) * 100;

    return { used, total, percentage };
  } catch (error) {
    console.error('Error getting storage stats:', error);
    return { used: 0, total: 5 * 1024 * 1024, percentage: 0 };
  }
}

/**
 * Check if localStorage is available
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Revive Date objects from JSON
 */
function reviveDates(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(reviveDates);
  }

  const result: any = {};
  for (const key of Object.keys(obj)) {
    const value = obj[key];

    // Check if the value looks like an ISO date string
    if (
      typeof value === 'string' &&
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)
    ) {
      result[key] = new Date(value);
    } else if (typeof value === 'object') {
      result[key] = reviveDates(value);
    } else {
      result[key] = value;
    }
  }

  return result;
}

export { AUTO_SAVE_KEY, PROJECTS_KEY };
