import { useLocalStorage } from './useLocalStorage';
import { useEffect } from 'react';
import { generateUUID } from '@/lib/utils';

/**
 * Custom Hook zur Verwaltung der Session-ID im localStorage.
 * Kümmert sich um die Initialisierung und Persistenz der Session-ID.
 * 
 * @returns Ein Objekt mit der aktuellen Session-ID und Funktionen zur Verwaltung
 */
export function useSessionStorage() {
  // Verwende useLocalStorage für die Persistenz
  const [sessionId, setSessionIdRaw] = useLocalStorage<string | null>('currentSessionId', null);
  
  console.log('useSessionStorage: Aktueller sessionId aus localStorage:', sessionId);

  // Generiere eine zufällige UUID (nur auf Client-Seite)
  const generateSessionUUID = () => {
    return generateUUID();
  };

  // Initialisiere die Session, wenn keine vorhanden ist
  const initializeSession = () => {
    console.log('useSessionStorage: initializeSession aufgerufen');
    if (!sessionId) {
      const newSessionId = generateSessionUUID();
      if (newSessionId) {
        console.log('useSessionStorage: Neue Session-ID erstellt:', newSessionId);
        setSessionIdRaw(newSessionId);
        return newSessionId;
      }
      return null; // Falls wir auf der Server-Seite sind
    }
    console.log('useSessionStorage: Bestehende Session-ID verwendet:', sessionId);
    return sessionId;
  };

  // Aktualisiere die Session-ID explizit
  const setSessionId = (id: string | null) => {
    console.log('useSessionStorage: setSessionId aufgerufen mit ID:', id);
    setSessionIdRaw(id);
  };

  // Initialisiere die Session automatisch beim ersten Client-seitigen Rendering
  useEffect(() => {
    if (!sessionId && typeof window !== 'undefined') {
      initializeSession();
    }
  }, [sessionId]);

  return {
    sessionId,
    setSessionId,
    initializeSession
  };
} 