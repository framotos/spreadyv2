import { useState, useEffect, useCallback } from 'react';
import { useSessionStorage } from '@/lib/hooks/useSessionStorage';
import { Session } from '@/lib/types';
import { createSession } from '@/lib/api';
import { generateUUID } from '@/lib/utils';

// Session-Hook für die Verwaltung der aktuellen Session
export const useSession = () => {
  console.log('[FLOW-SESSION] useSession Hook initialisiert');
  
  // Verwende SessionStorage Hook, um auf gespeicherte Sessions und die aktuelle Session-ID zuzugreifen
  const { 
    sessions, 
    currentSessionId, 
    setCurrentSessionId, 
    setSessions, 
    getOrCreateCurrentSession,
    addOrUpdateSession
  } = useSessionStorage();

  // State für Fehlermeldungen
  const [error, setError] = useState<string | null>(null);
  
  // State für den Lade-Status
  const [loading, setLoading] = useState<boolean>(false);

  // Aktuelle Session basierend auf der ID finden oder eine neue erstellen
  const currentSession = getOrCreateCurrentSession();
  
  // Funktion zum Erstellen einer neuen Session
  const createNewSession = useCallback(async () => {
    console.log('[FLOW-SESSION] createNewSession aufgerufen');
    
    setLoading(true);
    setError(null);
    
    try {
      const sessionId = generateUUID();
      console.log('[FLOW-SESSION] Neue SessionID generiert:', sessionId);
      
      // Neue Session über API erstellen
      console.log('[FLOW-SESSION] Rufe createSession API auf');
      const newSession = await createSession(sessionId);
      console.log('[FLOW-SESSION] Neue Session erstellt:', newSession);
      
      // Sessions aktualisieren und neue Session als aktuelle setzen
      setSessions(prevSessions => [...prevSessions, newSession]);
      setCurrentSessionId(sessionId);
      
      console.log('[FLOW-SESSION] Aktuelle SessionID aktualisiert auf:', sessionId);
      return newSession;
    } catch (err) {
      console.error('[FLOW-SESSION] Fehler beim Erstellen einer neuen Session:', err);
      setError('Fehler beim Erstellen einer neuen Session.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [setCurrentSessionId, setSessions]);

  // Funktion zum Ändern der aktuellen Session
  const switchSession = useCallback((sessionId: string) => {
    console.log('[FLOW-SESSION] switchSession aufgerufen für SessionID:', sessionId);
    setCurrentSessionId(sessionId);
  }, [setCurrentSessionId]);

  // Funktion zum Aktualisieren einer Session
  const updateSession = useCallback((updatedSession: Session) => {
    console.log('[FLOW-SESSION] updateSession aufgerufen für SessionID:', updatedSession.id);
    addOrUpdateSession(updatedSession);
  }, [addOrUpdateSession]);

  // Effekt, der ausgeführt wird, wenn sich Sessions oder die aktuelle Session-ID ändert
  useEffect(() => {
    console.log('[FLOW-SESSION] useEffect: currentSessionId:', currentSessionId);
    console.log('[FLOW-SESSION] useEffect: sessions.length:', sessions.length);
    
    // Wenn es keine Sessions gibt und keine aktuelle Session-ID, erstelle eine neue Session
    if (sessions.length === 0 && !currentSessionId) {
      console.log('[FLOW-SESSION] Keine Sessions vorhanden, erstelle neue Session');
      createNewSession();
    }
    // Wenn keine aktuelle Session-ID gesetzt ist, aber Sessions existieren, setze die erste als aktuelle
    else if (!currentSessionId && sessions.length > 0) {
      console.log('[FLOW-SESSION] Setze erste Session als aktuelle Session');
      setCurrentSessionId(sessions[0].id);
    }
  }, [createNewSession, currentSessionId, sessions, setCurrentSessionId]);

  return {
    currentSession,
    sessions,
    loading,
    error,
    createNewSession,
    switchSession,
    updateSession
  };
}; 