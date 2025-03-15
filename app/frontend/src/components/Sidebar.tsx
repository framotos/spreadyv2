import React, { useState, useEffect } from 'react';
// TODO: BACKEND-INTEGRATION - Der Import von NavbarItem verursacht einen Linter-Fehler.
// Dies könnte an einem Pfadproblem oder einer fehlenden Datei liegen.
// Für die Produktion sollte dieser Fehler behoben werden.
import NavbarItem from '@/components/NavbarItem';
import { getSessions, createSession } from '@/lib/api';
import { Session, SidebarProps } from '@/lib/types';

const Sidebar: React.FC<SidebarProps> = ({ currentSessionId, onSessionSelect }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      // TODO: BACKEND-INTEGRATION - Diese Funktion ruft getSessions() auf, 
      // die aktuell Mock-Daten zurückgibt, wenn der API-Aufruf fehlschlägt.
      // Sobald das Backend implementiert ist, sollte dieser Fallback entfernt werden.
      try {
        setIsLoading(true);
        const sessionsData = await getSessions();
        console.log("Geladene Sessions:", sessionsData);
        setSessions(sessionsData);
      } catch (err) {
        console.error('Fehler beim Laden der Sitzungen:', err);
        setError('Sitzungen konnten nicht geladen werden');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const createNewChat = async () => {
    // TODO: BACKEND-INTEGRATION - Diese Funktion verwendet jetzt createSession(),
    // die aktuell eine lokale Sitzung erstellt. Sobald das Backend implementiert ist,
    // sollte die Funktion angepasst werden, um mit dem tatsächlichen Backend-Endpunkt zu arbeiten.
    try {
      // Erstellt eine neue Sitzung und wechselt zu ihr
      const newSessionId = crypto.randomUUID();
      
      // Erstelle eine neue Session über die API
      const newSession = await createSession(newSessionId);
      console.log("Neue Session erstellt:", newSession);
      
      // Füge die neue Session zum Array hinzu
      setSessions(prevSessions => {
        const updatedSessions = [newSession, ...prevSessions];
        console.log("Aktualisierte Sessions:", updatedSessions);
        return updatedSessions;
      });
      
      // Wechsle zur neuen Session
      onSessionSelect(newSessionId);
    } catch (err) {
      console.error('Fehler beim Erstellen eines neuen Chats:', err);
      setError('Neuer Chat konnte nicht erstellt werden');
    }
  };

  // Debug-Ausgabe für Sessions
  useEffect(() => {
    console.log("Sessions im State:", sessions);
  }, [sessions]);

  return (
    <div className="w-64 h-screen bg-gray-100 border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-gilroy font-bold">Chats</h2>
        <button 
          onClick={createNewChat}
          className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
        >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 13.3333V6.66667" stroke="#323232" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M6.66666 10H13.3333" stroke="#323232" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>

        </button>
      </div>

      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-500">Heute</h3>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">Lädt...</div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">{error}</div>
        ) : sessions.length === 0 ? (
          <div className="p-4 text-center text-gray-500">Keine Chats vorhanden</div>
        ) : (
          <div>
            {sessions.map((session) => (
              <NavbarItem
                key={session.id}
                session={session}
                isActive={session.id === currentSessionId}
                onClick={() => onSessionSelect(session.id)}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Sidebar; 