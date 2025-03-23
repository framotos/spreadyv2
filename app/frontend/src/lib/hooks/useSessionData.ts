import { useState, useCallback, useEffect, useRef } from 'react';
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
  const previousSessionId = useRef<string | null>(null);

  /**
   * Lädt alle Sessions vom Backend.
   */
  const loadSessions = useCallback(async () => {
    try {
      setIsLoading(true);
      const sessionsData = await getSessions();
      setSessions(sessionsData);
    } catch (err) {
      console.error('Fehler beim Laden der Sitzungen:', err);
    } finally {
      setIsLoading(false);
    }
  }, []); // keine Abhängigkeiten, sodass loadSessions stabil bleibt

  // Lade Sessions nur beim ersten Render und bei tatsächlicher Änderung der Session-ID
  useEffect(() => {
    // Nur laden, wenn sich die Session-ID tatsächlich geändert hat
    if (previousSessionId.current !== currentSessionId) {
      loadSessions();
      previousSessionId.current = currentSessionId;
    }
  }, [currentSessionId, loadSessions]);

  /**
   * Aktualisiert eine bestimmte Session oder lädt alle Sessions neu.
   */
  const updateSession = useCallback((updatedSession?: Session) => {
    if (updatedSession) {
      // Aktualisiere die Session direkt im State, ohne unnötige Neufetches
      setSessions(prevSessions => {
        const sessionIndex = prevSessions.findIndex(s => s.id === updatedSession.id);
        if (sessionIndex !== -1) {
          // Session existiert bereits, aktualisiere sie
          const newSessions = [...prevSessions];
          newSessions[sessionIndex] = updatedSession;
          return newSessions;
        } else {
          // Neue Session, füge sie hinzu
          return [updatedSession, ...prevSessions];
        }
      });
    } else {
      // Wenn keine Session übergeben wurde, lade alle Sessions neu
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