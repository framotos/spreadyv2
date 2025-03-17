import { useState, useCallback, useEffect } from 'react';
import { Session } from '@/lib/types';
import { getSessions } from '@/lib/api';

/**
 * Custom Hook zur Verwaltung der Session-Daten.
 * Enthält die Logik zum Laden und Aktualisieren der Sessions.
 * 
 * @param currentSessionId Die aktuelle Session-ID (zum automatischen Neuladen bei Änderungen)
 * @returns Ein Objekt mit den Sessions, dem Ladezustand und Funktionen zur Aktualisierung
 */
export function useSessionData(currentSessionId: string | null) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /**
   * Lädt alle Sessions vom Backend.
   */
  const loadSessions = useCallback(async () => {
    try {
      console.log('useSessionData: Lade Sessions...');
      setIsLoading(true);
      const sessionsData = await getSessions();
      console.log('useSessionData: Sessions geladen:', sessionsData);
      setSessions(sessionsData);
    } catch (err) {
      console.error('useSessionData: Fehler beim Laden der Sitzungen:', err);
      // In einer erweiterten Version könnte hier ein Error-State gesetzt werden
    } finally {
      setIsLoading(false);
      console.log('useSessionData: Loading abgeschlossen');
    }
  }, []);

  // Lade Sessions bei Änderung der Session-ID oder beim ersten Rendern
  useEffect(() => {
    console.log('useSessionData: useEffect mit currentSessionId =', currentSessionId);
    loadSessions();
  }, [currentSessionId, loadSessions]);

  /**
   * Aktualisiert eine bestimmte Session oder lädt alle Sessions neu.
   */
  const updateSession = useCallback((updatedSession?: Session) => {
    if (updatedSession) {
      console.log('useSessionData: Aktualisiere Session:', updatedSession);
      // Aktualisiere die Session direkt im State
      setSessions(prevSessions => {
        const sessionIndex = prevSessions.findIndex(s => s.id === updatedSession.id);
        if (sessionIndex !== -1) {
          // Session existiert bereits, aktualisiere sie
          const newSessions = [...prevSessions];
          newSessions[sessionIndex] = updatedSession;
          console.log('useSessionData: Session aktualisiert in der Liste');
          return newSessions;
        } else {
          // Neue Session, füge sie hinzu
          console.log('useSessionData: Neue Session hinzugefügt');
          return [updatedSession, ...prevSessions];
        }
      });
    } else {
      // Wenn keine Session übergeben wurde, lade alle Sessions neu
      console.log('useSessionData: Lade alle Sessions neu');
      loadSessions();
    }
  }, [loadSessions]);

  return {
    sessions,
    isLoading,
    loadSessions,
    updateSession
  };
} 