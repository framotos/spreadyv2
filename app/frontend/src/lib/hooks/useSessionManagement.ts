import { useState, useEffect } from 'react';
import { Session, HtmlFile } from '@/lib/types';
import { getSessions } from '@/lib/api';
import { generateUUID } from '@/lib/utils';

/**
 * Custom Hook zur Verwaltung von Sessions in der Anwendung.
 * Dieser Hook übernimmt die Verantwortung für:
 * - Laden und Speichern der aktuellen Session-ID im localStorage
 * - Laden aller Sessions vom Backend
 * - Aktualisieren von Sessions im State
 * - Handling von HTML-Datei-Auswahlen
 * 
 * @returns Ein Objekt mit Funktionen und State zur Session-Verwaltung
 */
export function useSessionManagement() {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [selectedHtmlFile, setSelectedHtmlFile] = useState<HtmlFile | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState<boolean>(true);

  // Beim ersten Laden eine neue Sitzung erstellen oder die letzte Sitzung aus dem lokalen Speicher laden
  useEffect(() => {
    // Auf Client-Seite ausführen
    if (typeof window !== 'undefined') {
      // Lade die gespeicherte Session-ID oder erstelle eine neue
      initializeSession();
      
      // Lade alle Sessions
      loadSessions();
    }
  }, []);

  // Aktualisiere den lokalen Speicher, wenn sich die aktuelle Sitzung ändert
  useEffect(() => {
    if (currentSessionId && typeof window !== 'undefined') {
      try {
        localStorage.setItem('currentSessionId', currentSessionId);
      } catch (error) {
        console.error('Fehler beim Speichern der Session-ID:', error);
      }
    }
  }, [currentSessionId]);

  /**
   * Initialisiert die Session beim ersten Laden der Anwendung.
   * Lädt die Session-ID aus dem localStorage oder erstellt eine neue.
   */
  const initializeSession = () => {
    if (typeof window === 'undefined') return;
    
    try {
      const savedSessionId = localStorage.getItem('currentSessionId');
      if (savedSessionId) {
        setCurrentSessionId(savedSessionId);
      } else {
        // Erstelle eine neue Sitzung
        const newSessionId = generateUUID();
        setCurrentSessionId(newSessionId);
        localStorage.setItem('currentSessionId', newSessionId);
      }
    } catch (error) {
      console.error('Fehler bei der Session-Initialisierung:', error);
      // Fallback: Erstelle trotzdem eine neue Session, auch wenn localStorage nicht verfügbar ist
      const newSessionId = generateUUID();
      setCurrentSessionId(newSessionId);
    }
  };

  /**
   * Lädt alle Sessions vom Backend.
   */
  const loadSessions = async () => {
    try {
      setIsLoadingSessions(true);
      const sessionsData = await getSessions();
      setSessions(sessionsData);
    } catch (err) {
      console.error('Fehler beim Laden der Sitzungen:', err);
      // TODO: Implementiere bessere Fehlerbehandlung (z.B. mit einem Error-State)
    } finally {
      setIsLoadingSessions(false);
    }
  };

  /**
   * Handler für die Auswahl einer Sitzung.
   */
  const handleSessionSelect = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setSelectedHtmlFile(null); // Zurücksetzen der HTML-Dateiauswahl bei Sitzungswechsel
    
    // Lade die Sessions neu, um sicherzustellen, dass die Sidebar aktualisiert wird
    loadSessions();
  };
  
  /**
   * Handler für die Auswahl einer HTML-Datei.
   */
  const handleHtmlFileSelect = (fileName: string, outputFolder: string, sessionId: string) => {
    setCurrentSessionId(sessionId);
    setSelectedHtmlFile({ fileName, outputFolder });
  };
  
  /**
   * Handler für die Aktualisierung einer Session.
   */
  const handleSessionUpdate = (updatedSession?: Session) => {
    if (updatedSession) {
      // Aktualisiere die Session direkt im State
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
  };

  // Rückgabewerte des Hooks
  return {
    currentSessionId,
    selectedHtmlFile,
    sessions,
    isLoadingSessions,
    handleSessionSelect,
    handleHtmlFileSelect,
    handleSessionUpdate,
    loadSessions
  };
} 