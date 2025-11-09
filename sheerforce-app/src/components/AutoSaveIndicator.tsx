import { useState, useEffect } from 'react';
import type { Beam } from '../types/beam';
import { autoSaveBeam, loadAutoSavedBeam, hasRecentAutoSave } from '../lib/storage/autoSave';

interface AutoSaveIndicatorProps {
  beam: Beam | null;
  onRestoreAutoSave: (beam: Beam) => void;
}

export function AutoSaveIndicator({ beam, onRestoreAutoSave }: AutoSaveIndicatorProps) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Check for auto-save on mount
  useEffect(() => {
    if (hasRecentAutoSave() && !beam) {
      setShowRestorePrompt(true);
    }
  }, []);

  // Auto-save whenever beam changes
  useEffect(() => {
    if (!beam) return;

    setIsSaving(true);

    // Save with debounce (handled by autoSaveBeam)
    autoSaveBeam(beam);

    // Set a timer to update the UI after the debounce delay
    const timer = setTimeout(() => {
      setLastSaved(new Date());
      setIsSaving(false);
    }, 2100); // Slightly more than AUTO_SAVE_DELAY

    return () => clearTimeout(timer);
  }, [beam]);

  const handleRestore = () => {
    const autoSaved = loadAutoSavedBeam();
    if (autoSaved && autoSaved.beam) {
      onRestoreAutoSave(autoSaved.beam);
      setShowRestorePrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowRestorePrompt(false);
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    return 'over a day ago';
  };

  return (
    <>
      {/* Auto-save indicator in header */}
      {beam && (
        <div className="flex items-center gap-2 text-xs">
          {isSaving ? (
            <>
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
              <span className="text-gray-600">Saving...</span>
            </>
          ) : lastSaved ? (
            <>
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-gray-600">Saved {getTimeAgo(lastSaved)}</span>
            </>
          ) : null}
        </div>
      )}

      {/* Restore prompt */}
      {showRestorePrompt && (
        <div className="fixed bottom-4 right-4 bg-white rounded-xl shadow-2xl border-2 border-blue-500 p-5 max-w-sm z-50 animate-slideUp">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
              <svg className="text-blue-600" width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-1">Restore Previous Session?</h3>
              <p className="text-sm text-gray-600 mb-3">
                We found an auto-saved beam from your last session. Would you like to restore it?
              </p>

              <div className="flex gap-2">
                <button
                  onClick={handleRestore}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-semibold text-sm transition-colors duration-200"
                >
                  Restore
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold text-sm transition-colors duration-200"
                >
                  Dismiss
                </button>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
