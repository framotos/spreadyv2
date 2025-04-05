'use client';

import { useState, useEffect } from 'react';
import { Session } from '@/lib/types';
import { useAuth } from '@/lib/auth/AuthContext';
import { getSessions, createSession } from '@/lib/authenticatedApi';
import { generateUUID } from '@/lib/utils';

/**
 * Custom Hook zur Verwaltung der Session-Daten.
 * Enthält die Logik zum Laden und Aktualisieren der Sessions.
 * 
 * @param currentSessionId Die aktuelle Session-ID (zum automatischen Neuladen bei Änderungen)
 * @returns Ein Objekt mit den Sessions, dem Ladezustand und Funktionen zur Aktualisierung
 */
export const useSessionData = (currentSessionId: string | null) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Lade Sitzungen vom Backend, wenn der Benutzer angemeldet ist
  useEffect(() => {
    const fetchSessions = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const fetchedSessions = await getSessions();
        setSessions(fetchedSessions);
      } catch (error) {
        console.error('Fehler beim Laden der Sitzungen:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, [user]);

  /**
   * Erstelle eine neue Sitzung, wenn keine existiert und currentSessionId gesetzt ist
   */
  useEffect(() => {
    const initializeSession = async () => {
      if (currentSessionId && sessions.length === 0 && !isLoading && user) {
        try {
          const sessionId = generateUUID();
          const newSession = await createSession(sessionId);
          setSessions([newSession]);
        } catch (error) {
          console.error('Fehler beim Erstellen der Sitzung:', error);
        }
      }
    };

    initializeSession();
  }, [currentSessionId, sessions, isLoading, user]);

  /**
   * Aktualisiere eine Sitzung
   */
  const updateSessionData = async (updatedSession?: Session) => {
    if (!updatedSession || !user) return;

    try {
      const index = sessions.findIndex(s => s.id === updatedSession.id);
      if (index === -1) {
        // Neue Sitzung hinzufügen
        setSessions(prev => [updatedSession, ...prev]);
      } else {
        // Bestehende Sitzung aktualisieren
        const updatedSessions = [...sessions];
        updatedSessions[index] = updatedSession;
        setSessions(updatedSessions);
      }
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Sitzung:', error);
    }
  };

  return {
    sessions,
    isLoading,
    updateSession: updateSessionData,
  };
}; 