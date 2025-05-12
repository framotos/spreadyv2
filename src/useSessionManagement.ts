import { useState, useCallback, useEffect } from 'react';
import type { Session } from './types';
import { useSessionStorage } from './useSessionStorage';
import { useHtmlFileSelection } from './useHtmlFileSelection';

/**
 * Custom hook for consolidated session state management.
 * Combines session storage, API operations, and HTML file selection.
 */
export function useSessionManagement() {
  // Core session state
  const { currentSessionId, setCurrentSessionId } = useSessionStorage();
  const { selectedFile: selectedHtmlFile, selectFile, resetSelection } = useHtmlFileSelection();
  
  // Sessions state
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load sessions from API
  const loadSessions = useCallback(async () => {
    // This is a placeholder - in the real implementation, this would call the API
    setIsLoading(false);
    return [];
  }, []);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Handler for session selection
  const handleSessionSelect = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId);
    resetSelection(); // Reset HTML file selection when switching sessions
  }, [setCurrentSessionId, resetSelection]);
  
  // Handler for HTML file selection
  const handleHtmlFileSelect = useCallback((fileName: string, outputFolder: string, sessionId: string) => {
    setCurrentSessionId(sessionId);
    selectFile(fileName, outputFolder, sessionId);
  }, [setCurrentSessionId, selectFile]);

  // Handler for session updates
  const updateSession = useCallback((updatedSession?: Session) => {
    if (!updatedSession) return;
    
    setSessions(prevSessions => {
      const index = prevSessions.findIndex(s => s.id === updatedSession.id);
      if (index === -1) {
        // Add new session
        return [updatedSession, ...prevSessions];
      } else {
        // Update existing session
        const updatedSessions = [...prevSessions];
        updatedSessions[index] = updatedSession;
        return updatedSessions;
      }
    });
  }, []);

  return {
    // Core state
    currentSessionId,
    selectedFile: selectedHtmlFile,
    sessions,
    isLoading,
    error,
    
    // Actions
    handleSessionSelect,
    handleHtmlFileSelect,
    updateSession,
    loadSessions,
    
    // Error handling
    setError,
    clearError: () => setError(null)
  };
} 