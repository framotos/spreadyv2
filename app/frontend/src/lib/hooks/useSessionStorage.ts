import { useLocalStorage } from './useLocalStorage';
import { useEffect, useRef, useState, useCallback } from 'react';
import { generateUUID } from '@/lib/utils';
import { Session } from '@/lib/types';
import { getSessions } from '@/lib/api';

/**
 * Custom Hook zur Verwaltung der Session-ID und Sessions im localStorage.
 * Kümmert sich um die Initialisierung und Persistenz der Session-ID sowie der Sessions.
 * 
 * @returns Ein Objekt mit der aktuellen Session-ID, Sessions und Funktionen zur Verwaltung
 */
export function useSessionStorage() {
  // Verwende useLocalStorage für die Persistenz
  const [currentSessionId, setCurrentSessionIdRaw] = useLocalStorage<string | null>('currentSessionId', null);
  const [sessions, setSessions] = useState<Session[]>([]);
  
  // Flag zur Vermeidung doppelter Initialisierungen
  const initialized = useRef(false);
  const sessionsLoaded = useRef(false);

  // Generiere eine zufällige UUID (nur auf Client-Seite)
  const generateSessionUUID = () => {
    return generateUUID();
  };

  // Initialisiere die Session, wenn keine vorhanden ist
  const initializeSession = useCallback(() => {
    // Verhindere doppelte Initialisierung
    if (initialized.current) {
      return currentSessionId;
    }
    
    if (!currentSessionId && typeof window !== 'undefined') {
      const newSessionId = generateSessionUUID();
      if (newSessionId) {
        setCurrentSessionIdRaw(newSessionId);
        initialized.current = true;
        return newSessionId;
      }
    } else {
      // Markiere als initialisiert, auch wenn die Session-ID existierte
      initialized.current = true;
    }
    
    return currentSessionId;
  }, [currentSessionId, setCurrentSessionIdRaw]);

  // Aktualisiere die Session-ID explizit
  const setCurrentSessionId = useCallback((id: string | null) => {
    setCurrentSessionIdRaw(id);
  }, [setCurrentSessionIdRaw]);

  // Lade Sessions vom Backend (nur wenn notwendig)
  const loadSessions = useCallback(async () => {
    if (sessionsLoaded.current) return sessions;
    
    try {
      const loadedSessions = await getSessions();
      setSessions(loadedSessions);
      sessionsLoaded.current = true;
      return loadedSessions;
    } catch (error) {
      console.error('Fehler beim Laden der Sessions:', error);
      return sessions;
    }
  }, [sessions]);

  // Aktuelle Session finden oder erstellen
  const getOrCreateCurrentSession = useCallback(() => {
    if (!currentSessionId) return null;
    
    const session = sessions.find(s => s.id === currentSessionId);
    return session || null;
  }, [currentSessionId, sessions]);

  // Session hinzufügen oder aktualisieren
  const addOrUpdateSession = useCallback((session: Session) => {
    setSessions(prevSessions => {
      const existingIndex = prevSessions.findIndex(s => s.id === session.id);
      
      if (existingIndex >= 0) {
        const updatedSessions = [...prevSessions];
        updatedSessions[existingIndex] = session;
        return updatedSessions;
      } else {
        return [...prevSessions, session];
      }
    });
  }, []);

  // Initialisiere die Session automatisch nur beim ersten Client-seitigen Rendering
  useEffect(() => {
    if (!initialized.current && typeof window !== 'undefined') {
      initializeSession();
    }
  }, [initializeSession]); 

  // Lade Sessions beim ersten Rendering
  useEffect(() => {
    if (!sessionsLoaded.current && typeof window !== 'undefined') {
      loadSessions();
    }
  }, [loadSessions]);

  return {
    currentSessionId,
    setCurrentSessionId,
    sessions,
    setSessions,
    initializeSession,
    getOrCreateCurrentSession,
    addOrUpdateSession,
    loadSessions
  };
} 